(() => {
  'use strict';

  const APP_VERSION = 'v8.0.0';
  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbzKs2dbznSXPyNJWY0L2Wzfed5m834wBa8FLP9paAyaSJZ6dIx-eST16D3eTVICBs2rRw/exec';

  const STORAGE_KEYS = {
    player: 'rx_game_player_name',
    localScores: 'rx_game_local_scores'
  };

  const FAMILY_NAMES = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐々木', '山口', '松本', '井上'];
  const GIVEN_NAMES = ['太郎', '花子', '一郎', '美咲', '健太', '陽子', '誠', '優子', '翔太', '恵', '大輔', '彩', '拓也', '真由美', '直樹', '玲子'];

  const MED_SETS = [
    {
      department: '内科', theme: '血圧管理', difficulty: '標準', note: '継続処方。患者情報、日数、用法を確認して入力。',
      drugs: [
        { type: 'regular', name: 'アムロジピンOD錠5mg', reading: 'アムロジピンODジョウ5mg', amounts: ['1錠'], usages: ['分1 朝食後'], days: [14, 28, 30] },
        { type: 'regular', name: 'テルミサルタン錠40mg', reading: 'テルミサルタンジョウ40mg', amounts: ['1錠'], usages: ['分1 朝食後'], days: [14, 28, 30] },
        { type: 'regular', name: 'ロスバスタチン錠2.5mg', reading: 'ロスバスタチンジョウ2.5mg', amounts: ['1錠'], usages: ['分1 夕食後'], days: [14, 28, 30] },
        { type: 'regular', name: '酸化マグネシウム錠330mg', reading: 'サンカマグネシウムジョウ330mg', amounts: ['3錠', '6錠'], usages: ['分3 毎食後'], days: [14, 28] }
      ]
    },
    {
      department: '整形外科', theme: '疼痛管理', difficulty: 'やさしい', note: '内服薬と頓服の入力順を区別して入力。',
      drugs: [
        { type: 'regular', name: 'ロキソプロフェンNa錠60mg', reading: 'ロキソプロフェンNaジョウ60mg', amounts: ['3錠'], usages: ['分3 毎食後'], days: [5, 7, 14] },
        { type: 'regular', name: 'レバミピド錠100mg', reading: 'レバミピドジョウ100mg', amounts: ['3錠'], usages: ['分3 毎食後'], days: [5, 7, 14] },
        { type: 'prn', name: 'ロキソプロフェンNa錠60mg', reading: 'ロキソプロフェンNaジョウ60mg', perDoses: ['1錠'], timings: ['疼痛時'], times: [5, 10, 15] },
        { type: 'external', name: 'ケトプロフェンテープ40mg', reading: 'ケトプロフェンテープ40mg', totals: ['21枚', '35枚'], sites: ['患部'], usages: ['1日1回'] }
      ]
    },
    {
      department: '耳鼻咽喉科', theme: '感冒症状', difficulty: '標準', note: '粉薬・錠剤が混在。薬品名と用法を正確に入力。',
      drugs: [
        { type: 'regular', name: 'カルボシステイン錠500mg', reading: 'カルボシステインジョウ500mg', amounts: ['3錠'], usages: ['分3 毎食後'], days: [5, 7] },
        { type: 'regular', name: 'デキストロメトルファン臭化水素酸塩錠15mg', reading: 'デキストロメトルファンシュウカスイソサンエンジョウ15mg', amounts: ['3錠'], usages: ['分3 毎食後'], days: [5, 7] },
        { type: 'prn', name: 'アセトアミノフェン錠200mg', reading: 'アセトアミノフェンジョウ200mg', perDoses: ['2錠'], timings: ['発熱時'], times: [5, 10] },
        { type: 'external', name: 'ツロブテロールテープ1mg', reading: 'ツロブテロールテープ1mg', totals: ['7枚'], sites: ['胸部'], usages: ['1日1回'] }
      ]
    },
    {
      department: '消化器内科', theme: '胃腸症状', difficulty: '標準', note: '食前・食後の違いに注意。',
      drugs: [
        { type: 'regular', name: 'ランソプラゾールOD錠15mg', reading: 'ランソプラゾールODジョウ15mg', amounts: ['1錠'], usages: ['分1 朝食前'], days: [14, 28] },
        { type: 'regular', name: 'モサプリドクエン酸塩錠5mg', reading: 'モサプリドクエンサンエンジョウ5mg', amounts: ['3錠'], usages: ['分3 毎食前'], days: [7, 14] },
        { type: 'regular', name: 'ビオフェルミン錠剤', reading: 'ビオフェルミンジョウザイ', amounts: ['3錠', '6錠'], usages: ['分3 毎食後'], days: [7, 14] }
      ]
    },
    {
      department: '小児科', theme: '小児処方', difficulty: 'むずかしい', note: '小児用量の単位と粉薬名を確認。',
      drugs: [
        { type: 'regular', name: 'アスベリン散10%', reading: 'アスベリンサン10%', amounts: ['0.6g', '0.9g'], usages: ['分3 毎食後'], days: [5, 7] },
        { type: 'regular', name: 'ムコダインDS50%', reading: 'ムコダインDS50%', amounts: ['1.2g', '1.5g'], usages: ['分3 毎食後'], days: [5, 7] },
        { type: 'prn', name: 'カロナール細粒20%', reading: 'カロナールサイリュウ20%', perDoses: ['1.0g'], timings: ['発熱時'], times: [5, 8] },
        { type: 'regular', name: 'ホクナリンドライシロップ0.1%', reading: 'ホクナリンドライシロップ0.1%', amounts: ['0.5g'], usages: ['分2 朝夕食後'], days: [5, 7] }
      ]
    },
    {
      department: '皮膚科', theme: '外用薬', difficulty: 'むずかしい', note: '外用薬は薬品名、処方された全量、使用部位、用法の順に入力。',
      drugs: [
        { type: 'external', name: 'ヒルドイドソフト軟膏0.3%', reading: 'ヒルドイドソフトナンコウ0.3%', totals: ['25g', '50g'], sites: ['患部'], usages: ['1日2回'] },
        { type: 'external', name: 'ロコイド軟膏0.1%', reading: 'ロコイドナンコウ0.1%', totals: ['5g', '10g'], sites: ['患部'], usages: ['1日2回'] },
        { type: 'regular', name: 'アレグラ錠60mg', reading: 'アレグラジョウ60mg', amounts: ['2錠'], usages: ['分2 朝夕食後'], days: [7, 14] },
        { type: 'external', name: 'ヘパリン類似物質ローション0.3%', reading: 'ヘパリンルイジブッシツローション0.3%', totals: ['50g'], sites: ['患部'], usages: ['1日2回'] }
      ]
    },
    {
      department: '糖尿病内科', theme: '生活習慣病', difficulty: 'むずかしい', note: '長期処方。薬品名の数字まで入力。',
      drugs: [
        { type: 'regular', name: 'メトホルミン塩酸塩錠250mg', reading: 'メトホルミンエンサンエンジョウ250mg', amounts: ['2錠', '3錠'], usages: ['分2 朝夕食後', '分3 毎食後'], days: [28, 30, 56] },
        { type: 'regular', name: 'ジャディアンス錠10mg', reading: 'ジャディアンスジョウ10mg', amounts: ['1錠'], usages: ['分1 朝食後'], days: [28, 30, 56] },
        { type: 'regular', name: 'グリメピリド錠1mg', reading: 'グリメピリドジョウ1mg', amounts: ['1錠'], usages: ['分1 朝食後'], days: [28, 30] },
        { type: 'regular', name: 'ピオグリタゾン錠15mg', reading: 'ピオグリタゾンジョウ15mg', amounts: ['1錠'], usages: ['分1 朝食後'], days: [28, 30] }
      ]
    }
  ];

  const ROMAJI_CHARS = {
    'あ': ['a'], 'い': ['i'], 'う': ['u'], 'え': ['e'], 'お': ['o'],
    'か': ['ka'], 'き': ['ki'], 'く': ['ku'], 'け': ['ke'], 'こ': ['ko'],
    'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
    'さ': ['sa'], 'し': ['shi', 'si'], 'す': ['su'], 'せ': ['se'], 'そ': ['so'],
    'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
    'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'],
    'だ': ['da'], 'ぢ': ['ji', 'di'], 'づ': ['zu', 'du'], 'で': ['de'], 'ど': ['do'],
    'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
    'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu', 'hu'], 'へ': ['he'], 'ほ': ['ho'],
    'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
    'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],
    'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
    'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
    'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
    'わ': ['wa'], 'を': ['wo', 'o'], 'ん': ['n'],
    'ぁ': ['a'], 'ぃ': ['i'], 'ぅ': ['u'], 'ぇ': ['e'], 'ぉ': ['o'],
    'ゃ': ['ya'], 'ゅ': ['yu'], 'ょ': ['yo'], 'ゎ': ['wa'],
    'ゔ': ['vu', 'bu']
  };

  const ROMAJI_DIGRAPHS = {
    'きゃ': ['kya'], 'きぃ': ['kyi'], 'きゅ': ['kyu'], 'きぇ': ['kye'], 'きょ': ['kyo'],
    'ぎゃ': ['gya'], 'ぎぃ': ['gyi'], 'ぎゅ': ['gyu'], 'ぎぇ': ['gye'], 'ぎょ': ['gyo'],
    'しゃ': ['sha', 'sya'], 'しぃ': ['syi'], 'しゅ': ['shu', 'syu'], 'しぇ': ['she', 'sye'], 'しょ': ['sho', 'syo'],
    'じゃ': ['ja', 'jya', 'zya'], 'じぃ': ['jyi', 'zyi'], 'じゅ': ['ju', 'jyu', 'zyu'], 'じぇ': ['je', 'jye', 'zye'], 'じょ': ['jo', 'jyo', 'zyo'],
    'ちゃ': ['cha', 'tya', 'cya'], 'ちぃ': ['tyi', 'cyi'], 'ちゅ': ['chu', 'tyu', 'cyu'], 'ちぇ': ['che', 'tye', 'cye'], 'ちょ': ['cho', 'tyo', 'cyo'],
    'ぢゃ': ['ja', 'dya'], 'ぢゅ': ['ju', 'dyu'], 'ぢょ': ['jo', 'dyo'],
    'にゃ': ['nya'], 'にぃ': ['nyi'], 'にゅ': ['nyu'], 'にぇ': ['nye'], 'にょ': ['nyo'],
    'ひゃ': ['hya'], 'ひぃ': ['hyi'], 'ひゅ': ['hyu'], 'ひぇ': ['hye'], 'ひょ': ['hyo'],
    'びゃ': ['bya'], 'びぃ': ['byi'], 'びゅ': ['byu'], 'びぇ': ['bye'], 'びょ': ['byo'],
    'ぴゃ': ['pya'], 'ぴぃ': ['pyi'], 'ぴゅ': ['pyu'], 'ぴぇ': ['pye'], 'ぴょ': ['pyo'],
    'みゃ': ['mya'], 'みぃ': ['myi'], 'みゅ': ['myu'], 'みぇ': ['mye'], 'みょ': ['myo'],
    'りゃ': ['rya'], 'りぃ': ['ryi'], 'りゅ': ['ryu'], 'りぇ': ['rye'], 'りょ': ['ryo'],
    'ふぁ': ['fa', 'fwa'], 'ふぃ': ['fi', 'fwi'], 'ふぇ': ['fe', 'fwe'], 'ふぉ': ['fo', 'fwo'],
    'てぃ': ['ti', 'thi'], 'てゅ': ['tyu', 'thu'], 'でぃ': ['di', 'dhi'], 'でゅ': ['dyu', 'dhu'],
    'うぃ': ['wi'], 'うぇ': ['we'], 'うぉ': ['wo'],
    'ゔぁ': ['va', 'ba'], 'ゔぃ': ['vi', 'bi'], 'ゔぇ': ['ve', 'be'], 'ゔぉ': ['vo', 'bo'], 'ゔゅ': ['vyu', 'byu']
  };

  const DRUG_MASTER = buildDrugMaster();
  const USAGE_MASTER = buildUsageMaster();

  const els = {
    setupPanel: document.querySelector('#setupPanel'),
    gamePanel: document.querySelector('#gamePanel'),
    finishPanel: document.querySelector('#finishPanel'),
    rankingPanel: document.querySelector('#rankingPanel'),
    playerName: document.querySelector('#playerName'),
    startButton: document.querySelector('#startButton'),
    rankingButton: document.querySelector('#rankingButton'),
    installButton: document.querySelector('#installButton'),
    updateButton: document.querySelector('#updateButton'),
    installStatus: document.querySelector('#installStatus'),
    versionBadge: document.querySelector('#versionBadge'),
    versionText: document.querySelector('#versionText'),
    scoreValue: document.querySelector('#scoreValue'),
    timerValue: document.querySelector('#timerValue'),
    progressValue: document.querySelector('#progressValue'),
    accuracyValue: document.querySelector('#accuracyValue'),
    rxMeta: document.querySelector('#rxMeta'),
    difficultyBadge: document.querySelector('#difficultyBadge'),
    prescriptionCard: document.querySelector('#prescriptionCard'),
    patientNameInput: document.querySelector('#patientNameInput'),
    birthDateInput: document.querySelector('#birthDateInput'),
    insuranceNoInput: document.querySelector('#insuranceNoInput'),
    medInputRows: document.querySelector('#medInputRows'),
    candidateBox: document.querySelector('#candidateBox'),
    candidateList: document.querySelector('#candidateList'),
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
    totalFields: 0,
    exactFields: 0,
    streak: 0,
    currentRx: null,
    checked: false,
    deferredPrompt: null,
    lastResult: null,
    candidates: [],
    candidateIndex: 0,
    activeCandidateInput: null,
    activeCandidateType: '',
    composing: false
  };

  function init() {
    els.playerName.value = localStorage.getItem(STORAGE_KEYS.player) || '';
    setVersionText();
    setupModeCards();
    bindEvents();
    registerServiceWorker();
  }

  function bindEvents() {
    els.playerName.addEventListener('input', () => localStorage.setItem(STORAGE_KEYS.player, els.playerName.value.trim()));
    els.startButton.addEventListener('click', startGame);
    els.rankingButton.addEventListener('click', () => showRanking());
    els.clearButton.addEventListener('click', clearAllInputs);
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
    els.updateButton.addEventListener('click', forceUpdateApp);
    els.birthDateInput.addEventListener('input', () => formatBirthDateInput(els.birthDateInput));
    window.addEventListener('resize', positionCandidateBox);
    window.addEventListener('scroll', positionCandidateBox, true);

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

  function setVersionText() {
    if (els.versionBadge) els.versionBadge.textContent = APP_VERSION;
    if (els.versionText) els.versionText.textContent = `Version ${APP_VERSION}`;
  }

  async function forceUpdateApp() {
    const button = els.updateButton;
    try {
      if (button) {
        button.disabled = true;
        button.textContent = '更新中...';
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.update().catch(() => null)));
      }

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }

      const url = new URL(window.location.href);
      url.searchParams.set('v', String(Date.now()));
      window.location.replace(url.toString());
    } catch (error) {
      console.error(error);
      if (button) {
        button.disabled = false;
        button.textContent = '最新版に更新';
      }
      alert('更新に失敗しました。通信状況を確認してから、もう一度お試しください。');
    }
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

  function startGame() {
    const selected = document.querySelector('input[name="mode"]:checked');
    state.mode = selected?.value || '1';
    state.targetCount = state.mode === 'endless' ? Infinity : Number(state.mode);
    state.startedAt = Date.now();
    state.score = 0;
    state.completed = 0;
    state.totalAccuracy = 0;
    state.totalFields = 0;
    state.exactFields = 0;
    state.streak = 0;
    state.currentRx = null;
    state.lastResult = null;
    localStorage.setItem(STORAGE_KEYS.player, els.playerName.value.trim());

    els.setupPanel.classList.add('hidden');
    els.finishPanel.classList.add('hidden');
    els.rankingPanel.classList.add('hidden');
    els.gamePanel.classList.remove('hidden');
    startTimer();
    nextPrescription();
  }

  function startTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(updateStatsUi, 500);
  }

  function nextPrescription() {
    state.currentRx = generatePrescription();
    state.prescriptionStartedAt = Date.now();
    state.checked = false;
    state.lastResult = null;
    hideCandidates();
    renderPrescription();
    renderInputForm();
    els.resultBox.classList.add('hidden');
    els.resultBox.innerHTML = '';
    els.nextButton.classList.add('hidden');
    els.checkButton.disabled = false;
    updateStatsUi();
    setTimeout(() => els.patientNameInput.focus(), 0);
  }

  function generatePrescription() {
    const set = sample(MED_SETS);
    const count = randomInt(2, Math.min(4, set.drugs.length));
    const selectedDrugs = shuffle(set.drugs).slice(0, count);
    const issueDate = new Date();
    const patient = generatePatient();
    return {
      id: cryptoRandomId(),
      issueDateText: formatDateSlash(issueDate),
      department: set.department,
      theme: set.theme,
      difficulty: set.difficulty,
      note: set.note,
      patient,
      items: selectedDrugs.map((drug, index) => buildRxItem(drug, index + 1))
    };
  }

  function generatePatient() {
    const year = randomInt(1948, 2018);
    const month = randomInt(1, 12);
    const day = randomInt(1, 28);
    return {
      name: `${sample(FAMILY_NAMES)} ${sample(GIVEN_NAMES)}`,
      birthDate: `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
      insuranceNo: `${randomInt(10, 99)}${randomInt(100000, 999999)}${randomInt(10, 99)}`
    };
  }

  function buildRxItem(template, number) {
    const base = { number, type: template.type, name: template.name };
    if (template.type === 'external') {
      const totalQuantity = sample(template.totals);
      const site = sample(template.sites);
      const usage = sample(template.usages);
      const usageField = isPatchExternal(template)
        ? { key: 'usageDailyCount', label: '1日回数', expected: dailyCountInputText(usage) }
        : { key: 'usage', label: '用法', expected: usage };
      return {
        ...base,
        totalQuantity,
        site,
        usage,
        fields: [
          { key: 'name', label: '薬品名', expected: template.name },
          { key: 'totalQuantity', label: '処方された全量', expected: quantityInputText(totalQuantity) },
          { key: 'site', label: '使用部位', expected: site },
          usageField
        ]
      };
    }
    if (template.type === 'prn') {
      const perDose = sample(template.perDoses);
      const timing = sample(template.timings);
      const times = sample(template.times);
      const timesText = `${times}回分`;
      return {
        ...base,
        perDose,
        timing,
        timesText,
        fields: [
          { key: 'name', label: '薬品名', expected: template.name },
          { key: 'perDose', label: '1回使用量', expected: quantityInputText(perDose) },
          { key: 'timing', label: '服用（使用）タイミング', expected: timing },
          { key: 'timesText', label: '回分', expected: String(times) }
        ]
      };
    }
    const amount = sample(template.amounts);
    const usage = sample(template.usages);
    const days = sample(template.days);
    const daysText = `${days}日分`;
    return {
      ...base,
      amount,
      usage,
      daysText,
      fields: [
        { key: 'name', label: '薬品名', expected: template.name },
        { key: 'amount', label: '用量', expected: quantityInputText(amount) },
        { key: 'usage', label: '用法', expected: usage },
        { key: 'daysText', label: '日数', expected: String(days) }
      ]
    };
  }

  function renderPrescription() {
    const rx = state.currentRx;
    els.rxMeta.textContent = `${rx.department} / ${rx.theme} / ${rx.issueDateText}`;
    els.difficultyBadge.textContent = rx.difficulty;
    els.prescriptionCard.innerHTML = `
      <div class="rx-header">
        <div>
          <div class="rx-title">処方箋</div>
          <div class="rx-small">${escapeHtml(rx.department)}・${escapeHtml(rx.theme)}</div>
        </div>
        <div class="rx-small">交付日 ${escapeHtml(rx.issueDateText)}</div>
      </div>
      <div class="rx-body">
        <dl>
          <div class="rx-row"><dt>患者氏名</dt><dd>${escapeHtml(rx.patient.name)}</dd></div>
          <div class="rx-row"><dt>生年月日</dt><dd>${escapeHtml(rx.patient.birthDate)}</dd></div>
          <div class="rx-row"><dt>保険番号</dt><dd>${escapeHtml(rx.patient.insuranceNo)}</dd></div>
          <div class="rx-row"><dt>診療科</dt><dd>${escapeHtml(rx.department)}</dd></div>
        </dl>
        <ul class="rx-list">
          ${rx.items.map(item => `
            <li>
              <span class="rp-label">Rp.${item.number}</span><span class="type-badge">${typeLabel(item.type)}</span>
              <span class="rx-list-line">${escapeHtml(itemDisplayText(item))}</span>
            </li>
          `).join('')}
        </ul>
        <div class="rx-note">${escapeHtml(rx.note)}</div>
      </div>
    `;
  }

  function renderInputForm() {
    clearPatientInputs();
    els.medInputRows.innerHTML = state.currentRx.items.map((item, index) => renderMedInputRow(item, index)).join('');
    bindDynamicInputEvents();
  }

  function renderMedInputRow(item, index) {
    const fieldsHtml = item.fields.map((field) => {
      const classNames = ['entry-input', 'med-field'];
      if (field.key === 'name') classNames.push('drug-name-input', 'ime-kana-input');
      if (field.key === 'usage' || field.key === 'timing') classNames.push('usage-input');
      if (isNumericOnlyField(field.key)) classNames.push('ime-number-input');
      const attrs = fieldInputAttributes(field);
      const inputHtml = `<input class="${classNames.join(' ')}" type="text" ${attrs} data-row="${index}" data-field="${escapeHtml(field.key)}" placeholder="${escapeHtml(inputPlaceholder(field))}" />`;
      return `
        <label>
          ${escapeHtml(field.label)}
          <span class="input-wrap">${inputHtml}</span>
        </label>
      `;
    }).join('');

    return `
      <div class="med-input-row" data-row-wrap="${index}">
        <div class="med-row-head">
          <span>Rp.${item.number}</span>
          <span class="type-badge">${typeLabel(item.type)}</span>
        </div>
        <div class="med-input-grid ${item.type}">
          ${fieldsHtml}
        </div>
      </div>
    `;
  }

  function bindDynamicInputEvents() {
    [els.patientNameInput, els.birthDateInput, els.insuranceNoInput].forEach((input, index, list) => {
      input.addEventListener('keydown', (event) => {
        if ((event.key !== 'Enter' && event.key !== 'Tab') || event.isComposing) return;
        event.preventDefault();
        const next = list[index + 1] || els.medInputRows.querySelector('input');
        next?.focus();
        next?.select?.();
      });
    });

    els.medInputRows.querySelectorAll('input').forEach((input) => {
      input.addEventListener('compositionstart', () => { state.composing = true; });
      input.addEventListener('compositionend', () => {
        state.composing = false;
        updateCandidates(input);
      });
      input.addEventListener('focus', () => updateCandidates(input));
      input.addEventListener('input', () => updateCandidates(input));
      input.addEventListener('keydown', handleMedFieldKeydown);
      input.addEventListener('blur', () => {
        setTimeout(() => {
          if (!els.candidateBox.matches(':hover')) hideCandidates();
        }, 120);
      });
    });
  }

  function handleMedFieldKeydown(event) {
    const input = event.currentTarget;
    if (isAutocompleteInput(input) && handleCandidateKeys(event, input)) return;
    if ((event.key === 'Enter' || event.key === 'Tab') && !event.isComposing && !state.composing) {
      event.preventDefault();
      hideCandidates();
      moveToNextField(input);
    }
  }

  function handleCandidateKeys(event, input) {
    if (state.composing || event.isComposing) return false;
    if (els.candidateBox.classList.contains('hidden') || !state.candidates.length) return false;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      state.candidateIndex = (state.candidateIndex + 1) % state.candidates.length;
      renderCandidates(input);
      return true;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      state.candidateIndex = (state.candidateIndex - 1 + state.candidates.length) % state.candidates.length;
      renderCandidates(input);
      return true;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      chooseCandidate(state.candidates[state.candidateIndex], input);
      return true;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      hideCandidates();
      return true;
    }
    return false;
  }

  function updateCandidates(input) {
    if (!input || state.composing) return;
    if (input.classList.contains('drug-name-input')) {
      updateDrugCandidates(input);
      return;
    }
    if (input.classList.contains('usage-input')) {
      updateUsageCandidates(input);
      return;
    }
    hideCandidates();
  }

  function updateDrugCandidates(input) {
    state.activeCandidateInput = input;
    state.activeCandidateType = 'drug';
    const query = input.value;
    if (countSearchChars(query) < 3) {
      hideCandidates();
      return;
    }
    const normalized = normalizeSearchText(query);
    const romajiQuery = normalizeRomajiQuery(query);
    state.candidates = DRUG_MASTER
      .map((drug) => {
        const nameHit = drug.searchName.includes(normalized);
        const readingHit = drug.searchReading.includes(normalized);
        const romajiHit = romajiQuery.length >= 3 && drug.searchRomaji.some((text) => text.includes(romajiQuery));
        const starts = drug.searchName.startsWith(normalized) || drug.searchReading.startsWith(normalized) ||
          (romajiQuery.length >= 3 && drug.searchRomaji.some((text) => text.startsWith(romajiQuery)));
        return { ...drug, value: drug.name, sub: `${drug.department} / ${drug.theme}`, score: starts ? 3 : (nameHit || readingHit ? 2 : (romajiHit ? 1 : 0)) };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'ja'))
      .slice(0, 8);
    state.candidateIndex = 0;
    renderCandidates(input);
  }

  function updateUsageCandidates(input) {
    state.activeCandidateInput = input;
    state.activeCandidateType = 'usage';
    const query = input.value;
    if (countSearchChars(query) < 1) {
      hideCandidates();
      return;
    }
    const normalized = normalizeSearchText(query);
    state.candidates = USAGE_MASTER
      .map((usage) => {
        const hit = usage.searchText.includes(normalized);
        const starts = usage.searchText.startsWith(normalized);
        return { ...usage, value: usage.text, name: usage.text, sub: usage.kind, score: starts ? 2 : (hit ? 1 : 0) };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.text.localeCompare(b.text, 'ja'))
      .slice(0, 8);
    state.candidateIndex = 0;
    renderCandidates(input);
  }

  function renderCandidates(input = state.activeCandidateInput) {
    if (!state.candidates.length || !input) {
      hideCandidates();
      return;
    }
    const host = input.closest('.input-wrap') || input.parentElement || els.medInputRows;
    if (els.candidateBox.parentElement !== host) {
      host.appendChild(els.candidateBox);
    }
    els.candidateBox.classList.remove('hidden');
    els.candidateList.innerHTML = state.candidates.map((item, index) => `
      <button type="button" class="candidate-item ${index === state.candidateIndex ? 'active' : ''}" data-index="${index}">
        <strong>${escapeHtml(item.value)}</strong>
        ${item.sub ? `<span>${escapeHtml(item.sub)}</span>` : ''}
      </button>
    `).join('');
    els.candidateList.querySelectorAll('.candidate-item').forEach((button) => {
      button.addEventListener('mousedown', (event) => event.preventDefault());
      button.addEventListener('click', () => chooseCandidate(state.candidates[Number(button.dataset.index)], input));
    });
    positionCandidateBox(input);
  }

  function chooseCandidate(item, input = state.activeCandidateInput) {
    if (!item || !input) return;
    input.value = item.value;
    hideCandidates();
    input.focus();
    moveToNextField(input);
  }

  function hideCandidates() {
    els.candidateBox.classList.add('hidden');
    els.candidateList.innerHTML = '';
    els.candidateBox.style.left = '';
    els.candidateBox.style.top = '';
    els.candidateBox.style.right = '';
    els.candidateBox.style.width = '';
    state.candidates = [];
    state.candidateIndex = 0;
    state.activeCandidateType = '';
  }

  function positionCandidateBox(input = state.activeCandidateInput) {
    if (!input || els.candidateBox.classList.contains('hidden')) return;
    // 候補は入力欄の親label内に配置し、レセコンのドロップダウンのように入力欄直下へ表示する。
    els.candidateBox.style.left = '0';
    els.candidateBox.style.top = 'calc(100% + 4px)';
    els.candidateBox.style.right = '0';
    els.candidateBox.style.width = '100%';
  }

  function isAutocompleteInput(input) {
    return input?.classList?.contains('drug-name-input') || input?.classList?.contains('usage-input');
  }

  function moveToNextField(input) {
    const row = Number(input.dataset.row);
    const next = getNextFieldKey(row, input.dataset.field);
    if (next) focusField(row, next);
    else focusNextRowOrCheck(row);
  }

  function getNextFieldKey(rowIndex, currentKey) {
    const item = state.currentRx.items[rowIndex];
    const currentIndex = item.fields.findIndex(field => field.key === currentKey);
    return item.fields[currentIndex + 1]?.key || null;
  }

  function focusField(rowIndex, fieldKey) {
    const target = els.medInputRows.querySelector(`[data-row="${rowIndex}"][data-field="${cssEscape(fieldKey)}"]`);
    target?.focus();
    target?.select?.();
  }

  function focusNextRowOrCheck(rowIndex) {
    const next = els.medInputRows.querySelector(`[data-row="${rowIndex + 1}"]`);
    if (next) next.focus();
    else els.checkButton.focus();
  }

  function clearPatientInputs() {
    els.patientNameInput.value = '';
    els.birthDateInput.value = '';
    els.insuranceNoInput.value = '';
  }

  function clearAllInputs() {
    clearPatientInputs();
    els.medInputRows.querySelectorAll('input').forEach(input => { input.value = ''; });
    hideCandidates();
    els.resultBox.classList.add('hidden');
    els.resultBox.innerHTML = '';
    els.patientNameInput.focus();
  }

  function checkCurrentPrescription() {
    if (!state.currentRx || state.checked) return;

    const result = evaluateCurrentInput();
    state.checked = true;
    state.completed += 1;
    state.totalAccuracy += result.accuracy;
    state.totalFields += result.totalFields;
    state.exactFields += result.exactFields;
    state.streak = result.accuracy >= 0.999 ? state.streak + 1 : 0;

    const elapsed = Math.max(1, Math.round((Date.now() - state.prescriptionStartedAt) / 1000));
    const fieldBase = Math.round(1200 * result.accuracy);
    const exactBonus = result.accuracy >= 0.999 ? 450 : 0;
    const speedBonus = Math.max(0, 360 - elapsed * 6);
    const streakBonus = state.streak >= 2 ? state.streak * 80 : 0;
    const gained = fieldBase + exactBonus + speedBonus + streakBonus;
    state.score += gained;
    state.lastResult = { ...result, elapsed, gained, exactBonus, speedBonus, streakBonus };

    renderResult(result, elapsed, gained, { exactBonus, speedBonus, streakBonus });
    els.checkButton.disabled = true;
    els.nextButton.classList.remove('hidden');
    els.nextButton.textContent = state.mode !== 'endless' && state.completed >= state.targetCount ? '結果へ進む' : '次の処方箋へ';
    updateStatsUi();
  }

  function evaluateCurrentInput() {
    const checks = [];
    checks.push(makeCheck('患者氏名', els.patientNameInput.value, state.currentRx.patient.name));
    checks.push(makeCheck('生年月日', els.birthDateInput.value, state.currentRx.patient.birthDate));
    checks.push(makeCheck('保険番号', els.insuranceNoInput.value, state.currentRx.patient.insuranceNo));

    state.currentRx.items.forEach((item, rowIndex) => {
      item.fields.forEach((field) => {
        const input = els.medInputRows.querySelector(`[data-row="${rowIndex}"][data-field="${cssEscape(field.key)}"]`);
        checks.push(makeCheck(`Rp.${item.number} ${field.label}`, input?.value || '', field.expected));
      });
    });

    const exactFields = checks.filter(check => check.exact).length;
    const totalFields = checks.length;
    const partialSum = checks.reduce((sum, check) => sum + check.score, 0);
    return {
      checks,
      exactFields,
      totalFields,
      accuracy: totalFields ? partialSum / totalFields : 0
    };
  }

  function makeCheck(label, actualRaw, expectedRaw) {
    const actual = String(actualRaw || '').trim();
    const expected = String(expectedRaw || '').trim();
    const actualNorm = normalizeForCompare(actual);
    const expectedNorm = normalizeForCompare(expected);
    const exact = actualNorm === expectedNorm;
    let score = exact ? 1 : 0;
    if (!exact && actualNorm && expectedNorm) {
      const maxLength = Math.max(actualNorm.length, expectedNorm.length);
      const distance = levenshtein(actualNorm, expectedNorm);
      score = Math.max(0, 1 - distance / Math.max(1, maxLength));
      if (score < 0.72) score = 0;
    }
    return { label, actual, expected, exact, score };
  }

  function renderResult(result, elapsed, gained, bonuses) {
    const patientRows = result.checks.slice(0, 3);
    const medRows = result.checks.slice(3);
    els.resultBox.classList.remove('hidden');
    els.resultBox.innerHTML = `
      <h3>${result.exactFields} / ${result.totalFields} 項目一致　+${gained.toLocaleString()}点</h3>
      <div class="expected">正確率 ${Math.round(result.accuracy * 100)}% / 入力時間 ${formatTime(elapsed)} / 完全一致ボーナス ${bonuses.exactBonus} / 速度ボーナス ${bonuses.speedBonus} / 連続ボーナス ${bonuses.streakBonus}</div>
      <div class="result-group-title">患者情報</div>
      ${patientRows.map(renderResultLine).join('')}
      <div class="result-group-title">処方内容</div>
      ${medRows.map(renderResultLine).join('')}
    `;
  }

  function renderResultLine(check) {
    const markClass = check.exact ? 'ok' : (check.score >= 0.72 ? 'warn' : 'ng');
    const mark = check.exact ? '○' : (check.score >= 0.72 ? '△' : '×');
    return `
      <div class="result-line">
        <div class="mark ${markClass}">${mark}</div>
        <div>
          <strong>${escapeHtml(check.label)}</strong>
          <div>入力：${escapeHtml(check.actual || '未入力')}</div>
          ${check.exact ? '' : `<div class="expected">正解：${escapeHtml(check.expected)}</div>`}
        </div>
      </div>
    `;
  }

  function finishGame() {
    if (!state.startedAt) return;
    if (!state.checked && state.currentRx) {
      const ok = window.confirm('現在の処方箋は未判定です。終了して結果を表示しますか？');
      if (!ok) return;
    }
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
    hideCandidates();
    els.gamePanel.classList.add('hidden');
    els.finishPanel.classList.remove('hidden');
    const elapsed = Math.round((Date.now() - state.startedAt) / 1000);
    const averageAccuracy = state.completed ? state.totalAccuracy / state.completed : 0;
    const fieldAccuracy = state.totalFields ? state.exactFields / state.totalFields : 0;
    const payload = buildScorePayload(elapsed, averageAccuracy, fieldAccuracy);
    saveLocalScore(payload);
    renderFinal(payload);
  }

  function renderFinal(payload) {
    els.finalScore.textContent = Number(payload.score).toLocaleString();
    els.finalSummary.innerHTML = `
      <div class="summary-item"><span>モード</span><strong>${modeLabel(payload.mode)}</strong></div>
      <div class="summary-item"><span>入力枚数</span><strong>${payload.prescriptions}</strong></div>
      <div class="summary-item"><span>平均正確率</span><strong>${Math.round(payload.accuracy * 100)}%</strong></div>
      <div class="summary-item"><span>時間</span><strong>${formatTime(payload.seconds)}</strong></div>
    `;
    els.submitStatus.textContent = '全国ランキングへ登録できます。';
  }

  function buildScorePayload(seconds, averageAccuracy, fieldAccuracy) {
    return {
      name: (els.playerName.value.trim() || '名無し'),
      mode: state.mode,
      score: state.score,
      accuracy: Number(averageAccuracy.toFixed(4)),
      fieldAccuracy: Number(fieldAccuracy.toFixed(4)),
      lineAccuracy: Number(fieldAccuracy.toFixed(4)),
      seconds,
      prescriptions: state.completed,
      createdAt: new Date().toISOString(),
      version: '1.2.0'
    };
  }

  async function submitScore() {
    const elapsed = Math.round((Date.now() - state.startedAt) / 1000);
    const payload = buildScorePayload(elapsed, state.completed ? state.totalAccuracy / state.completed : 0, state.totalFields ? state.exactFields / state.totalFields : 0);
    saveLocalScore(payload);

    els.submitScoreButton.disabled = true;
    els.submitStatus.textContent = 'ランキングに送信中です...';
    try {
      const response = await gasJsonp(DEFAULT_GAS_URL, { action: 'submit', ...payload });
      if (response && response.ok) {
        els.submitStatus.textContent = `登録しました。現在順位：${response.rank || '-'}位`;
      } else {
        throw new Error(response?.message || '登録に失敗しました');
      }
    } catch (error) {
      els.submitStatus.textContent = `送信できませんでした：${error.message}。端末内ベストには保存済みです。`;
    } finally {
      els.submitScoreButton.disabled = false;
    }
  }

  async function showRanking() {
    els.rankingPanel.classList.remove('hidden');
    els.rankingList.innerHTML = '<div class="empty">ランキングを読み込み中です...</div>';
    const mode = els.rankingMode.value;
    try {
      const response = await gasJsonp(DEFAULT_GAS_URL, { action: 'ranking', mode, limit: 50 });
      if (!response || !response.ok) throw new Error(response?.message || 'ランキングを取得できませんでした');
      renderRanking(response.items || [], 'gas');
    } catch (error) {
      els.rankingList.innerHTML = `<div class="empty">全国ランキングを取得できませんでした。端末内ベストを表示します。<br>${escapeHtml(error.message)}</div>`;
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

  function resetToSetup() {
    els.finishPanel.classList.add('hidden');
    els.rankingPanel.classList.add('hidden');
    els.setupPanel.classList.remove('hidden');
    updateStatsUi();
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

  function formatBirthDateInput(input) {
    const digits = String(input.value || '').replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 4)}/${digits.slice(4, 6)}`;
    if (digits.length > 6) formatted = `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6, 8)}`;
    input.value = formatted;
  }

  function quantityInputText(value) {
    const normalized = String(value || '').normalize('NFKC').trim();
    const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)/);
    return match ? match[1] : normalized;
  }

  function dailyCountInputText(value) {
    const normalized = String(value || '').normalize('NFKC').trim();
    const match = normalized.match(/1日([0-9]+(?:\.[0-9]+)?)回/);
    return match ? match[1] : quantityInputText(normalized);
  }

  function isPatchExternal(template) {
    return /テープ|パップ|貼付|プラスター/i.test(String(template?.name || ''));
  }

  function isNumericOnlyField(key) {
    return ['amount', 'perDose', 'totalQuantity', 'daysText', 'timesText', 'usageDailyCount'].includes(key);
  }

  function isIntegerOnlyField(key) {
    return ['daysText', 'timesText', 'usageDailyCount'].includes(key);
  }

  function fieldInputAttributes(field) {
    if (isIntegerOnlyField(field.key)) {
      return 'inputmode="numeric" pattern="[0-9]*" autocomplete="off" autocapitalize="off" spellcheck="false" data-input-kind="number"';
    }
    if (isNumericOnlyField(field.key)) {
      return 'inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" data-input-kind="number"';
    }
    if (field.key === 'name') {
      return 'inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" lang="ja" data-input-kind="kana"';
    }
    return 'inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" lang="ja"';
  }

  function inputPlaceholder(field) {
    if (field.key === 'usageDailyCount') return '例：1日1回 → 1';
    if (isNumericOnlyField(field.key)) return `${field.label}（数字のみ）`;
    if (field.key === 'usage') return '例：朝 / 分1 / 毎食後';
    if (field.key === 'timing') return '例：疼痛時 / 発熱時';
    return field.label;
  }

  function buildDrugMaster() {
    const map = new Map();
    MED_SETS.forEach((set) => {
      set.drugs.forEach((drug) => {
        if (map.has(drug.name)) return;
        const reading = drug.reading || drug.name;
        map.set(drug.name, {
          name: drug.name,
          reading,
          department: set.department,
          theme: set.theme,
          searchName: normalizeSearchText(drug.name),
          searchReading: normalizeSearchText(reading),
          searchRomaji: buildDrugRomajiSearchTexts(drug.name, reading)
        });
      });
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  }

  function buildUsageMaster() {
    const map = new Map();
    const add = (text, kind) => {
      if (!text || map.has(text)) return;
      map.set(text, { text, kind, searchText: normalizeSearchText(text) });
    };
    ['分1 朝食後', '分1 朝食前', '分1 夕食後', '分2 朝夕食後', '分2 朝食後・夕食後', '分3 毎食後', '分3 毎食前', '1日1回', '1日2回', '疼痛時', '発熱時'].forEach(text => add(text, '標準候補'));
    MED_SETS.forEach((set) => {
      set.drugs.forEach((drug) => {
        (drug.usages || []).forEach(text => add(text, `${set.department} / ${set.theme}`));
        (drug.timings || []).forEach(text => add(text, '頓服タイミング'));
      });
    });
    return [...map.values()].sort((a, b) => a.text.localeCompare(b.text, 'ja'));
  }

  function typeLabel(type) {
    return ({ regular: '内服', external: '外用', prn: '頓服' })[type] || '内服';
  }


  function itemDisplayText(item) {
    if (item.type === 'external') return `${item.name}　${item.totalQuantity}　${item.site}　${item.usage}`;
    if (item.type === 'prn') return `${item.name}　${item.perDose}　${item.timing}　${item.timesText}`;
    return `${item.name}　${item.amount}　${item.usage}　${item.daysText}`;
  }

  function buildDrugRomajiSearchTexts(name, reading) {
    const sourceTexts = [name, reading, stripNonKana(name), stripNonKana(reading)].filter(Boolean);
    const set = new Set();
    sourceTexts.forEach((text) => {
      kanaToRomajiVariants(text).forEach((variant) => {
        const normalized = normalizeRomajiQuery(variant);
        if (normalized) set.add(normalized);
      });
    });
    return [...set];
  }

  function stripNonKana(text) {
    return String(text || '').replace(/[^ぁ-んァ-ンーッャュョヮヵヶヴー]/g, '');
  }

  function normalizeRomajiQuery(text) {
    return String(text || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^a-z0-9.%]/g, '')
      .trim();
  }

  function toHiraganaText(text) {
    return String(text || '').normalize('NFKC').replace(/[ァ-ン]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
  }

  function kanaToRomajiVariants(text) {
    const input = toHiraganaText(text);
    let variants = [''];
    let doubleNext = false;
    const maxVariants = 256;

    const appendAlternatives = (alts) => {
      const next = [];
      const safeAlts = alts && alts.length ? alts : [''];
      variants.forEach((base) => {
        safeAlts.forEach((alt) => {
          const prefix = doubleNext && alt ? firstConsonantForDouble(alt) : '';
          next.push(base + prefix + alt);
        });
      });
      variants = uniqueLimited(next, maxVariants);
      doubleNext = false;
    };

    const appendLongVowel = () => {
      const next = [];
      variants.forEach((base) => {
        next.push(base);
        const match = base.match(/[aiueo](?=[^aiueo]*$)/);
        if (match) next.push(base + match[0]);
      });
      variants = uniqueLimited(next, maxVariants);
      doubleNext = false;
    };

    for (let i = 0; i < input.length; i += 1) {
      const char = input[i];
      const nextChar = input[i + 1];
      const pair = char + (nextChar || '');

      if (char === 'っ') {
        doubleNext = true;
        continue;
      }
      if (char === 'ー') {
        // 長音は、tepu / teepu のどちらでも検索できるよう、省略版と母音追加版を作る。
        appendLongVowel();
        continue;
      }
      if (ROMAJI_DIGRAPHS[pair]) {
        appendAlternatives(ROMAJI_DIGRAPHS[pair]);
        i += 1;
        continue;
      }
      if (ROMAJI_CHARS[char]) {
        appendAlternatives(ROMAJI_CHARS[char]);
        continue;
      }
      if (/[a-z0-9.%]/i.test(char)) {
        appendAlternatives([char.toLowerCase()]);
        continue;
      }
      // 漢字や記号は読み検索では無視する。reading が設定されている薬品は reading 側で検索される。
    }
    return uniqueLimited(variants.map(normalizeRomajiQuery).filter(Boolean), maxVariants);
  }

  function firstConsonantForDouble(romaji) {
    if (!romaji) return '';
    if (romaji.startsWith('ch')) return 't';
    if (romaji.startsWith('sh')) return 's';
    if (romaji.startsWith('j')) return 'j';
    const first = romaji[0];
    return /[bcdfghjklmnpqrstvwxyz]/.test(first) ? first : '';
  }

  function uniqueLimited(list, limit = 256) {
    return [...new Set(list)].slice(0, limit);
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

  function normalizeForCompare(text) {
    return String(text || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\s　]+/g, '')
      .replace(/[・･,，、。\.\/／]/g, '')
      .replace(/[‐―ｰー－-]/g, '')
      .replace(/錠剤/g, '錠')
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

  function formatDateSlash(date) {
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
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function cssEscape(value) {
    if (globalThis.CSS?.escape) return globalThis.CSS.escape(String(value));
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
  }

  init();
})();
