(() => {
  'use strict';

  // ===== 상수 =====
  const PALETTE = [
    '#ff5959', '#ff8a5b', '#ffb84c', '#ffd93d', '#fff36b',
    '#a8e063', '#56c596', '#3cc4c7', '#5bc0ff', '#4c8dff',
    '#7d6cff', '#b56cff', '#ff7eb6', '#ff5fa2', '#a05a2c',
    '#d8c9a3', '#ffffff', '#cfd6e4', '#7a8298', '#1f2a44'
  ];

  const SIZE_PRESETS = {
    landscape: { small: [16, 9],  medium: [24, 14], large: [32, 18], xlarge: [64, 36],  xxlarge: [128, 72]  },
    square:    { small: [16, 16], medium: [24, 24], large: [32, 32], xlarge: [64, 64],  xxlarge: [128, 128] },
    portrait:  { small: [9, 16],  medium: [14, 24], large: [18, 32], xlarge: [36, 64],  xxlarge: [72, 128]  }
  };

  const STORAGE_KEY = 'pixelworld:v1';
  const MAX_HISTORY = 50;


  const LANG_STORAGE_KEY = 'pixelworld:lang';
  const DEFAULT_LANG = 'ko';
  const I18N = {
    ko: {
      langCode: 'ko', langName: '한국어', langToggleLabel: 'Switch to English',
      eraseHint: '같은 칸을 다시 누르면 지워져요!', homeTitle: '홈으로 가기', homeMsg: '홈 화면으로 돌아가요. 현재 그림은 자동으로 저장돼요.',
      backTitle: '이전 단계로', backMsg: '캔버스 크기 선택 화면으로 돌아가요. 다시 크기를 고르면 지금 그림이 사라질 수 있어요.',
      emptyCanvas: '이미 빈 캔버스예요!', clearTitle: '전체 지우기', clearMsg: '지금 그린 그림이 모두 사라져요. 정말 지울까요?', cleared: '캔버스를 비웠어요!',
      myDrawing: '내그림', saved: '저장했어요!', loadTitle: '불러오기', loadMsg: '지금 그린 그림이 사라지고 새 그림을 불러와요. 계속할까요?', imageSaved: '이미지로 저장했어요!', copiedImage: '이미지가 클립보드에 복사됐어요!', copyUnsupported: '이 브라우저에서는 복사를 지원하지 않아요.', shareCopied: '공유 링크를 복사했어요!', sharePrompt: '이 링크를 복사해서 공유하세요:', drawFirst: '먼저 그림을 그려 주세요!', patternMade: '색상 {count}개로 도안을 만들었어요! 편집은 위쪽 버튼으로 돌아가세요.', formatError: '형식 오류', endPatternTitle: '도안 끝내기', endPatternMsg: '번호 안내를 끄고 자유롭게 그릴 수 있어요. 지금까지 색칠한 그림은 그대로 남아요.', patternColorLabel: '번호에 맞게 색칠해요!', patternChartLabel: '색칠 도안 (숫자 = 색깔)', savePattern: '도안 저장', uploadGallery: '갤러리에 올리기', endPattern: '도안 끝내기', colorPickedNum: '{num}번 색을 골랐어요!', patternFile: '도안', patternSaved: '도안 파일을 저장했어요!', landscape: '가로', square: '정사각형', portrait: '세로', other: '기타', galleryNoServer: '아직 갤러리 서버가 연결되지 않았어요.<br>Google Apps Script 웹앱을 배포한 뒤 <code>app.js</code>의 <code>GALLERY_API_URL</code>에 주소를 넣으면<br>친구들과 도안을 주고받을 수 있어요!<br>(설정 방법은 <code>apps-script/README.md</code> 참고)', loadingPatterns: '도안을 불러오는 중...', galleryLoadFailed: '갤러리를 불러오지 못했어요.<br>잠시 후 다시 시도해 주세요.', all: '전체', noPatterns: '아직 올라온 도안이 없어요.<br>첫 번째 도안을 올려 보세요!', noRatioPatterns: '{ratio} 비율 도안이 아직 없어요.', patternLoaded: '도안을 불러왔어요! 번호에 맞게 색칠해 보세요.', patternLoadFailed: '이 도안을 불러올 수 없어요.', patternPreview: '{title} 미리보기', colorIt: '색칠하기', galleryNoServerToast: '갤러리 서버가 설정되지 않았어요.', agreeRequired: '공유 안내에 동의해야 제출할 수 있어요.', titleAuthorRequired: '작품명과 작가를 모두 적어 주세요.', galleryConfirmTitle: '갤러리 공유 확인', galleryConfirmMsg: '제출하면 삭제할 수 없고, 이 앱에 접속하는 모든 사람에게 공유됩니다. 다른 사람에게 피해를 주거나 불쾌감을 주는 자료가 아닌지 다시 확인했나요?', uploading: '갤러리에 올리는 중...', uploaded: '갤러리에 올렸어요!', uploadFailed: '갤러리에 올리지 못했어요.', adminPasswordCheck: '관리자 비밀번호를 확인해 주세요.', adminTotal: '총 {count}개의 도안', adminEmpty: '관리할 도안이 아직 없어요.', title: '작품명', author: '작가(만든이)', views: '조회', noDate: '날짜 없음', edit: '수정', delete: '삭제', titleAuthorCheck: '작품명과 작가를 확인해 주세요.', updated: '도안을 수정했어요.', updateFailed: '도안을 수정하지 못했어요.', thisPattern: '이 도안', deleteTitle: '도안 삭제', deleteMsg: '「{title}」 도안을 갤러리에서 삭제할까요? 이 작업은 되돌릴 수 없어요.', deleted: '도안을 삭제했어요.', deleteFailed: '도안을 삭제하지 못했어요.', hideGuides: '가이드라인 숨기기', showGuides: '가이드라인 보기', referenceImage: '참고 이미지', referenceHint: '참고할 이미지를 올리면<br />여기에 보여요!', colorPicked: '{color} 색을 골랐어요!', eyedropperOn: '스포이트: 색을 추출할 칸을 눌러요!', eyedropperOff: '스포이트를 껐어요.', emptyCell: '빈 칸이에요. 색칠된 칸을 눌러 주세요.', fileReadFailed: '파일을 읽을 수 없어요.', loaded: '불러왔어요!', patternFileReadFailed: '도안 파일을 읽을 수 없어요.', shareReadFailed: '공유 링크를 읽을 수 없어요.'
    },
    en: {
      langCode: 'en', langName: 'English', langToggleLabel: '한국어로 전환',
      eraseHint: 'Tap the same cell again to erase it!', homeTitle: 'Go home', homeMsg: 'Return to the home screen. Your current drawing is saved automatically.',
      backTitle: 'Go back', backMsg: 'Return to canvas size selection. Choosing a new size may clear your current drawing.',
      emptyCanvas: 'The canvas is already empty!', clearTitle: 'Clear canvas', clearMsg: 'Everything you drew will disappear. Are you sure?', cleared: 'Canvas cleared!',
      myDrawing: 'my-drawing', saved: 'Saved!', loadTitle: 'Load', loadMsg: 'Your current drawing will be replaced. Continue?', imageSaved: 'Saved as an image!', copiedImage: 'Image copied to the clipboard!', copyUnsupported: 'Copy is not supported in this browser.', shareCopied: 'Share link copied!', sharePrompt: 'Copy this link to share:', drawFirst: 'Draw something first!', patternMade: 'Made a pattern with {count} colors! Use the top button to return to editing.', formatError: 'Invalid format', endPatternTitle: 'Finish pattern', endPatternMsg: 'Turn off the number guide and draw freely. Your colored pixels will stay.', patternColorLabel: 'Color by number!', patternChartLabel: 'Coloring pattern (number = color)', savePattern: 'Save pattern', uploadGallery: 'Upload to gallery', endPattern: 'Finish pattern', colorPickedNum: 'Selected color #{num}!', patternFile: 'pattern', patternSaved: 'Pattern file saved!', landscape: 'Landscape', square: 'Square', portrait: 'Portrait', other: 'Other', galleryNoServer: 'The gallery server is not connected yet.<br>Deploy the Google Apps Script web app, then add its URL to <code>GALLERY_API_URL</code> in <code>app.js</code>.<br>After that, everyone can share patterns!<br>(See <code>apps-script/README.md</code> for setup.)', loadingPatterns: 'Loading patterns...', galleryLoadFailed: 'Could not load the gallery.<br>Please try again later.', all: 'All', noPatterns: 'No patterns have been uploaded yet.<br>Upload the first one!', noRatioPatterns: 'No {ratio} patterns yet.', patternLoaded: 'Pattern loaded! Try coloring by number.', patternLoadFailed: 'Could not load this pattern.', patternPreview: '{title} preview', colorIt: 'Color it', galleryNoServerToast: 'Gallery server is not configured.', agreeRequired: 'You need to agree before submitting.', titleAuthorRequired: 'Please enter both title and artist.', galleryConfirmTitle: 'Confirm gallery sharing', galleryConfirmMsg: 'After submitting, this will be public to everyone using this app and cannot be deleted by you. Please confirm it is not harmful or offensive.', uploading: 'Uploading to gallery...', uploaded: 'Uploaded to gallery!', uploadFailed: 'Could not upload to gallery.', adminPasswordCheck: 'Please check the admin password.', adminTotal: '{count} patterns total', adminEmpty: 'There are no patterns to manage yet.', title: 'Title', author: 'Artist', views: 'Views', noDate: 'No date', edit: 'Update', delete: 'Delete', titleAuthorCheck: 'Please check the title and artist.', updated: 'Pattern updated.', updateFailed: 'Could not update the pattern.', thisPattern: 'this pattern', deleteTitle: 'Delete pattern', deleteMsg: 'Delete “{title}” from the gallery? This cannot be undone.', deleted: 'Pattern deleted.', deleteFailed: 'Could not delete the pattern.', hideGuides: 'Hide guides', showGuides: 'Show guides', referenceImage: 'Reference image', referenceHint: 'Upload a reference image<br />and it will appear here!', colorPicked: 'Selected {color}!', eyedropperOn: 'Eyedropper: tap a colored cell to pick it!', eyedropperOff: 'Eyedropper off.', emptyCell: 'Empty cell. Tap a colored cell.', fileReadFailed: 'Could not read the file.', loaded: 'Loaded!', patternFileReadFailed: 'Could not read the pattern file.', shareReadFailed: 'Could not read the share link.'
    }
  };
  let currentLang = getInitialLang();
  function getInitialLang() {
    try { const saved = localStorage.getItem(LANG_STORAGE_KEY); if (I18N[saved]) return saved; } catch (_) {}
    return (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : DEFAULT_LANG;
  }
  function t(key, vars = {}) {
    const table = I18N[currentLang] || I18N[DEFAULT_LANG];
    return (table[key] || I18N[DEFAULT_LANG][key] || key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  }
  function setLanguage(lang) {
    if (!I18N[lang]) return;
    currentLang = lang;
    document.documentElement.lang = t('langCode');
    try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (_) {}
    applyStaticTranslations();
    updateGuidesUI();
    if (state.patternMode) buildLegendBar();
    if (galleryModal && galleryModal.classList.contains('open')) renderGalleryList();
  }

  const STATIC_EN = {
    '나만의 픽셀아트를 만들어 보아요!': 'Create your own pixel art!',
    '1단계 · 캔버스 모양을 골라요': 'Step 1 · Choose a canvas shape',
    '가로 모드': 'Landscape mode', '정사각형 모드': 'Square mode', '세로 모드': 'Portrait mode',
    '도안 갤러리': 'Pattern Gallery', '친구들이 공유한 도안을 골라 색칠해요': 'Choose and color patterns shared by friends',
    '픽셀 칸 수를 정해요': 'Choose the number of pixel cells', '2단계 · 그림 크기를 골라요': 'Step 2 · Choose a drawing size',
    '소 (S)': 'Small (S)', '중 (M)': 'Medium (M)', '대 (L)': 'Large (L)', '특대 (XL)': 'Extra Large (XL)', '초대형(XXL)': 'Huge (XXL)',
    '이전 단계': 'Previous step', '붓 크기': 'Brush size', '이전 단계로 이동': 'Go to previous step', '홈으로 이동': 'Go home', '첫 화면으로 이동': 'Go to first screen', '홈으로': 'Home', '사용자 지정 색': 'Custom color', '스포이트 (색 추출)': 'Eyedropper (pick color)', '되돌리기': 'Undo', '다시 실행': 'Redo', '더보기': 'More', '닫기': 'Close', '사용법 보기': 'Open help', '갤러리에 올리기': 'Upload to gallery', '작가(만든이)': 'Artist', '관리자 모드 열기': 'Open admin mode', '1칸': '1 cell', '4칸': '4 cells', '9칸': '9 cells',
    '같은 칸을 다시 누르면 지워져요': 'Tap the same cell again to erase it', '색상': 'Color', '그림 참고하기': 'Reference image',
    '가이드라인 숨기기': 'Hide guides', '가이드라인 보기': 'Show guides', '저장하기': 'Save', '불러오기': 'Load', '이미지 저장': 'Save image', '이미지 복사': 'Copy image', '링크 공유': 'Share link', '도안 만들기': 'Make pattern', '도안 불러오기': 'Load pattern', '전체 지우기': 'Clear all',
    '편집 화면으로 돌아가기': 'Back to editing', '이미지를 선택하세요': 'Choose an image', '참고할 이미지를 올리면여기에 보여요!': 'Upload a reference image and it will appear here!', '이미지 지우기': 'Remove image', '색칠 도안': 'Coloring pattern',
    '확인': 'Confirm', '정말 진행할까요?': 'Do you want to continue?', '취소': 'Cancel', '사용법': 'How to use',
    '모양·크기': 'Shape & size', '캔버스 모양과 픽셀 칸 수를 골라요. 도안 갤러리에서 바로 시작할 수도 있어요': 'Choose a canvas shape and pixel count. You can also start from the pattern gallery.',
    '붓·색상': 'Brush & color', '붓 크기와 색을 고른 뒤 칸을 터치해요. 같은 색을 다시 누르면 지워져요': 'Choose a brush size and color, then tap cells. Tap the same color again to erase.',
    '도안 색칠': 'Color patterns', '갤러리 도안을 누르면 번호대로 색칠하는 화면이 바로 열려요': 'Tap a gallery pattern to open color-by-number mode.',
    '참고·편집': 'Reference & edit', '더보기(⋮)에서 그림 참고하기·가이드라인, 되돌리기·다시 실행을 써요': 'Use reference image, guides, undo, and redo from More (⋮).',
    '저장·공유': 'Save & share', '더보기(⋮)에서 이미지 저장·복사, 링크 공유, 갤러리에 올리기를 해요': 'Use More (⋮) to save/copy images, share links, and upload to the gallery.',
    '정렬': 'Sort', '최신순': 'Newest', '인기순': 'Popular', '작품명': 'Title', '작가(만든이)': 'Artist', '예: 무지개 고양이': 'Ex: Rainbow Cat', '예: 3학년 김픽셀': 'Ex: Pixel Kim, Grade 3',
    '올리면 삭제할 수 없고, 이 앱에 접속하는 모든 사람에게 공유됩니다. 다른 사람에게 피해를 주거나 불쾌감을 주는 자료를 올리지 않겠습니다.': 'After uploading, it cannot be deleted by you and will be shared with everyone who uses this app. I will not upload anything harmful or offensive to others.',
    'Apps Script 속성의 ADMIN_PASSWORD': 'ADMIN_PASSWORD from Apps Script properties', '동의하고 제출': 'Agree and submit', '관리자 모드': 'Admin mode', '입장': 'Enter', '새로고침': 'Refresh', 'Created by. 교육뮤지컬 꿈꾸는 치수쌤': 'Created by. Education Musical Chichiboo'
  };
  const STATIC_KO = Object.fromEntries(Object.entries(STATIC_EN).map(([ko, en]) => [en, ko]));
  function translateTextNodes(root, table) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const raw = node.nodeValue;
      const compact = raw.replace(/\s+/g, ' ').trim();
      if (!compact) return;
      const direct = table[compact] || table[raw.trim()];
      if (direct) node.nodeValue = raw.replace(raw.trim(), direct);
    });
  }
  function applyAttributeTranslations(table) {
    document.querySelectorAll('[title], [aria-label], [placeholder]').forEach(el => {
      ['title', 'aria-label', 'placeholder'].forEach(attr => {
        const value = el.getAttribute(attr);
        if (value && table[value]) el.setAttribute(attr, table[value]);
      });
    });
  }
  function applyStaticTranslations() {
    const staticTable = currentLang === 'en' ? STATIC_EN : STATIC_KO;
    translateTextNodes(document.body, staticTable);
    applyAttributeTranslations(staticTable);
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel)); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-language-toggle]').forEach(langBtn => {
      const next = currentLang === 'ko' ? 'en' : 'ko';
      langBtn.dataset.langNext = next;
      langBtn.title = t('langToggleLabel');
      langBtn.setAttribute('aria-label', t('langToggleLabel'));
      const label = langBtn.querySelector('.language-label');
      if (label) label.textContent = currentLang.toUpperCase();
    });
  }

  // 도안 갤러리 서버 (Google Apps Script 웹앱 URL).
  // 비워두면 갤러리는 설정 안내만 표시됩니다. apps-script/Code.gs 참고.
  const GALLERY_API_URL = 'https://script.google.com/macros/s/AKfycbyJslq6cMLVZpxeXqQ6ropJ7PRPJ-b45-8HIA9i1saDsVzk8sxfJeui7pi3hwx8EELj/exec';

  // ===== 상태 =====
  let state = {
    ratio: 'square',
    sizeKey: 'medium',
    cols: 24,
    rows: 24,
    pixels: [],
    currentColor: '#4c8dff',
    brushSize: 1,
    eyedropper: false,     // 스포이트(색 추출) 모드 여부
    guidesVisible: true,
    currentScreen: null,
    patternMode: null,     // null | 'chart'(도안 보기) | 'color'(번호대로 색칠)
    patternCells: null,    // 각 칸의 번호 배열 (0 = 빈 칸)
    patternLegend: null    // [{ num, color }]
  };

  let undoStack = [];
  let redoStack = [];
  let strokeStartSnapshot = null;
  let strokeMode = null;
  let isPointerDown = false;
  let modalResolver = null;
  let referenceFloatPos = null; // 세로모드 플로팅 패널 위치 (세션 한정)
  let galleryItems = [];
  let galleryRatioFilter = 'all';
  let gallerySort = 'recent';   // 'recent'(최신순) | 'popular'(인기순)
  let viewedGalleryIds = new Set(); // 한 세션에서 중복 조회수 증가 방지
  let adminPassword = '';

  // ===== DOM =====
  const screens = {
    ratio: document.getElementById('screen-ratio'),
    size: document.getElementById('screen-size'),
    editor: document.getElementById('screen-editor')
  };
  const mPalette = document.getElementById('m-palette');
  const pixelGrid = document.getElementById('pixel-grid');
  const canvasArea = document.querySelector('.canvas-area');
  const canvasWrapper = document.getElementById('canvas-wrapper');
  const inputCustomColor = document.getElementById('input-custom-color');
  const editorMain = document.querySelector('.editor-main');
  const referencePanel = document.getElementById('reference-panel');
  const referencePreview = document.getElementById('reference-preview');
  const inputReference = document.getElementById('input-reference');
  const btnRemoveReference = document.getElementById('btn-remove-reference');
  const inputLoadJson = document.getElementById('input-load-json');
  const inputLoadPattern = document.getElementById('input-load-pattern');
  const patternLegendEl = document.getElementById('pattern-legend');
  const patternLegendLabel = document.getElementById('pattern-legend-label');
  const patternLegendActions = document.getElementById('pattern-legend-actions');
  const patternLegendItems = document.getElementById('pattern-legend-items');
  const patternFab = document.getElementById('pattern-fab');
  const btnReturnToDrawing = document.getElementById('btn-return-to-drawing');
  const galleryModal = document.getElementById('gallery-modal');
  const galleryTabs = document.getElementById('gallery-tabs');
  const gallerySortEl = document.getElementById('gallery-sort');
  const galleryBody = document.getElementById('gallery-body');
  const galleryUploadModal = document.getElementById('gallery-upload-modal');
  const galleryUploadForm = document.getElementById('gallery-upload-form');
  const galleryUploadTitle = document.getElementById('gallery-upload-title');
  const galleryUploadAuthor = document.getElementById('gallery-upload-author');
  const galleryUploadAgree = document.getElementById('gallery-upload-agree');
  const helpModal = document.getElementById('help-modal');
  const adminModal = document.getElementById('admin-modal');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminPasswordInput = document.getElementById('admin-password');
  const adminDashboard = document.getElementById('admin-dashboard');
  const adminSummary = document.getElementById('admin-summary');
  const adminList = document.getElementById('admin-list');
  const toastEl = document.getElementById('toast');
  const modalEl = document.getElementById('modal-confirm');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');

  // 도구 트리거 / 팝오버
  const mBrushIndicator = document.getElementById('m-brush-indicator');
  const mColorIndicator = document.getElementById('m-color-indicator');
  const mTriggerBrush = document.getElementById('m-trigger-brush');
  const mTriggerColor = document.getElementById('m-trigger-color');
  const mTriggerCustom = document.getElementById('m-trigger-custom');
  const mTriggerEyedropper = document.getElementById('m-trigger-eyedropper');
  const mPopBrush = document.getElementById('m-pop-brush');
  const mPopColor = document.getElementById('m-pop-color');
  const btnMore = document.getElementById('btn-more');
  const dropdownMore = document.getElementById('dropdown-more');
  const moreGuidesLabel = document.getElementById('more-guides-label');

  // ===== 화면 전환 =====
  function showScreen(name) {
    Object.entries(screens).forEach(([k, el]) => {
      el.classList.toggle('active', k === name);
    });
    state.currentScreen = name;
    saveLocal();
    if (name === 'editor') {
      requestAnimationFrame(() => resizeCanvas());
    }
  }

  // ===== 토스트 =====
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // ===== 모달 =====
  function showConfirm(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalEl.classList.add('open');
    return new Promise(resolve => { modalResolver = resolve; });
  }
  document.getElementById('modal-ok').addEventListener('click', () => {
    modalEl.classList.remove('open');
    if (modalResolver) modalResolver(true);
  });
  document.getElementById('modal-cancel').addEventListener('click', () => {
    modalEl.classList.remove('open');
    if (modalResolver) modalResolver(false);
  });
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) {
      modalEl.classList.remove('open');
      if (modalResolver) modalResolver(false);
    }
  });

  // ===== 1단계 =====
  document.querySelectorAll('#screen-ratio .choice-card[data-ratio]').forEach(card => {
    card.addEventListener('click', () => {
      state.ratio = card.dataset.ratio;
      updateSizeLabels();
      showScreen('size');
    });
  });
  document.getElementById('btn-back-to-ratio').addEventListener('click', () => showScreen('ratio'));
  document.getElementById('btn-gallery-home').addEventListener('click', handleGallery);

  function updateSizeLabels() {
    const presets = SIZE_PRESETS[state.ratio];
    document.getElementById('desc-small').textContent  = `${presets.small[0]} × ${presets.small[1]}`;
    document.getElementById('desc-medium').textContent = `${presets.medium[0]} × ${presets.medium[1]}`;
    document.getElementById('desc-large').textContent  = `${presets.large[0]} × ${presets.large[1]}`;
    const descXlarge = document.getElementById('desc-xlarge');
    if (descXlarge) descXlarge.textContent = `${presets.xlarge[0]} × ${presets.xlarge[1]}`;
    const descXxlarge = document.getElementById('desc-xxlarge');
    if (descXxlarge) descXxlarge.textContent = `${presets.xxlarge[0]} × ${presets.xxlarge[1]}`;
  }

  // ===== 2단계 =====
  document.querySelectorAll('#screen-size .choice-card').forEach(card => {
    card.addEventListener('click', () => {
      state.sizeKey = card.dataset.size;
      const [cols, rows] = SIZE_PRESETS[state.ratio][state.sizeKey];
      state.cols = cols;
      state.rows = rows;
      state.pixels = new Array(cols * rows).fill(null);
      state.patternMode = null;
      state.patternCells = null;
      state.patternLegend = null;
      undoStack = [];
      redoStack = [];
      enterEditor();
    });
  });

  // ===== 에디터 진입 =====
  function enterEditor() {
    setEyedropper(false);
    buildPalette();
    buildGrid();
    updateCurrentColorChip();
    syncSizeButtons();
    updateHistoryButtons();
    updateGuidesUI();
    if (state.patternMode) applyPatternUI(); else clearPatternUI();
    saveLocal();
    showScreen('editor');
    maybeShowEraseHint();
  }
  function maybeShowEraseHint() {
    try {
      if (localStorage.getItem('pixelworld:eraseHintShown')) return;
      setTimeout(() => {
        toast(t('eraseHint'));
        localStorage.setItem('pixelworld:eraseHintShown', '1');
      }, 1200);
    } catch (_) {}
  }
  const BRUSH_BADGE = { 1: '1', 2: '4', 3: '9' };
  function syncSizeButtons() {
    document.querySelectorAll('.size-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.brush, 10) === state.brushSize);
    });
    if (mBrushIndicator) {
      mBrushIndicator.textContent = BRUSH_BADGE[state.brushSize] || '1';
    }
  }

  // ===== 액션 핸들러 (네임드 함수) =====
  async function handleHome() {
    const ok = await showConfirm(t('homeTitle'), t('homeMsg'));
    if (!ok) return;
    saveLocal();
    showScreen('ratio');
  }
  async function handleBackStep() {
    const ok = await showConfirm(t('backTitle'), t('backMsg'));
    if (!ok) return;
    saveLocal();
    updateSizeLabels();
    showScreen('size');
  }
  async function handleClear() {
    const hasContent = state.pixels.some(p => p !== null);
    if (!hasContent) { toast(t('emptyCanvas')); return; }
    const ok = await showConfirm(t('clearTitle'), t('clearMsg'));
    if (!ok) return;
    pushUndo(state.pixels.slice());
    state.pixels = new Array(state.cols * state.rows).fill(null);
    refreshGrid();
    saveLocal();
    toast(t('cleared'));
  }
  function handleGuidesToggle() {
    state.guidesVisible = !state.guidesVisible;
    updateGuidesUI();
    saveLocal();
  }
  function handleReferenceToggle() {
    editorMain.classList.toggle('reference-open');
    if (editorMain.classList.contains('reference-open') && isPortrait()) {
      applyFloatingPosition();
    }
    requestAnimationFrame(() => resizeCanvas());
  }
  function isPortrait() {
    return window.matchMedia('(orientation: portrait)').matches;
  }
  function applyFloatingPosition() {
    if (!referencePanel) return;
    if (referenceFloatPos) {
      referencePanel.style.left = referenceFloatPos.left + 'px';
      referencePanel.style.top = referenceFloatPos.top + 'px';
      referencePanel.style.right = 'auto';
    } else {
      referencePanel.style.left = '';
      referencePanel.style.top = '';
      referencePanel.style.right = '';
    }
  }
  function todayStr() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
  function downloadJsonFile(data, filename) {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json;charset=utf-8' });
    if (typeof navigator.msSaveOrOpenBlob === 'function') {
      navigator.msSaveOrOpenBlob(blob, filename);
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // 일부 모바일 브라우저는 click 이후 비동기로 Blob을 읽는다.
    // 즉시 revoke하면 다운로드가 시작되기 전에 URL이 사라질 수 있다.
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function handleSaveJson() {
    const data = {
      app: 'pixelworld',
      version: 1,
      ratio: state.ratio,
      sizeKey: state.sizeKey,
      cols: state.cols,
      rows: state.rows,
      pixels: state.pixels,
      patternMode: state.patternMode,
      patternCells: state.patternCells,
      patternLegend: state.patternLegend,
      savedAt: new Date().toISOString()
    };
    downloadJsonFile(data, `${t('myDrawing')}-${todayStr()}.json`);
    toast(t('saved'));
  }
  async function handleLoadJson() {
    const hasContent = Array.isArray(state.pixels) && state.pixels.some(p => p !== null);
    if (hasContent) {
      const ok = await showConfirm(t('loadTitle'), t('loadMsg'));
      if (!ok) return;
    }
    inputLoadJson.value = '';
    inputLoadJson.click();
  }
  function handleExportJpg() {
    const c = renderToCanvas();
    c.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${t('myDrawing')}-${todayStr()}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast(t('imageSaved'));
    }, 'image/jpeg', 0.92);
  }
  function handleCopyJpg() {
    const c = renderToCanvas();
    c.toBlob(async (blob) => {
      try {
        if (!navigator.clipboard || !window.ClipboardItem) throw new Error('not supported');
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        toast(t('copiedImage'));
      } catch (err) {
        toast(t('copyUnsupported'));
      }
    }, 'image/png');
  }
  async function handleShareLink() {
    const payload = {
      r: state.ratio,
      s: state.sizeKey,
      c: state.cols,
      h: state.rows,
      p: compressPixels(state.pixels)
    };
    const json = JSON.stringify(payload);
    const encoded = base64UrlEncode(json);
    const url = `${location.origin}${location.pathname}#art=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      toast(t('shareCopied'));
    } catch (err) {
      prompt(t('sharePrompt'), url);
    }
  }

  // ===== 도안(컬러링) 기능 =====
  // 완성된 그림 → 색상별 번호 배정 (첫 등장 순서대로 1, 2, 3...)
  function buildPatternFromPixels(pixels) {
    const colorToNum = new Map();
    const legend = [];
    const cells = new Array(pixels.length).fill(0);
    for (let i = 0; i < pixels.length; i++) {
      const c = pixels[i];
      if (!c) continue;
      const key = c.toLowerCase();
      let num = colorToNum.get(key);
      if (num === undefined) {
        num = legend.length + 1;
        colorToNum.set(key, num);
        legend.push({ num, color: c });
      }
      cells[i] = num;
    }
    return { legend, cells };
  }

  function handleMakePattern() {
    const filled = state.pixels.some(p => p);
    if (!filled) { toast(t('drawFirst')); return; }
    const { legend, cells } = buildPatternFromPixels(state.pixels);
    state.patternMode = 'chart';
    state.patternCells = cells;
    state.patternLegend = legend;
    applyPatternUI();
    saveLocal();
    toast(t('patternMade', { count: legend.length }));
  }

  function handleLoadPattern() {
    inputLoadPattern.value = '';
    inputLoadPattern.click();
  }

  function loadPatternData(data) {
    if (!data || !Array.isArray(data.cells) || !Array.isArray(data.legend) || !data.cols || !data.rows) {
      throw new Error(t('formatError'));
    }
    const total = data.cols * data.rows;
    state.ratio = data.ratio || 'square';
    state.sizeKey = data.sizeKey || 'medium';
    state.cols = data.cols;
    state.rows = data.rows;
    state.pixels = new Array(total).fill(null);
    state.patternCells = data.cells.slice(0, total);
    while (state.patternCells.length < total) state.patternCells.push(0);
    state.patternLegend = data.legend.map(l => ({ num: l.num, color: l.color }));
    state.patternMode = 'color';
    undoStack = [];
    redoStack = [];
    buildPalette();
    buildGrid();
    syncSizeButtons();
    updateGuidesUI();
    updateHistoryButtons();
    applyPatternUI();
    if (state.patternLegend[0]) selectColor(state.patternLegend[0].color);
    showScreen('editor');
    saveLocal();
  }

  // 일반 그림(픽셀) 데이터 불러오기
  function loadDrawingData(data) {
    if (!data || !Array.isArray(data.pixels) || !data.cols || !data.rows) {
      throw new Error(t('formatError'));
    }
    const total = data.cols * data.rows;
    state.ratio = data.ratio || 'square';
    state.sizeKey = data.sizeKey || 'medium';
    state.cols = data.cols;
    state.rows = data.rows;
    state.pixels = data.pixels.slice(0, total);
    while (state.pixels.length < total) state.pixels.push(null);
    const hasPattern = (data.patternMode === 'chart' || data.patternMode === 'color')
      && Array.isArray(data.patternCells) && Array.isArray(data.patternLegend);
    state.patternMode = hasPattern ? data.patternMode : null;
    state.patternCells = hasPattern ? data.patternCells.slice(0, total) : null;
    if (state.patternCells) {
      while (state.patternCells.length < total) state.patternCells.push(0);
    }
    state.patternLegend = hasPattern ? data.patternLegend.map(l => ({ num: l.num, color: l.color })) : null;
    undoStack = [];
    redoStack = [];
    buildPalette();
    buildGrid();
    syncSizeButtons();
    updateGuidesUI();
    if (state.patternMode) applyPatternUI(); else clearPatternUI();
    updateHistoryButtons();
    showScreen('editor');
    saveLocal();
  }

  // 파일 종류(그림/도안)를 자동 판별해 알맞은 방식으로 불러온다.
  function loadProjectFile(data) {
    const isPattern = data && (data.type === 'pattern'
      || (!Array.isArray(data.pixels) && Array.isArray(data.cells) && Array.isArray(data.legend)));
    if (isPattern) loadPatternData(data);
    else loadDrawingData(data);
  }

  async function exitPatternMode() {
    if (state.patternMode === 'color') {
      const ok = await showConfirm(t('endPatternTitle'), t('endPatternMsg'));
      if (!ok) return;
    }
    state.patternMode = null;
    state.patternCells = null;
    state.patternLegend = null;
    clearPatternUI();
    refreshGrid();
    saveLocal();
  }

  function applyPatternUI() {
    if (!state.patternMode) { clearPatternUI(); return; }
    editorMain.classList.add('pattern-active');
    canvasWrapper.classList.toggle('pattern-chart', state.patternMode === 'chart');
    canvasWrapper.classList.toggle('pattern-color', state.patternMode === 'color');
    patternLegendEl.hidden = false;
    btnReturnToDrawing.hidden = state.patternMode !== 'chart';
    buildLegendBar();
    renderPatternNumbers();
    requestAnimationFrame(() => resizeCanvas());
  }

  function clearPatternUI() {
    editorMain.classList.remove('pattern-active');
    canvasWrapper.classList.remove('pattern-chart', 'pattern-color');
    if (patternLegendEl) patternLegendEl.hidden = true;
    if (patternFab) { patternFab.hidden = true; patternFab.innerHTML = ''; }
    btnReturnToDrawing.hidden = true;
    const cells = pixelGrid.children;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].dataset) delete cells[i].dataset.num;
    }
    requestAnimationFrame(() => resizeCanvas());
  }

  function renderPatternNumbers() {
    if (!state.patternCells) return;
    const cells = pixelGrid.children;
    for (let i = 0; i < state.patternCells.length && i < cells.length; i++) {
      if (cells[i].dataset) updateCellNum(cells[i], i);
    }
  }

  function buildLegendBar() {
    if (!patternLegendEl || !state.patternLegend) return;
    const isColor = state.patternMode === 'color';
    patternLegendLabel.textContent = isColor ? t('patternColorLabel') : t('patternChartLabel');

    patternLegendActions.innerHTML = '';
    if (patternFab) patternFab.innerHTML = '';
    if (state.patternMode === 'chart') {
      // 도안 보기(읽기 전용) — 기능 버튼을 캔버스 위 플로팅 버튼으로 제공
      addLegendAction(patternFab, 'download', t('savePattern'), downloadPattern, true);
      if (GALLERY_API_URL) addLegendAction(patternFab, 'cloud_upload', t('uploadGallery'), submitToGallery);
      if (patternFab) patternFab.hidden = false;
      // '그림으로 돌아가기'는 좌측 상단 플로팅 버튼(btn-return-to-drawing)으로 제공
    } else {
      if (patternFab) patternFab.hidden = true;
      addLegendAction(patternLegendActions, 'check_circle', t('endPattern'), exitPatternMode, true);
    }

    patternLegendItems.innerHTML = '';
    state.patternLegend.forEach(({ num, color }) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'legend-chip';
      chip.innerHTML =
        `<span class="legend-num">${num}</span>` +
        `<span class="legend-sw" style="background:${color}"></span>` +
        `<span class="legend-hex">${color.toUpperCase()}</span>`;
      if (isColor) {
        chip.addEventListener('click', () => {
          selectColor(color);
          toast(t('colorPickedNum', { num }));
        });
      } else {
        chip.classList.add('legend-chip-static');
      }
      patternLegendItems.appendChild(chip);
    });
  }

  function addLegendAction(container, icon, label, fn, isPrimary = false) {
    if (!container) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `legend-action btn ${isPrimary ? 'btn-primary' : 'btn-ghost'} btn-small`;
    b.innerHTML = `<span class="material-icons">${icon}</span> ${label}`;
    b.addEventListener('click', fn);
    container.appendChild(b);
  }

  btnReturnToDrawing.addEventListener('click', exitPatternMode);

  function downloadPattern() {
    if (!state.patternCells || !state.patternLegend) return;
    const data = {
      app: 'pixelworld',
      type: 'pattern',
      version: 1,
      ratio: state.ratio,
      sizeKey: state.sizeKey,
      cols: state.cols,
      rows: state.rows,
      legend: state.patternLegend,
      cells: state.patternCells,
      savedAt: new Date().toISOString()
    };
    downloadJsonFile(data, `${t('patternFile')}-${todayStr()}.json`);
    toast(t('patternSaved'));
  }

  // ===== 도안 갤러리 =====
  function handleGallery() {
    galleryModal.classList.add('open');
    galleryRatioFilter = 'all';
    loadGalleryList();
  }
  function closeGallery() {
    galleryModal.classList.remove('open');
  }
  document.getElementById('gallery-close').addEventListener('click', closeGallery);
  galleryModal.addEventListener('click', (e) => { if (e.target === galleryModal) closeGallery(); });

  if (gallerySortEl) {
    gallerySortEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.gallery-sort-btn');
      if (!btn) return;
      gallerySort = btn.dataset.sort === 'popular' ? 'popular' : 'recent';
      renderGalleryList();
    });
  }

  // 도안을 열어 색칠하기 시작하면 조회수(클릭수)를 1 올린다.
  // 같은 도안은 한 세션에서 한 번만 서버로 전송한다.
  function recordGalleryView(item) {
    if (!GALLERY_API_URL || !item || !item.id) return;
    if (viewedGalleryIds.has(item.id)) return;
    viewedGalleryIds.add(item.id);
    item.views = getViews(item) + 1;
    try {
      // text/plain 으로 보내 CORS preflight 를 피한다 (Apps Script 호환)
      fetch(GALLERY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'view', id: item.id }),
        keepalive: true
      }).catch(() => {});
    } catch (_) {}
  }

  function ratioLabel(ratio) {
    return { landscape: t('landscape'), square: t('square'), portrait: t('portrait') }[ratio] || t('other');
  }

  function getPatternRatio(item) {
    if (item && ['landscape', 'square', 'portrait'].includes(item.ratio)) return item.ratio;
    if (!item || !item.cols || !item.rows) return 'square';
    if (item.cols > item.rows) return 'landscape';
    if (item.cols < item.rows) return 'portrait';
    return 'square';
  }

  async function loadGalleryList() {
    if (!GALLERY_API_URL) {
      if (galleryTabs) galleryTabs.hidden = true;
      if (gallerySortEl) gallerySortEl.hidden = true;
      galleryBody.innerHTML = `<p class="gallery-msg">${t('galleryNoServer')}</p>`;
      return;
    }
    if (galleryTabs) galleryTabs.hidden = true;
    if (gallerySortEl) gallerySortEl.hidden = true;
    galleryBody.innerHTML = `<p class="gallery-msg">${t('loadingPatterns')}</p>`;
    try {
      const res = await fetch(GALLERY_API_URL + '?action=list');
      const json = await res.json();
      // 서버가 에러 객체를 돌려주면 "자료 없음"으로 감추지 말고 에러로 알린다.
      if (json && !Array.isArray(json) && json.error) {
        console.error('gallery list error:', json.error);
        if (galleryTabs) galleryTabs.hidden = true;
        if (gallerySortEl) gallerySortEl.hidden = true;
        galleryBody.innerHTML = `<p class="gallery-msg">${t('galleryLoadFailed')}</p>`;
        return;
      }
      galleryItems = Array.isArray(json) ? json : (json.items || []);
      renderGalleryList();
    } catch (err) {
      galleryBody.innerHTML = `<p class="gallery-msg">${t('galleryLoadFailed')}</p>`;
    }
  }

  function renderGalleryTabs() {
    if (!galleryTabs) return;
    const counts = { all: galleryItems.length, landscape: 0, square: 0, portrait: 0 };
    galleryItems.forEach(item => { counts[getPatternRatio(item)] = (counts[getPatternRatio(item)] || 0) + 1; });
    galleryTabs.innerHTML = '';
    [
      ['all', t('all')],
      ['landscape', t('landscape')],
      ['square', t('square')],
      ['portrait', t('portrait')]
    ].forEach(([key, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-tab';
      btn.classList.toggle('active', galleryRatioFilter === key);
      const labelSpan = document.createElement('span');
      labelSpan.className = 'gallery-tab-label';
      labelSpan.textContent = label;
      const countSpan = document.createElement('span');
      countSpan.className = 'gallery-tab-count';
      countSpan.textContent = counts[key] || 0;
      btn.appendChild(labelSpan);
      btn.appendChild(countSpan);
      btn.addEventListener('click', () => {
        galleryRatioFilter = key;
        renderGalleryList();
      });
      galleryTabs.appendChild(btn);
    });
    galleryTabs.hidden = false;
  }

  function getViews(item) {
    return Number(item && item.views) || 0;
  }

  function renderGallerySort() {
    if (!gallerySortEl) return;
    gallerySortEl.hidden = false;
    gallerySortEl.querySelectorAll('.gallery-sort-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sort === gallerySort);
    });
  }

  function renderGalleryList() {
    renderGalleryTabs();
    let list = galleryRatioFilter === 'all'
      ? galleryItems.slice()
      : galleryItems.filter(item => getPatternRatio(item) === galleryRatioFilter);
    if (gallerySort === 'popular') {
      // 안정 정렬: 조회수 높은 순, 같으면 기존(최신) 순서 유지
      list = list
        .map((item, i) => ({ item, i }))
        .sort((a, b) => (getViews(b.item) - getViews(a.item)) || (a.i - b.i))
        .map(x => x.item);
    }
    if (!galleryItems.length) {
      if (gallerySortEl) gallerySortEl.hidden = true;
      galleryBody.innerHTML = `<p class="gallery-msg">${t('noPatterns')}</p>`;
      return;
    }
    renderGallerySort();
    if (!list.length) {
      galleryBody.innerHTML = `<p class="gallery-msg">${t('noRatioPatterns', { ratio: ratioLabel(galleryRatioFilter) })}</p>`;
      return;
    }
    galleryBody.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'gallery-grid';
    list.forEach(item => {
      const ratio = getPatternRatio(item);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'gallery-item';
      card.addEventListener('click', () => {
        try {
          loadPatternData(item);
          recordGalleryView(item);
          closeGallery();
          toast(t('patternLoaded'));
        }
        catch (_) { toast(t('patternLoadFailed')); }
      });
      const img = document.createElement('img');
      img.className = 'gallery-thumb';
      img.alt = t('patternPreview', { title: item.title || t('patternFile') });
      try { img.src = renderPatternThumb(item, 160); } catch (_) {}
      const title = document.createElement('div');
      title.className = 'gallery-title';
      title.textContent = item.title || t('patternFile');
      const meta = document.createElement('div');
      meta.className = 'gallery-meta';
      meta.textContent = `${ratioLabel(ratio)} · ${item.cols || '?'}×${item.rows || '?'}${item.author ? ' · ' + item.author : ''}`;
      const views = document.createElement('div');
      views.className = 'gallery-views';
      views.innerHTML = `<span class="material-icons">visibility</span><span class="gallery-views-num">${getViews(item)}</span>`;
      const action = document.createElement('span');
      action.className = 'btn btn-primary btn-small gallery-action';
      action.innerHTML = `<span class="material-icons">brush</span> ${t('colorIt')}`;
      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(views);
      card.appendChild(action);
      grid.appendChild(card);
    });
    galleryBody.appendChild(grid);
  }

  // 도안(번호+범례) → 정답 색상 썸네일 이미지
  function renderPatternThumb(pattern, maxSize = 160) {
    const cols = pattern.cols, rows = pattern.rows;
    const numToColor = {};
    (pattern.legend || []).forEach(l => { numToColor[l.num] = l.color; });
    const scale = Math.max(1, Math.floor(maxSize / Math.max(cols, rows)));
    const c = document.createElement('canvas');
    c.width = cols * scale;
    c.height = rows * scale;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    const cells = pattern.cells || [];
    for (let i = 0; i < cells.length; i++) {
      const n = cells[i];
      if (!n) continue;
      const color = numToColor[n];
      if (!color) continue;
      const col = i % cols;
      const row = Math.floor(i / cols);
      ctx.fillStyle = color;
      ctx.fillRect(col * scale, row * scale, scale, scale);
    }
    return c.toDataURL('image/png');
  }

  function submitToGallery() {
    if (!GALLERY_API_URL) { toast(t('galleryNoServerToast')); return; }
    if (!state.patternCells || !state.patternLegend) return;
    galleryUploadForm.reset();
    galleryUploadTitle.value = '';
    galleryUploadAuthor.value = '';
    galleryUploadAgree.checked = false;
    galleryUploadModal.classList.add('open');
    setTimeout(() => galleryUploadTitle.focus(), 0);
  }

  function closeGalleryUpload() {
    galleryUploadModal.classList.remove('open');
  }

  async function handleGalleryUploadSubmit(e) {
    e.preventDefault();
    if (!galleryUploadAgree.checked) {
      toast(t('agreeRequired'));
      return;
    }
    const title = galleryUploadTitle.value.trim();
    const author = galleryUploadAuthor.value.trim();
    if (!title || !author) {
      toast(t('titleAuthorRequired'));
      return;
    }
    const ok = await showConfirm(
      t('galleryConfirmTitle'),
      t('galleryConfirmMsg')
    );
    if (!ok) return;
    toast(t('uploading'));
    const payload = {
      title,
      author,
      ratio: state.ratio,
      sizeKey: state.sizeKey,
      cols: state.cols,
      rows: state.rows,
      legend: state.patternLegend,
      cells: state.patternCells
    };
    try {
      // text/plain 으로 보내 CORS preflight 를 피한다 (Apps Script 호환)
      const res = await fetch(GALLERY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      let json = null;
      try { json = await res.json(); } catch (_) {}
      if (!res.ok || (json && json.ok === false)) throw new Error(json && json.error ? json.error : 'upload failed');
      closeGalleryUpload();
      toast(t('uploaded'));
    } catch (err) {
      toast(t('uploadFailed'));
    }
  }

  document.getElementById('gallery-upload-close').addEventListener('click', closeGalleryUpload);
  document.getElementById('gallery-upload-cancel').addEventListener('click', closeGalleryUpload);
  galleryUploadModal.addEventListener('click', (e) => { if (e.target === galleryUploadModal) closeGalleryUpload(); });
  galleryUploadForm.addEventListener('submit', handleGalleryUploadSubmit);

  function goFirstScreen() {
    if (state.currentScreen === 'editor') {
      handleHome();
      return;
    }
    showScreen('ratio');
  }

  document.getElementById('btn-home').addEventListener('click', handleHome);
  document.getElementById('btn-back-step').addEventListener('click', handleBackStep);
  document.querySelectorAll('[data-go-home]').forEach(el => {
    el.addEventListener('click', goFirstScreen);
  });

  function openHelp() { helpModal.classList.add('open'); }
  function closeHelp() { helpModal.classList.remove('open'); }
  document.querySelectorAll('[data-language-toggle]').forEach(btnLanguage => {
    btnLanguage.addEventListener('click', () => setLanguage(btnLanguage.dataset.langNext || (currentLang === 'ko' ? 'en' : 'ko')));
  });
  document.getElementById('btn-help-floating').addEventListener('click', openHelp);
  document.getElementById('btn-help-top').addEventListener('click', openHelp);
  document.getElementById('help-close').addEventListener('click', closeHelp);
  helpModal.addEventListener('click', (e) => { if (e.target === helpModal) closeHelp(); });

  // ===== 관리자 모드 =====
  function openAdmin() {
    if (!GALLERY_API_URL) { toast(t('galleryNoServerToast')); return; }
    adminModal.classList.add('open');
    if (adminPassword) {
      showAdminDashboard();
      loadAdminList();
    } else {
      adminLoginForm.hidden = false;
      adminDashboard.hidden = true;
      adminPasswordInput.value = '';
      setTimeout(() => adminPasswordInput.focus(), 0);
    }
  }

  function closeAdmin() {
    adminModal.classList.remove('open');
  }

  function showAdminDashboard() {
    adminLoginForm.hidden = true;
    adminDashboard.hidden = false;
  }

  async function adminApi(action, payload = {}) {
    const res = await fetch(GALLERY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, password: adminPassword, ...payload })
    });
    const json = await res.json();
    if (!res.ok || !json || json.ok === false) {
      throw new Error(json && json.error ? json.error : 'admin api failed');
    }
    return json;
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    adminPassword = adminPasswordInput.value.trim();
    if (!adminPassword) return;
    showAdminDashboard();
    await loadAdminList();
  }

  async function loadAdminList() {
    adminSummary.textContent = t('loadingPatterns');
    adminList.innerHTML = '';
    try {
      const json = await adminApi('admin-list');
      renderAdminList(Array.isArray(json.items) ? json.items : []);
    } catch (err) {
      adminPassword = '';
      adminLoginForm.hidden = false;
      adminDashboard.hidden = true;
      toast(t('adminPasswordCheck'));
      setTimeout(() => adminPasswordInput.focus(), 0);
    }
  }

  function renderAdminList(items) {
    adminSummary.textContent = t('adminTotal', { count: items.length });
    adminList.innerHTML = '';
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'gallery-msg';
      empty.textContent = t('adminEmpty');
      adminList.appendChild(empty);
      return;
    }
    items.forEach(item => {
      const row = document.createElement('form');
      row.className = 'admin-item';
      row.dataset.id = item.id || '';

      const img = document.createElement('img');
      img.className = 'admin-thumb';
      img.alt = t('patternPreview', { title: item.title || t('patternFile') });
      try { img.src = renderPatternThumb(item, 96); } catch (_) {}

      const fields = document.createElement('div');
      fields.className = 'admin-fields';
      fields.innerHTML =
        `<label class="field-label">${t('title')}</label>` +
        '<input class="text-field admin-title-input" maxlength="60" required />' +
        `<label class="field-label">${t('author')}</label>` +
        '<input class="text-field admin-author-input" maxlength="40" required />' +
        '<p class="admin-meta"></p>';
      fields.querySelector('.admin-title-input').value = item.title || '';
      fields.querySelector('.admin-author-input').value = item.author || '';
      fields.querySelector('.admin-meta').textContent = `${ratioLabel(getPatternRatio(item))} · ${item.cols || '?'}×${item.rows || '?'} · ${t('views')} ${getViews(item)} · ${item.createdAt || t('noDate')}`;

      const actions = document.createElement('div');
      actions.className = 'admin-actions';
      const saveBtn = document.createElement('button');
      saveBtn.type = 'submit';
      saveBtn.className = 'btn btn-primary btn-small';
      saveBtn.innerHTML = `<span class="material-icons">save</span> ${t('edit')}`;
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-ghost btn-small admin-delete';
      deleteBtn.innerHTML = `<span class="material-icons">delete</span> ${t('delete')}`;
      actions.appendChild(saveBtn);
      actions.appendChild(deleteBtn);

      row.appendChild(img);
      row.appendChild(fields);
      row.appendChild(actions);
      adminList.appendChild(row);
    });
  }

  async function handleAdminListSubmit(e) {
    const row = e.target.closest('.admin-item');
    if (!row) return;
    e.preventDefault();
    const id = row.dataset.id;
    const title = row.querySelector('.admin-title-input').value.trim();
    const author = row.querySelector('.admin-author-input').value.trim();
    if (!id || !title || !author) { toast(t('titleAuthorCheck')); return; }
    try {
      await adminApi('admin-update', { id, title, author });
      toast(t('updated'));
      loadAdminList();
      if (galleryModal.classList.contains('open')) loadGalleryList();
    } catch (err) {
      toast(t('updateFailed'));
    }
  }

  async function handleAdminListClick(e) {
    const btn = e.target.closest('.admin-delete');
    if (!btn) return;
    const row = btn.closest('.admin-item');
    const id = row && row.dataset.id;
    if (!id) return;
    const title = row.querySelector('.admin-title-input').value.trim() || t('thisPattern');
    const ok = await showConfirm(t('deleteTitle'), t('deleteMsg', { title }));
    if (!ok) return;
    try {
      await adminApi('admin-delete', { id });
      toast(t('deleted'));
      loadAdminList();
      if (galleryModal.classList.contains('open')) loadGalleryList();
    } catch (err) {
      toast(t('deleteFailed'));
    }
  }

  document.getElementById('btn-admin').addEventListener('click', openAdmin);
  document.getElementById('admin-close').addEventListener('click', closeAdmin);
  document.getElementById('admin-refresh').addEventListener('click', loadAdminList);
  adminModal.addEventListener('click', (e) => { if (e.target === adminModal) closeAdmin(); });
  adminLoginForm.addEventListener('submit', handleAdminLogin);
  adminList.addEventListener('submit', handleAdminListSubmit);
  adminList.addEventListener('click', handleAdminListClick);

  // ===== 팔레트 =====
  function buildPalette() {
    if (!mPalette) return;
    mPalette.innerHTML = '';
    PALETTE.forEach(color => {
      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'color-swatch';
      s.style.background = color;
      s.dataset.color = color;
      if (color === state.currentColor) s.classList.add('active');
      s.addEventListener('click', () => {
        selectColor(color);
        closeAllPopovers();
      });
      mPalette.appendChild(s);
    });
  }
  function selectColor(color) {
    state.currentColor = color;
    updateActivePaletteSwatch();
    updateCurrentColorChip();
    if (/^#([0-9a-f]{6})$/i.test(color)) inputCustomColor.value = color;
    saveLocal();
  }
  function updateActivePaletteSwatch() {
    document.querySelectorAll('.color-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color.toLowerCase() === state.currentColor.toLowerCase());
    });
  }
  function updateCurrentColorChip() {
    if (mColorIndicator) mColorIndicator.style.background = state.currentColor;
  }

  inputCustomColor.addEventListener('input', (e) => selectColor(e.target.value));
  inputCustomColor.addEventListener('change', (e) => selectColor(e.target.value));

  // ===== 그리드 빌드 =====
  function buildGrid() {
    pixelGrid.innerHTML = '';
    pixelGrid.style.gridTemplateColumns = `repeat(${state.cols}, 1fr)`;
    pixelGrid.style.gridTemplateRows = `repeat(${state.rows}, 1fr)`;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < state.cols * state.rows; i++) {
      const cell = document.createElement('div');
      cell.className = 'pixel-cell';
      cell.dataset.idx = i;
      if (state.pixels[i]) cell.style.background = state.pixels[i];
      frag.appendChild(cell);
    }
    pixelGrid.appendChild(frag);
    resizeCanvas();
  }

  // 가용 공간에 캔버스 맞추기
  function resizeCanvas() {
    if (!screens.editor.classList.contains('active')) return;
    const rect = canvasArea.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const cssPad = 20;     // canvas-area padding 양쪽
    const border = 4;      // wrapper border 양쪽
    const availW = Math.max(80, rect.width - cssPad - border);
    const availH = Math.max(80, rect.height - cssPad - border);
    const aspect = state.cols / state.rows;
    let w, h;
    if (availW / availH >= aspect) {
      h = availH;
      w = h * aspect;
    } else {
      w = availW;
      h = w / aspect;
    }
    pixelGrid.style.width = `${Math.floor(w)}px`;
    pixelGrid.style.height = `${Math.floor(h)}px`;
    pixelGrid.style.setProperty('--cell-px', `${w / state.cols}px`);
  }

  // ResizeObserver로 캔버스 영역 변경 감지
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(canvasArea);
  }
  window.addEventListener('resize', () => resizeCanvas());

  // Footer 실제 높이 측정 (safe-area 인셋 포함) — CSS 변수 갱신
  const footerEl = document.querySelector('.app-footer');
  function syncFooterHeight() {
    if (!footerEl) return;
    const h = Math.ceil(footerEl.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--footer-h', `${h}px`);
    resizeCanvas();
  }
  if (footerEl && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncFooterHeight).observe(footerEl);
  }
  window.addEventListener('resize', syncFooterHeight);
  window.addEventListener('orientationchange', syncFooterHeight);
  syncFooterHeight();

  function refreshGrid() {
    const cells = pixelGrid.children;
    for (let i = 0; i < state.pixels.length && i < cells.length; i++) {
      if (cells[i].classList && cells[i].classList.contains('pixel-cell')) {
        cells[i].style.background = state.pixels[i] || 'transparent';
        if (state.patternMode) updateCellNum(cells[i], i);
      }
    }
  }

  // ===== 토글 드로잉 =====
  function applyAt(idx, mode) {
    if (idx < 0 || idx >= state.cols * state.rows) return;
    const col = idx % state.cols;
    const row = Math.floor(idx / state.cols);
    const size = state.brushSize;
    const value = mode === 'erase' ? null : state.currentColor;

    const cells = pixelGrid.children;
    for (let dr = 0; dr < size; dr++) {
      for (let dc = 0; dc < size; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r >= state.rows || c >= state.cols) continue;
        const i = r * state.cols + c;
        if (state.pixels[i] === value) continue;
        state.pixels[i] = value;
        if (cells[i]) {
          cells[i].style.background = value || 'transparent';
          if (state.patternMode === 'color') updateCellNum(cells[i], i);
        }
      }
    }
  }

  // 색칠 모드: 칸이 비어 있을 때만 번호 안내를 보여 준다 (칠하면 번호가 사라짐)
  function updateCellNum(cell, i) {
    const n = state.patternCells ? state.patternCells[i] : 0;
    if (n > 0 && (state.patternMode === 'chart' || !state.pixels[i])) {
      cell.dataset.num = n;
    } else {
      delete cell.dataset.num;
    }
  }

  function cellIndexFromEvent(e) {
    const target = e.target.closest && e.target.closest('.pixel-cell');
    if (target && target.parentElement === pixelGrid) {
      return parseInt(target.dataset.idx, 10);
    }
    const rect = pixelGrid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return -1;
    const c = Math.floor(x / (rect.width / state.cols));
    const r = Math.floor(y / (rect.height / state.rows));
    return r * state.cols + c;
  }

  pixelGrid.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    closeAllPopovers();
    if (state.eyedropper) {
      const pickIdx = cellIndexFromEvent(e);
      if (pickIdx >= 0) pickColorAt(pickIdx);
      return;
    }
    if (state.patternMode === 'chart') return; // 도안 보기 모드는 읽기 전용
    isPointerDown = true;
    try { pixelGrid.setPointerCapture(e.pointerId); } catch (_) {}
    const idx = cellIndexFromEvent(e);
    if (idx < 0) return;
    strokeStartSnapshot = state.pixels.slice();
    const current = state.pixels[idx];
    strokeMode = (current && current.toLowerCase() === state.currentColor.toLowerCase()) ? 'erase' : 'paint';
    applyAt(idx, strokeMode);
  });
  pixelGrid.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const idx = cellIndexFromEvent(e);
    if (idx >= 0) applyAt(idx, strokeMode);
  });
  function endStroke() {
    if (!isPointerDown) return;
    isPointerDown = false;
    if (strokeStartSnapshot && pixelsDiffer(strokeStartSnapshot, state.pixels)) {
      pushUndo(strokeStartSnapshot);
    }
    strokeStartSnapshot = null;
    strokeMode = null;
    saveLocal();
  }
  pixelGrid.addEventListener('pointerup', endStroke);
  pixelGrid.addEventListener('pointercancel', endStroke);

  function pixelsDiffer(a, b) {
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return true;
    return false;
  }

  // ===== 붓 크기 =====
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.brushSize = parseInt(btn.dataset.brush, 10);
      syncSizeButtons();
      saveLocal();
      closeAllPopovers();
    });
  });

  // ===== Undo / Redo =====
  function pushUndo(snapshot) {
    undoStack.push(snapshot);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];
    updateHistoryButtons();
  }
  function updateHistoryButtons() {
    btnUndo.disabled = undoStack.length === 0;
    btnRedo.disabled = redoStack.length === 0;
  }
  function undo() {
    if (!undoStack.length) return;
    redoStack.push(state.pixels.slice());
    state.pixels = undoStack.pop();
    refreshGrid();
    updateHistoryButtons();
    saveLocal();
  }
  function redo() {
    if (!redoStack.length) return;
    undoStack.push(state.pixels.slice());
    state.pixels = redoStack.pop();
    refreshGrid();
    updateHistoryButtons();
    saveLocal();
  }
  btnUndo.addEventListener('click', undo);
  btnRedo.addEventListener('click', redo);

  document.addEventListener('keydown', (e) => {
    if (!screens.editor.classList.contains('active')) return;
    const meta = e.ctrlKey || e.metaKey;
    if (meta && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if (meta && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
  });

  // ===== 중앙 가이드라인 토글 =====
  function updateGuidesUI() {
    canvasWrapper.classList.toggle('guides-hidden', !state.guidesVisible);
    if (moreGuidesLabel) {
      moreGuidesLabel.textContent = state.guidesVisible ? t('hideGuides') : t('showGuides');
    }
  }

  // ===== 참고 이미지 =====
  document.getElementById('btn-close-reference').addEventListener('click', () => {
    editorMain.classList.remove('reference-open');
    requestAnimationFrame(() => resizeCanvas());
  });

  // 세로모드 플로팅 패널 드래그
  const referenceHeader = referencePanel ? referencePanel.querySelector('.reference-header') : null;
  let refDragState = null;
  if (referenceHeader) {
    referenceHeader.addEventListener('pointerdown', (e) => {
      if (!isPortrait()) return;
      if (e.target.closest('button')) return; // 닫기 버튼은 드래그 제외
      e.preventDefault();
      const rect = referencePanel.getBoundingClientRect();
      refDragState = {
        startX: e.clientX,
        startY: e.clientY,
        originLeft: rect.left,
        originTop: rect.top,
        pointerId: e.pointerId
      };
      referenceHeader.classList.add('dragging');
      try { referenceHeader.setPointerCapture(e.pointerId); } catch (_) {}
    });
    referenceHeader.addEventListener('pointermove', (e) => {
      if (!refDragState) return;
      const dx = e.clientX - refDragState.startX;
      const dy = e.clientY - refDragState.startY;
      const panelRect = referencePanel.getBoundingClientRect();
      const margin = 4;
      const minLeft = margin;
      const maxLeft = window.innerWidth - panelRect.width - margin;
      const minTop = margin;
      const maxTop = window.innerHeight - panelRect.height - margin;
      const newLeft = Math.max(minLeft, Math.min(maxLeft, refDragState.originLeft + dx));
      const newTop = Math.max(minTop, Math.min(maxTop, refDragState.originTop + dy));
      referencePanel.style.left = newLeft + 'px';
      referencePanel.style.top = newTop + 'px';
      referencePanel.style.right = 'auto';
      referenceFloatPos = { left: newLeft, top: newTop };
    });
    function endDrag() {
      if (!refDragState) return;
      refDragState = null;
      referenceHeader.classList.remove('dragging');
    }
    referenceHeader.addEventListener('pointerup', endDrag);
    referenceHeader.addEventListener('pointercancel', endDrag);
  }

  // 회전 시 플로팅 위치 초기화 (방향 바뀌면 새 위치 기본값으로)
  window.addEventListener('orientationchange', () => {
    referenceFloatPos = null;
    if (referencePanel) {
      referencePanel.style.left = '';
      referencePanel.style.top = '';
      referencePanel.style.right = '';
    }
  });

  inputReference.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      referencePreview.innerHTML = '';
      const img = document.createElement('img');
      img.src = ev.target.result;
      img.alt = t('referenceImage');
      referencePreview.appendChild(img);
      btnRemoveReference.style.display = 'inline-flex';
    };
    reader.readAsDataURL(file);
  });
  btnRemoveReference.addEventListener('click', () => {
    referencePreview.innerHTML = `<p class="reference-hint">${t('referenceHint')}</p>`;
    inputReference.value = '';
    btnRemoveReference.style.display = 'none';
  });

  // ===== 트리거 / 팝오버 =====
  function closeAllPopovers() {
    [mPopBrush, mPopColor].forEach(p => p && p.classList.remove('open'));
    [mTriggerBrush, mTriggerColor].forEach(t => t && t.classList.remove('open'));
    if (dropdownMore) dropdownMore.classList.remove('open');
  }
  function togglePopover(triggerEl, popoverEl) {
    const willOpen = !popoverEl.classList.contains('open');
    closeAllPopovers();
    if (willOpen) {
      popoverEl.classList.add('open');
      triggerEl.classList.add('open');
    }
  }
  mTriggerBrush.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePopover(mTriggerBrush, mPopBrush);
  });
  mTriggerColor.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePopover(mTriggerColor, mPopColor);
  });
  mTriggerCustom.addEventListener('click', () => {
    closeAllPopovers();
    setEyedropper(false);
    inputCustomColor.click();
  });

  // ===== 스포이트(색 추출) =====
  const hasNativeEyedropper = typeof EyeDropper !== 'undefined';

  function setEyedropper(on) {
    state.eyedropper = !!on;
    if (mTriggerEyedropper) mTriggerEyedropper.classList.toggle('active', state.eyedropper);
    // 네이티브 EyeDropper 사용 시 커서 변경은 브라우저가 처리하므로 클래스 불필요
    if (!hasNativeEyedropper && canvasWrapper) {
      canvasWrapper.classList.toggle('eyedropper-active', state.eyedropper);
    }
  }

  if (mTriggerEyedropper) {
    mTriggerEyedropper.addEventListener('click', async (e) => {
      e.stopPropagation();
      closeAllPopovers();

      if (hasNativeEyedropper) {
        // 네이티브 EyeDropper: 버튼 상태를 active로 표시한 뒤 곧바로 실행
        setEyedropper(true);
        try {
          const result = await new EyeDropper().open();
          selectColor(result.sRGBHex);
          toast(t('colorPicked', { color: result.sRGBHex.toUpperCase() }));
        } catch (_) {
          // 사용자가 Esc로 취소하거나 실패 시 조용히 종료
        } finally {
          setEyedropper(false);
        }
        return;
      }

      // 폴백: 캔버스 내 셀 클릭 방식
      const willOn = !state.eyedropper;
      setEyedropper(willOn);
      toast(willOn ? t('eyedropperOn') : t('eyedropperOff'));
    });
  }

  // 캔버스 내 폴백 추출 (네이티브 미지원 브라우저용)
  function pickColorAt(idx) {
    const color = state.pixels[idx];
    if (!color) {
      toast(t('emptyCell'));
      return;
    }
    selectColor(color);
    setEyedropper(false);
    toast(t('colorPicked', { color: color.toUpperCase() }));
  }

  // ===== 더보기 메뉴 =====
  const MORE_ACTIONS = {
    'toggle-reference': handleReferenceToggle,
    'toggle-guides': handleGuidesToggle,
    'save-json': handleSaveJson,
    'load-json': handleLoadJson,
    'export-jpg': handleExportJpg,
    'copy-jpg': handleCopyJpg,
    'share-link': handleShareLink,
    'make-pattern': handleMakePattern,
    'load-pattern': handleLoadPattern,
    'gallery': handleGallery,
    'clear': handleClear,
    'back-step': handleBackStep
  };

  btnMore.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !dropdownMore.classList.contains('open');
    closeAllPopovers();
    if (willOpen) dropdownMore.classList.add('open');
  });

  dropdownMore.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    dropdownMore.classList.remove('open');
    const fn = MORE_ACTIONS[action];
    if (fn) fn();
  });

  // 바깥 클릭 시 모든 팝오버 닫기
  document.addEventListener('click', (e) => {
    const insideBrush = mPopBrush.contains(e.target) || mTriggerBrush.contains(e.target);
    const insideColor = mPopColor.contains(e.target) || mTriggerColor.contains(e.target);
    const insideMore = dropdownMore.contains(e.target) || btnMore.contains(e.target);
    if (!insideBrush && !insideColor && !insideMore) closeAllPopovers();
  });

  // 파일 입력
  inputLoadJson.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => {
      toast(t('fileReadFailed'));
      inputLoadJson.value = '';
    };
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        loadProjectFile(data);
        toast(state.patternMode === 'color'
          ? t('patternLoaded')
          : t('loaded'));
      } catch (err) {
        toast(t('fileReadFailed'));
      }
      inputLoadJson.value = '';
    };
    reader.readAsText(file);
  });

  // 도안 파일 불러오기
  inputLoadPattern.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => {
      toast(t('patternFileReadFailed'));
      inputLoadPattern.value = '';
    };
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        loadProjectFile(data);
        toast(state.patternMode === 'color'
          ? t('patternLoaded')
          : t('loaded'));
      } catch (err) {
        toast(t('patternFileReadFailed'));
      }
      inputLoadPattern.value = '';
    };
    reader.readAsText(file);
  });

  // ===== Export 렌더링 =====
  function renderToCanvas(scale = 24) {
    const c = document.createElement('canvas');
    c.width = state.cols * scale;
    c.height = state.rows * scale;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < state.pixels.length; i++) {
      const color = state.pixels[i];
      if (!color) continue;
      const col = i % state.cols;
      const row = Math.floor(i / state.cols);
      ctx.fillStyle = color;
      ctx.fillRect(col * scale, row * scale, scale, scale);
    }
    return c;
  }

  function compressPixels(pixels) {
    const colorMap = new Map();
    const colors = [];
    for (const p of pixels) {
      if (p && !colorMap.has(p)) {
        colorMap.set(p, colors.length);
        colors.push(p);
      }
    }
    const runs = [];
    let i = 0;
    while (i < pixels.length) {
      const v = pixels[i];
      let j = i + 1;
      while (j < pixels.length && pixels[j] === v) j++;
      runs.push([v === null ? -1 : colorMap.get(v), j - i]);
      i = j;
    }
    return { palette: colors, runs };
  }
  function decompressPixels(comp, total) {
    const out = new Array(total).fill(null);
    let i = 0;
    for (const [idx, len] of comp.runs) {
      const color = idx === -1 ? null : comp.palette[idx];
      for (let k = 0; k < len && i < total; k++, i++) out[i] = color;
    }
    return out;
  }
  function base64UrlEncode(str) {
    const bin = unescape(encodeURIComponent(str));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function base64UrlDecode(str) {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return decodeURIComponent(escape(atob(s)));
  }

  // ===== LocalStorage =====
  function saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ratio: state.ratio,
        sizeKey: state.sizeKey,
        cols: state.cols,
        rows: state.rows,
        pixels: state.pixels,
        currentColor: state.currentColor,
        brushSize: state.brushSize,
        guidesVisible: state.guidesVisible,
        currentScreen: state.currentScreen,
        patternMode: state.patternMode,
        patternCells: state.patternCells,
        patternLegend: state.patternLegend
      }));
    } catch (_) {}
  }
  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.pixels)) return null;
      return data;
    } catch (_) { return null; }
  }

  // ===== 부트스트랩 =====
  function bootstrap() {
    if (location.hash.startsWith('#art=')) {
      try {
        const encoded = location.hash.slice(5);
        const json = base64UrlDecode(encoded);
        const payload = JSON.parse(json);
        state.ratio = payload.r || 'square';
        state.sizeKey = payload.s || 'medium';
        state.cols = payload.c;
        state.rows = payload.h;
        state.pixels = decompressPixels(payload.p, state.cols * state.rows);
        undoStack = [];
        redoStack = [];
        enterEditor();
        history.replaceState(null, '', location.pathname);
        return;
      } catch (err) {
        toast(t('shareReadFailed'));
      }
    }

    const saved = loadLocal();
    if (saved) {
      Object.assign(state, saved);
      if (typeof state.guidesVisible !== 'boolean') state.guidesVisible = true;
      if (state.patternMode !== 'chart' && state.patternMode !== 'color') {
        state.patternMode = null;
        state.patternCells = null;
        state.patternLegend = null;
      }
    }

    const screen = saved && saved.currentScreen;
    const hasValidCanvas = saved && saved.cols && saved.rows
      && Array.isArray(saved.pixels) && saved.pixels.length === saved.cols * saved.rows;

    if (screen === 'editor' && hasValidCanvas) {
      enterEditor();
      return;
    }
    if (screen === 'size') {
      updateSizeLabels();
      showScreen('size');
      return;
    }

    updateSizeLabels();
    showScreen('ratio');
  }

  setLanguage(currentLang);
  bootstrap();
})();
