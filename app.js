(() => {
  'use strict';

  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbzKs2dbznSXPyNJWY0L2Wzfed5m834wBa8FLP9paAyaSJZ6dIx-eST16D3eTVICBs2rRw/exec';

  const STORAGE_KEYS = {
    player: 'rx_game_player_name',
    gasUrl: 'rx_game_gas_url',
    localScores: 'rx_game_local_scores'
  };

  const ASSIST_WORDS = [
    '1錠', '2錠', '1包', '2包', '分1', '分2', '分3', '朝食後', '夕食後', '毎食後',
    '就寝前', '疼痛時', '発熱時', '1日1回', '1日2回', '患部', '14日分', '28日分', '10回分'
  ];

  const MED_SETS = [
    {
      department: '内科', theme: '血圧管理', difficulty: '標準', note: '継続処方。日数と用法を確認して入力。',
      drugs: [
        { name: 'アムロジピンOD錠5mg', amounts: ['1錠'], usages: ['分1 朝食後'], days: [14, 28, 30], suffix: '日分' },
        { name: 'テルミサルタン錠40mg', amounts: ['1錠'], usages: ['分1 朝食後'], days: [14, 28, 30], suffix: '日分' },
        { name: 'ロスバスタチン錠2.5mg', amounts: ['1錠'], usages: ['分1 夕食後'], days: [14, 28, 30], suffix: '日分' },
        { name: '酸化マグネシウム錠330mg', amounts: ['3錠', '6錠'], usages: ['分3 毎食後'], days: [14, 28], suffix: '日分' }
      ]
    },
    {
      department: '整形外科', theme: '疼痛管理', difficulty: 'やさしい', note: '内服薬と頓服の回数を区別して入力。',
      drugs: [
        { name: 'ロキソプロフェンNa錠60mg', amounts: ['3錠'], usages: ['分3 毎食後'], days: [5, 7, 14], suffix: '日分' },
        { name: 'レバミピド錠100mg', amounts: ['3錠'], usages: ['分3 毎食後'], days: [5, 7, 14], suffix: '日分' },
        { name: 'ロキソプロフェンNa錠60mg', amounts: ['1錠'], usages: ['疼痛時'], days: [5, 10, 15], suffix: '回分' },
        { name: 'ケトプロフェンテープ40mg', amounts: ['21枚', '35枚'], usages: ['1日1回 患部'], days: [1], suffix: '枚' }
      ]
    },
    {
      department: '耳鼻咽喉科', theme: '感冒症状', difficulty: '標準', note: '粉薬・錠剤が混在。薬品名と用法を正確に入力。',
      drugs: [
        { name: 'カルボシステイン錠500mg', amounts: ['3錠'], usages: ['分3 毎食後'], days: [5, 7], suffix: '日分' },
        { name: 'デキストロメトルファン臭化水素酸塩錠15mg', amounts: ['3錠'], usages: ['分3 毎食後'], days: [5, 7], suffix: '日分' },
        { name: 'アセトアミノフェン錠200mg', amounts: ['2錠'], usages: ['発熱時'], days: [5, 10], suffix: '回分' },
        { name: 'ツロブテロールテープ1mg', amounts: ['7枚'], usages: ['1日1回 胸部'], days: [1], suffix: '枚' }
      ]
    },
    {
      department: '消化器内科', theme: '胃腸症状', difficulty: '標準', note: '食前・食後の違いに注意。',
      drugs: [
        { name: 'ランソプラゾールOD錠15mg', amounts: ['1錠'], usages: ['分1 朝食前'], days: [14, 28], suffix: '日分' },
        { name: 'モサプリドクエン酸塩錠5mg', amounts: ['3錠'], usages: ['分3 毎食前'], days: [7, 14], suffix: '日分' },
        { name: 'ビオフェルミン錠剤', amounts: ['3錠', '6錠'], usages: ['分3 毎食後'], days: [7, 14], suffix: '日分' }
      ]
    },
    {
      department: '小児科', theme: '小児処方', difficulty: 'むずかしい', note: '小児用量の単位と粉薬名を確認。',
      drugs: [
        { name: 'アスベリン散10%', amounts: ['0.6g', '0.9g'], usages: ['分3 毎食後'], days: [5, 7], suffix: '日分' },
        { name: 'ムコダインDS50%', amounts: ['1.2g', '1.5g'], usages: ['分3 毎食後'], days: [5, 7], suffix: '日分' },
        { name: 'カロナール細粒20%', amounts: ['1.0g'], usages: ['発熱時'], days: [5, 8], suffix: '回分' },
        { name: 'ホクナリンドライシロップ0.1%', amounts: ['0.5g'], usages: ['分2 朝夕食後'], days: [5, 7], suffix: '日分' }
      ]
    },
    {
      department: '皮膚科', theme: '外用薬', difficulty: 'むずかしい', note: '外用薬は数量・使用部位を含めて入力。',
      drugs: [
        { name: 'ヒルドイドソフト軟膏0.3%', amounts: ['25g', '50g'], usages: ['1日2回 患部'], days: [1], suffix: '本' },
        { name: 'ロコイド軟膏0.1%', amounts: ['5g', '10g'], usages: ['1日2回 患部'], days: [1], suffix: '本' },
        { name: 'アレグラ錠60mg', amounts: ['2錠'], usages: ['分2 朝夕食後'], days: [7, 14], suffix: '日分' },
        { name: 'ヘパリン類似物質ローション0.3%', amounts: ['50g'], usages: ['1日2回 患部'], days: [1], suffix: '本' }
      ]
    },
    {
      department: '糖尿病内科', theme: '生活習慣病', difficulty: 'むずかしい', note: '長期処方。薬品名の数字まで入力。',
      drugs: [
        { name: 'メトホルミン塩酸塩錠250mg', amounts: ['2錠', '3錠'], usages: ['分2 朝夕食後', '分3 毎食後'], days: [28, 30, 56], suffix: '日分' },
        { name: 'ジャディアンス錠10mg', amounts: ['1錠'], usages: ['分1 朝食後'], days: [28, 30, 56], suffix: '日分' },
        { name: 'グリメピリド錠1mg', amounts: ['1錠'], usages: ['分1 朝食後'], days: [28, 30], suffix: '日分' },
        { name: 'ピオグリタゾン錠15mg', amounts: ['1錠'], usages: ['分1 朝食後'], days: [28, 30], suffix: '日分' }
      ]
    }
  ];

  const DRUG_MASTER = buildDrugMaster();

  const els = {
    setupPanel: document.querySelector('#setupPanel'),
    gamePanel: document.querySelector('#gamePanel'),
    finishPanel: document.querySelector('#finishPanel'),
    rankingPanel: document.querySelector('#rankingPanel'),
    playerName: document.querySelector('#playerName'),
    gasUrl: document.querySelector('#gasUrl'),
    startButton: document.querySelector('#startButton'),
    rankingButton: document.querySelector('#rankingButton'),
    installButton: document.querySelector('#installButton'),
    installStatus: document.querySelector('#installStatus'),
    scoreValue: document.querySelector('#scoreValue'),
    timerValue: document.querySelector('#timerValue'),
    progressValue: document.querySelector('#progressValue'),
    accuracyValue: document.querySelector('#accuracyValue'),
    rxMeta: document.querySelector('#rxMeta'),
    difficultyBadge: document.querySelector('#difficultyBadge'),
    prescriptionCard: document.querySelector('#prescriptionCard'),
    answerInput: document.querySelector('#answerInput'),
    candidateBox: document.querySelector('#candidateBox'),
    candidateList: document.querySelector('#candidateList'),
    assistChips: document.querySelector('#assistChips'),
    resultBox: document.querySelector('#resultBox'),
    clearButton: document.querySelector('#clearButton'),
    checkButton: document.querySelector('#checkButton'),
    nextButton: document.querySelector('#nextButton'),
    finishButton: document.querySelector('#finishButton'),
    finalScore: document.querySelector('#finalScore'),
    finalSummary: document.querySelector('#finalSummary'),
    submitStatus: document.querySelector('#submitStatus'),
    submitScoreButton: document.querySelector('#submitScoreButton'),
    playAgainButton: document.querySelector('#playAgainButton'),
    showRankingAfterButton: document.querySelector('#showRankingAfterButton'),
    closeRankingButton: document.querySelector('#closeRankingButton'),
    rankingMode: document.querySelector('#rankingMode'),
    reloadRankingButton: document.querySelector('#reloadRankingButton'),
    rankingList: document.querySelector('#rankingList')
  };

  const state = {
    mode: '1',
    targetCount: 1,
    startedAt: 0,
    prescriptionStartedAt: 0,
    timerId: null,
    score: 0,
    completed: 0,
    totalAccuracy: 0,
    totalLines: 0,
    exactLines: 0,
    streak: 0,
    currentRx: null,
    checked: false,
    deferredPrompt: null,
    lastResult: null,
    candidates: [],
    candidateIndex: 0,
    composing: false
  };

  function init() {
    els.playerName.value = localStorage.getItem(STORAGE_KEYS.player) || '';
    els.gasUrl.value = localStorage.getItem(STORAGE_KEYS.gasUrl) || DEFAULT_GAS_URL;
    localStorage.setItem(STORAGE_KEYS.gasUrl, els.gasUrl.value.trim());
    setupModeCards();
    setupAssistChips();
    bindEvents();
    registerServiceWorker();
  }

  function bindEvents() {
    els.playerName.addEventListener('input', () => localStorage.setItem(STORAGE_KEYS.player, els.playerName.value.trim()));
    els.gasUrl.addEventListener('input', () => localStorage.setItem(STORAGE_KEYS.gasUrl, els.gasUrl.value.trim()));
    els.answerInput.addEventListener('input', () => updateDrugCandidates());
    els.answerInput.addEventListener('click', () => updateDrugCandidates());
    els.answerInput.addEventListener('keyup', (event) => {
      if (!['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(event.key)) updateDrugCandidates();
    });
    els.answerInput.addEventListener('compositionstart', () => {
      state.composing = true;
    });
    els.answerInput.addEventListener('compositionend', () => {
      state.composing = false;
      updateDrugCandidates();
    });
    els.answerInput.addEventListener('keydown', handleCandidateKeys);
    els.startButton.addEventListener('click', startGame);
    els.rankingButton.addEventListener('click', () => showRanking());
    els.clearButton.addEventListener('click', () => {
      els.answerInput.value = '';
      hideDrugCandidates();
      els.answerInput.focus();
    });
    els.checkButton.addEventListener('click', checkCurrentPrescription);
    els.nextButton.addEventListener('click', () => {
      if (state.mode !== 'endless' && state.completed >= state.targetCount) finishGame();
      else nextPrescription();
    });
    els.finishButton.addEventListener('click', finishGame);
    els.submitScoreButton.addEventListener('click', submitScore);
    els.playAgainButton.addEventListener('click', resetToSetup);
    els.showRankingAfterButton.addEventListener('click', () => showRanking());
    els.closeRankingButton.addEventListener('click', () => els.rankingPanel.classList.add('hidden'));
    els.reloadRankingButton.addEventListener('click', () => showRanking());
    els.rankingMode.addEventListener('change', () => showRanking());
    els.installButton.addEventListener('click', installPwa);

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      state.deferredPrompt = event;
      els.installButton.classList.remove('hidden');
      els.installStatus.textContent = 'インストール可能';
    });
    window.addEventListener('appinstalled', () => {
      els.installButton.classList.add('hidden');
      els.installStatus.textContent = 'インストール済み';
    });
  }

  function setupModeCards() {
    document.querySelectorAll('.mode-card').forEach((card) => {
      const input = card.querySelector('input');
      card.addEventListener('click', () => {
        input.checked = true;
        document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  }

  function setupAssistChips() {
    els.assistChips.innerHTML = '';
    ASSIST_WORDS.forEach((word) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      button.textContent = word;
      button.addEventListener('click', () => insertAtCursor(word));
      els.assistChips.appendChild(button);
    });
  }

  function insertAtCursor(text) {
    const input = els.answerInput;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const before = input.value.slice(0, start);
    const after = input.value.slice(end);
    const prefix = before && !before.endsWith(' ') && !before.endsWith('\n') ? ' ' : '';
    const insert = `${prefix}${text} `;
    input.value = before + insert + after;
    const pos = before.length + insert.length;
    input.focus();
    input.setSelectionRange(pos, pos);
    updateDrugCandidates();
  }

  function startGame() {
    const selected = document.querySelector('input[name="mode"]:checked');
    state.mode = selected?.value || '1';
    state.targetCount = state.mode === 'endless' ? Infinity : Number(state.mode);
    state.startedAt = Date.now();
    state.score = 0;
    state.completed = 0;
    state.totalAccuracy = 0;
    state.totalLines = 0;
    state.exactLines = 0;
    state.streak = 0;
    state.currentRx = null;
    state.lastResult = null;

    localStorage.setItem(STORAGE_KEYS.player, els.playerName.value.trim());
    localStorage.setItem(STORAGE_KEYS.gasUrl, els.gasUrl.value.trim());

    els.setupPanel.classList.add('hidden');
    els.finishPanel.classList.add('hidden');
    els.rankingPanel.classList.add('hidden');
    els.gamePanel.classList.remove('hidden');
    startTimer();
    nextPrescription();
  }

  function startTimer() {
    clearInterval(state.timerId);
    state.timerId = setInterval(updateStatsUi, 250);
    updateStatsUi();
  }

  function resetToSetup() {
    clearInterval(state.timerId);
    els.gamePanel.classList.add('hidden');
    els.finishPanel.classList.add('hidden');
    els.rankingPanel.classList.add('hidden');
    els.setupPanel.classList.remove('hidden');
  }

  function nextPrescription() {
    state.currentRx = generatePrescription();
    state.checked = false;
    state.prescriptionStartedAt = Date.now();
    els.answerInput.value = '';
    hideDrugCandidates();
    els.resultBox.classList.add('hidden');
    els.resultBox.innerHTML = '';
    els.nextButton.classList.add('hidden');
    els.checkButton.disabled = false;
    els.answerInput.disabled = false;
    renderPrescription(state.currentRx);
    updateStatsUi();
    setTimeout(() => els.answerInput.focus(), 50);
  }

  function generatePrescription() {
    const set = sample(MED_SETS);
    const count = randomInt(1, Math.min(4, set.drugs.length));
    const shuffled = shuffle(set.drugs).slice(0, count);
    const created = shuffled.map((drug) => {
      const amount = sample(drug.amounts);
      const usage = sample(drug.usages);
      const day = sample(drug.days);
      const quantity = drug.suffix === '日分' || drug.suffix === '回分' ? `${day}${drug.suffix}` : `${amount}`;
      const displayQuantity = drug.suffix === '日分' || drug.suffix === '回分' ? `${amount} ${usage} ${day}${drug.suffix}` : `${amount} ${usage}`;
      const expected = drug.suffix === '日分' || drug.suffix === '回分'
        ? `${drug.name} ${amount} ${usage} ${day}${drug.suffix}`
        : `${drug.name} ${amount} ${usage}`;
      return { ...drug, amount, usage, day, quantity, displayQuantity, expected };
    });

    const sexes = ['男', '女'];
    const patientNo = String(randomInt(10000, 99999));
    const age = randomInt(set.department === '小児科' ? 4 : 22, set.department === '小児科' ? 12 : 86);
    const date = new Date();
    const dateText = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

    return {
      id: cryptoRandomId(),
      department: set.department,
      theme: set.theme,
      difficulty: set.difficulty,
      note: set.note,
      patientNo,
      patient: `架空患者 ${sample(['青葉', '若葉', '桜井', '白川', '水野', '森田'])} ${sample(['A', 'B', 'C', 'D', 'E'])}様`,
      age,
      sex: sample(sexes),
      dateText,
      drugs: created,
      expectedLines: created.map(d => d.expected)
    };
  }

  function renderPrescription(rx) {
    els.rxMeta.textContent = `${rx.department} / ${rx.theme} / ${rx.drugs.length}薬剤`;
    els.difficultyBadge.textContent = rx.difficulty;
    els.prescriptionCard.innerHTML = `
      <div class="rx-header">
        <div>
          <div class="rx-title">処方箋入力練習票</div>
          <div class="rx-small">処方日：${escapeHtml(rx.dateText)} / 受付番号：${escapeHtml(rx.patientNo)}</div>
        </div>
        <div class="rx-small">${escapeHtml(rx.department)}</div>
      </div>
      <div class="rx-body">
        <dl>
          <div class="rx-row"><dt>患者</dt><dd>${escapeHtml(rx.patient)}（${rx.age}歳・${rx.sex}）</dd></div>
          <div class="rx-row"><dt>備考</dt><dd>${escapeHtml(rx.note)}</dd></div>
        </dl>
        <ul class="rx-list">
          ${rx.drugs.map((drug, index) => `
            <li>
              <span class="rp-label">Rp.${index + 1}</span>
              <strong>${escapeHtml(drug.name)}</strong><br>
              ${escapeHtml(drug.displayQuantity)}
            </li>
          `).join('')}
        </ul>
        <div class="rx-note">入力形式：薬品名 用量 用法 日数・回数。例「薬品名 1錠 分1 朝食後 28日分」</div>
      </div>
    `;
  }

  function updateDrugCandidates() {
    if (!els.answerInput || els.answerInput.disabled || state.composing) return;
    const lineInfo = getCurrentDrugInputInfo();
    if (!lineInfo || countSearchChars(lineInfo.query) < 3) {
      hideDrugCandidates();
      return;
    }

    const normalizedQuery = normalizeSearchText(lineInfo.query);
    const matches = DRUG_MASTER
      .map((drug) => {
        const nameIndex = drug.searchName.indexOf(normalizedQuery);
        const readingIndex = drug.searchReading.indexOf(normalizedQuery);
        const index = nameIndex >= 0 ? nameIndex : readingIndex;
        if (index < 0) return null;
        const starts = drug.searchName.startsWith(normalizedQuery) || drug.searchReading.startsWith(normalizedQuery);
        return { ...drug, index, starts };
      })
      .filter(Boolean)
      .sort((a, b) => Number(b.starts) - Number(a.starts) || a.index - b.index || a.name.length - b.name.length)
      .slice(0, 8);

    if (!matches.length) {
      hideDrugCandidates();
      return;
    }

    state.candidates = matches;
    state.candidateIndex = Math.min(state.candidateIndex, matches.length - 1);
    renderDrugCandidates(lineInfo);
  }

  function getCurrentDrugInputInfo() {
    const input = els.answerInput;
    const cursor = input.selectionStart ?? input.value.length;
    const value = input.value;
    const lineStart = value.lastIndexOf('\n', Math.max(0, cursor - 1)) + 1;
    const lineEndIndex = value.indexOf('\n', cursor);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const beforeCursor = value.slice(lineStart, cursor);
    const whitespaceMatch = beforeCursor.match(/[\s　]/);

    // 薬品名部分を確定して用量・用法を入力しているときは、候補を出さない
    if (whitespaceMatch) return null;

    const query = beforeCursor.trim();
    if (!query) return null;
    return { lineStart, lineEnd, cursor, query };
  }

  function renderDrugCandidates(lineInfo) {
    els.candidateList.innerHTML = state.candidates.map((drug, index) => `
      <button type="button" class="candidate-item ${index === state.candidateIndex ? 'active' : ''}" data-index="${index}">
        <strong>${escapeHtml(drug.name)}</strong>
        <span>${escapeHtml(drug.department)} / ${escapeHtml(drug.theme)}</span>
      </button>
    `).join('');

    els.candidateList.querySelectorAll('.candidate-item').forEach((button) => {
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        chooseDrugCandidate(Number(button.dataset.index || 0));
      });
    });

    const rect = els.answerInput.getBoundingClientRect();
    els.candidateBox.style.setProperty('--candidate-left', `${Math.max(12, rect.left)}px`);
    els.candidateBox.classList.remove('hidden');
    els.candidateBox.dataset.query = lineInfo.query;
  }

  function handleCandidateKeys(event) {
    if (els.candidateBox.classList.contains('hidden') || !state.candidates.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      state.candidateIndex = (state.candidateIndex + 1) % state.candidates.length;
      renderDrugCandidates(getCurrentDrugInputInfo() || { query: '' });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      state.candidateIndex = (state.candidateIndex - 1 + state.candidates.length) % state.candidates.length;
      renderDrugCandidates(getCurrentDrugInputInfo() || { query: '' });
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      chooseDrugCandidate(state.candidateIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      hideDrugCandidates();
    }
  }

  function chooseDrugCandidate(index) {
    const drug = state.candidates[index];
    const lineInfo = getCurrentDrugInputInfo();
    if (!drug || !lineInfo) return;

    const input = els.answerInput;
    const before = input.value.slice(0, lineInfo.lineStart);
    const after = input.value.slice(lineInfo.cursor);
    const insert = `${drug.name} `;
    input.value = before + insert + after;
    const pos = before.length + insert.length;
    input.focus();
    input.setSelectionRange(pos, pos);
    hideDrugCandidates();
  }

  function hideDrugCandidates() {
    state.candidates = [];
    state.candidateIndex = 0;
    if (els.candidateBox) {
      els.candidateBox.classList.add('hidden');
      els.candidateBox.dataset.query = '';
    }
    if (els.candidateList) els.candidateList.innerHTML = '';
  }

  function checkCurrentPrescription() {
    if (state.checked || !state.currentRx) return;
    const elapsed = Math.max(1, Math.round((Date.now() - state.prescriptionStartedAt) / 1000));
    const userLines = splitLines(els.answerInput.value);
    const expectedLines = state.currentRx.expectedLines;
    const comparisons = compareLines(expectedLines, userLines);
    const accuracy = comparisons.reduce((sum, item) => sum + item.rate, 0) / Math.max(expectedLines.length, userLines.length, 1);
    const exactCount = comparisons.filter(item => item.rate >= 1).length;
    const targetSeconds = 18 + expectedLines.length * 14 + (state.currentRx.difficulty === 'むずかしい' ? 10 : 0);
    const speedRatio = Math.max(0, 1 - elapsed / Math.max(1, targetSeconds * 2));
    const speedBonus = Math.round(accuracy * 500 * speedRatio);
    const perfectBonus = accuracy >= 1 ? 300 : 0;
    state.streak = accuracy >= 1 ? state.streak + 1 : 0;
    const streakBonus = state.streak >= 2 ? state.streak * 50 : 0;
    const baseScore = Math.round(accuracy * 1000);
    const addScore = Math.max(0, baseScore + speedBonus + perfectBonus + streakBonus);

    state.score += addScore;
    state.completed += 1;
    state.totalAccuracy += accuracy;
    state.totalLines += expectedLines.length;
    state.exactLines += exactCount;
    state.checked = true;
    state.lastResult = { elapsed, accuracy, addScore, comparisons, speedBonus, perfectBonus, streakBonus };

    hideDrugCandidates();
    els.answerInput.disabled = true;
    els.checkButton.disabled = true;
    els.nextButton.textContent = state.mode !== 'endless' && state.completed >= state.targetCount ? '結果へ' : '次の処方箋へ';
    els.nextButton.classList.remove('hidden');
    renderResult(state.lastResult);
    updateStatsUi();
  }

  function compareLines(expectedLines, userLines) {
    const max = Math.max(expectedLines.length, userLines.length);
    const result = [];
    for (let i = 0; i < max; i += 1) {
      const expected = expectedLines[i] || '';
      const user = userLines[i] || '';
      const nExpected = normalizeForCompare(expected);
      const nUser = normalizeForCompare(user);
      let rate = 0;
      if (nExpected && nUser) {
        const distance = levenshtein(nExpected, nUser);
        rate = Math.max(0, 1 - distance / Math.max(nExpected.length, nUser.length, 1));
      } else if (!nExpected && !nUser) {
        rate = 1;
      }
      result.push({ expected, user, rate });
    }
    return result;
  }

  function renderResult(result) {
    const percent = Math.round(result.accuracy * 100);
    const title = result.accuracy >= 1 ? '完全一致です！' : result.accuracy >= .85 ? 'ほぼ正解です' : '入力内容を確認してください';
    els.resultBox.innerHTML = `
      <h3>${escapeHtml(title)} +${result.addScore}点</h3>
      <p>正確率 ${percent}% / 入力時間 ${result.elapsed}秒 / 速度ボーナス ${result.speedBonus}点 / 完全一致 ${result.perfectBonus}点 / 連続ボーナス ${result.streakBonus}点</p>
      ${result.comparisons.map((item, index) => {
        const markClass = item.rate >= 1 ? 'ok' : item.rate >= .85 ? 'warn' : 'ng';
        const markText = item.rate >= 1 ? 'OK' : item.rate >= .85 ? '惜しい' : '要確認';
        return `
          <div class="result-line">
            <span class="mark ${markClass}">${markText}</span>
            <div>
              <strong>${index + 1}. ${escapeHtml(item.user || '未入力')}</strong>
              <div class="expected">正：${escapeHtml(item.expected || '余分な入力行です')}</div>
            </div>
          </div>
        `;
      }).join('')}
    `;
    els.resultBox.classList.remove('hidden');
  }

  function finishGame() {
    clearInterval(state.timerId);
    if (state.completed === 0 && state.currentRx && !state.checked && els.answerInput.value.trim()) {
      checkCurrentPrescription();
      clearInterval(state.timerId);
    }
    const elapsed = Math.round((Date.now() - state.startedAt) / 1000);
    const averageAccuracy = state.completed ? state.totalAccuracy / state.completed : 0;
    const lineAccuracy = state.totalLines ? state.exactLines / state.totalLines : 0;
    const payload = buildScorePayload(elapsed, averageAccuracy, lineAccuracy);
    saveLocalScore(payload);

    els.gamePanel.classList.add('hidden');
    els.setupPanel.classList.add('hidden');
    els.rankingPanel.classList.add('hidden');
    els.finishPanel.classList.remove('hidden');
    els.finalScore.textContent = String(payload.score);
    els.finalSummary.innerHTML = `
      <div class="summary-item"><span>モード</span><strong>${modeLabel(payload.mode)}</strong></div>
      <div class="summary-item"><span>入力枚数</span><strong>${payload.prescriptions}</strong></div>
      <div class="summary-item"><span>平均正確率</span><strong>${Math.round(payload.accuracy * 100)}%</strong></div>
      <div class="summary-item"><span>時間</span><strong>${formatTime(payload.seconds)}</strong></div>
    `;
    els.submitStatus.textContent = getGasUrl() ? '全国ランキングへ登録できます。' : 'GAS URL未設定のため、現在は端末内ベストのみ保存しています。';
  }

  function buildScorePayload(seconds, averageAccuracy, lineAccuracy) {
    return {
      name: (els.playerName.value.trim() || '名無し'),
      mode: state.mode,
      score: state.score,
      accuracy: Number(averageAccuracy.toFixed(4)),
      lineAccuracy: Number(lineAccuracy.toFixed(4)),
      seconds,
      prescriptions: state.completed,
      createdAt: new Date().toISOString(),
      version: '1.1.0'
    };
  }

  async function submitScore() {
    const gasUrl = getGasUrl();
    const elapsed = Math.round((Date.now() - state.startedAt) / 1000);
    const payload = buildScorePayload(elapsed, state.completed ? state.totalAccuracy / state.completed : 0, state.totalLines ? state.exactLines / state.totalLines : 0);
    saveLocalScore(payload);

    if (!gasUrl) {
      els.submitStatus.textContent = 'GAS URLが未設定です。ゲーム設定画面でGAS WebアプリURLを入力してください。端末内には保存しました。';
      return;
    }

    els.submitScoreButton.disabled = true;
    els.submitStatus.textContent = 'ランキングに送信中です...';
    try {
      const response = await gasJsonp(gasUrl, { action: 'submit', ...payload });
      if (response && response.ok) {
        els.submitStatus.textContent = `登録しました。現在順位：${response.rank || '-'}位`;
      } else {
        throw new Error(response?.message || '登録に失敗しました');
      }
    } catch (error) {
      els.submitStatus.textContent = `送信できませんでした：${error.message}`;
    } finally {
      els.submitScoreButton.disabled = false;
    }
  }

  async function showRanking() {
    els.rankingPanel.classList.remove('hidden');
    els.rankingList.innerHTML = '<div class="empty">ランキングを読み込み中です...</div>';
    const mode = els.rankingMode.value;
    const gasUrl = getGasUrl();
    if (!gasUrl) {
      renderRanking(getLocalScores(mode), 'local');
      return;
    }
    try {
      const response = await gasJsonp(gasUrl, { action: 'ranking', mode, limit: 50 });
      if (!response || !response.ok) throw new Error(response?.message || 'ランキングを取得できませんでした');
      renderRanking(response.items || [], 'gas');
    } catch (error) {
      els.rankingList.innerHTML = `<div class="empty">GASランキングを取得できませんでした。端末内ベストを表示します。<br>${escapeHtml(error.message)}</div>`;
      renderRanking(getLocalScores(mode), 'local');
    }
  }

  function renderRanking(items, source) {
    const rows = Array.isArray(items) ? items : [];
    if (!rows.length) {
      els.rankingList.innerHTML = `<div class="empty">まだランキングデータがありません。${source === 'local' ? 'プレイ後に端末内ベストが表示されます。' : ''}</div>`;
      return;
    }
    const sorted = [...rows].sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 50);
    els.rankingList.innerHTML = `
      <div class="rank-row header"><div>順位</div><div>プレイヤー</div><div>スコア</div><div>正確率</div><div>時間</div></div>
      ${sorted.map((item, index) => `
        <div class="rank-row">
          <div><strong>${index + 1}</strong></div>
          <div class="rank-main"><strong>${escapeHtml(item.name || '名無し')}</strong><span>${modeLabel(item.mode)} / ${escapeHtml(formatDate(item.createdAt))}</span></div>
          <div><strong>${Number(item.score || 0).toLocaleString()}</strong></div>
          <div>${Math.round(Number(item.accuracy || 0) * 100)}%</div>
          <div>${formatTime(Number(item.seconds || 0))}</div>
        </div>
      `).join('')}
    `;
  }

  function saveLocalScore(score) {
    const scores = getLocalScores('all', false);
    scores.push(score);
    scores.sort((a, b) => Number(b.score) - Number(a.score));
    localStorage.setItem(STORAGE_KEYS.localScores, JSON.stringify(scores.slice(0, 100)));
  }

  function getLocalScores(mode = 'all', filter = true) {
    try {
      const scores = JSON.parse(localStorage.getItem(STORAGE_KEYS.localScores) || '[]');
      if (!filter || mode === 'all') return scores;
      return scores.filter(item => String(item.mode) === String(mode));
    } catch (_) {
      return [];
    }
  }

  function updateStatsUi() {
    const elapsed = state.startedAt ? Math.round((Date.now() - state.startedAt) / 1000) : 0;
    const averageAccuracy = state.completed ? state.totalAccuracy / state.completed : 1;
    els.scoreValue.textContent = Number(state.score).toLocaleString();
    els.timerValue.textContent = formatTime(elapsed);
    els.progressValue.textContent = state.mode === 'endless'
      ? `${state.completed + (state.checked ? 0 : 1)} / ∞`
      : `${Math.min(state.completed + (state.checked ? 0 : 1), state.targetCount)} / ${state.targetCount}`;
    els.accuracyValue.textContent = `${Math.round(averageAccuracy * 100)}%`;
  }

  function buildDrugMaster() {
    const map = new Map();
    MED_SETS.forEach((set) => {
      set.drugs.forEach((drug) => {
        if (map.has(drug.name)) return;
        map.set(drug.name, {
          name: drug.name,
          department: set.department,
          theme: set.theme,
          searchName: normalizeSearchText(drug.name),
          searchReading: normalizeSearchText(drug.reading || drug.name)
        });
      });
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  }

  function normalizeSearchText(text) {
    return String(text || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[ぁ-ん]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60))
      .replace(/[\s　・･,，、。\.\-ー‐―]/g, '')
      .trim();
  }

  function countSearchChars(text) {
    return Array.from(normalizeSearchText(text)).length;
  }

  function splitLines(text) {
    return text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
  }

  function normalizeForCompare(text) {
    return String(text || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\s　]+/g, '')
      .replace(/[・･,，、。\.]/g, '')
      .replace(/錠剤/g, '錠')
      .replace(/毎食後/g, '毎食後')
      .trim();
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const prev = new Array(b.length + 1);
    const curr = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j += 1) prev[j] = j;
    for (let i = 1; i <= a.length; i += 1) {
      curr[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
    }
    return prev[b.length];
  }

  function gasJsonp(endpoint, params) {
    return new Promise((resolve, reject) => {
      const callbackName = `rxGameCallback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const url = new URL(endpoint);
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value ?? '')));
      url.searchParams.set('callback', callbackName);
      const script = document.createElement('script');
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('GASから応答がありませんでした'));
      }, 12000);
      function cleanup() {
        clearTimeout(timeoutId);
        delete window[callbackName];
        script.remove();
      }
      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };
      script.onerror = () => {
        cleanup();
        reject(new Error('GASへの接続に失敗しました'));
      };
      script.src = url.toString();
      document.body.appendChild(script);
    });
  }

  function getGasUrl() {
    return (els.gasUrl.value || localStorage.getItem(STORAGE_KEYS.gasUrl) || DEFAULT_GAS_URL).trim();
  }

  function installPwa() {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    state.deferredPrompt.userChoice.finally(() => {
      state.deferredPrompt = null;
      els.installButton.classList.add('hidden');
    });
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        els.installStatus.textContent = 'PWA未登録';
      });
    }
  }

  function modeLabel(mode) {
    const map = { '1': '1枚入力', '3': '3枚入力', '5': '5枚入力', '10': '10枚入力', endless: 'エンドレス', all: 'すべて' };
    return map[String(mode)] || `${mode}枚入力`;
  }

  function formatTime(seconds) {
    const safe = Math.max(0, Math.floor(Number(seconds) || 0));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function sample(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function cryptoRandomId() {
    if (crypto?.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
  }

  init();
})();
