/**
 * 処方箋入力チャレンジ ランキング用 Google Apps Script
 *
 * 使い方：
 * 1. Googleスプレッドシートを新規作成
 * 2. 拡張機能 > Apps Script を開く
 * 3. この Code.gs の内容を貼り付ける
 * 4. デプロイ > 新しいデプロイ > ウェブアプリ
 * 5. 実行ユーザー：自分、アクセスできるユーザー：全員
 * 6. 発行された WebアプリURL を PWA の「GAS WebアプリURL」に入力
 */

const SHEET_NAME = 'scores';
const SHEET_ID_PROPERTY = 'RX_GAME_SCORE_SHEET_ID';
const HEADERS = [
  'CreatedAt',
  'Name',
  'Mode',
  'Score',
  'Accuracy',
  'LineAccuracy',
  'Seconds',
  'Prescriptions',
  'UserAgent',
  'Version'
];

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const callback = sanitizeCallback_(params.callback);

  try {
    const action = String(params.action || 'ranking');
    if (action === 'submit') {
      return output_(submitScore_(params), callback);
    }
    if (action === 'ranking') {
      return output_(getRanking_(params), callback);
    }
    if (action === 'ping') {
      return output_({ ok: true, message: 'pong' }, callback);
    }
    return output_({ ok: false, message: 'unknown action' }, callback);
  } catch (error) {
    return output_({ ok: false, message: error.message || String(error) }, callback);
  }
}

function submitScore_(params) {
  const lock = LockService.getScriptLock();
  lock.waitLock(8000);
  try {
    const sheet = getScoreSheet_();
    const now = new Date();
    const name = sanitizeText_(params.name || '名無し', 20) || '名無し';
    const mode = sanitizeMode_(params.mode || '1');
    const score = clampNumber_(params.score, 0, 99999999);
    const accuracy = clampNumber_(params.accuracy, 0, 1);
    const lineAccuracy = clampNumber_(params.lineAccuracy, 0, 1);
    const seconds = clampNumber_(params.seconds, 0, 86400);
    const prescriptions = clampNumber_(params.prescriptions, 0, 9999);
    const version = sanitizeText_(params.version || '', 20);
    const userAgent = sanitizeText_((params.ua || ''), 120);

    sheet.appendRow([
      now,
      name,
      mode,
      score,
      accuracy,
      lineAccuracy,
      seconds,
      prescriptions,
      userAgent,
      version
    ]);

    const ranking = getRanking_({ mode: mode, limit: 9999 }).items;
    const rank = ranking.findIndex(item => Number(item.score) === score && item.name === name && item.createdAt) + 1;

    return {
      ok: true,
      message: 'submitted',
      rank: rank || null
    };
  } finally {
    lock.releaseLock();
  }
}

function getRanking_(params) {
  const mode = sanitizeMode_(params.mode || 'all', true);
  const limit = Math.min(Math.max(Number(params.limit || 50), 1), 100);
  const sheet = getScoreSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return { ok: true, items: [] };
  }

  const items = values.slice(1).map(row => ({
    createdAt: row[0] instanceof Date ? row[0].toISOString() : String(row[0] || ''),
    name: String(row[1] || '名無し'),
    mode: String(row[2] || '1'),
    score: Number(row[3] || 0),
    accuracy: Number(row[4] || 0),
    lineAccuracy: Number(row[5] || 0),
    seconds: Number(row[6] || 0),
    prescriptions: Number(row[7] || 0),
    version: String(row[9] || '')
  }))
    .filter(item => mode === 'all' || item.mode === mode)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return a.seconds - b.seconds;
    })
    .slice(0, limit);

  return { ok: true, items };
}

function getScoreSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeader = firstRow.every(value => value === '');
  if (needsHeader) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy/mm/dd hh:mm:ss');
    sheet.getRange('D:D').setNumberFormat('0');
    sheet.getRange('E:F').setNumberFormat('0.00%');
  }
  return sheet;
}

function getSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty(SHEET_ID_PROPERTY);
  if (savedId) {
    return SpreadsheetApp.openById(savedId);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    props.setProperty(SHEET_ID_PROPERTY, active.getId());
    return active;
  }

  const created = SpreadsheetApp.create('処方箋入力チャレンジ_ランキング');
  props.setProperty(SHEET_ID_PROPERTY, created.getId());
  return created;
}

function output_(payload, callback) {
  const json = JSON.stringify(payload);
  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${json});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitizeCallback_(callback) {
  const text = String(callback || '');
  return /^[a-zA-Z_$][0-9a-zA-Z_$\.]*$/.test(text) ? text : '';
}

function sanitizeText_(value, maxLength) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/[\r\n\t]/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sanitizeMode_(value, allowAll) {
  const mode = String(value || '1');
  const allowed = allowAll ? ['all', '1', '3', '5', '10', 'endless'] : ['1', '3', '5', '10', 'endless'];
  return allowed.indexOf(mode) >= 0 ? mode : '1';
}

function clampNumber_(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}
