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
    landscape: { small: [16, 9],  medium: [24, 14], large: [32, 18] },
    square:    { small: [16, 16], medium: [24, 24], large: [32, 32] },
    portrait:  { small: [9, 16],  medium: [14, 24], large: [18, 32] }
  };

  const STORAGE_KEY = 'pixelworld:v1';
  const MAX_HISTORY = 50;

  // ===== 상태 =====
  let state = {
    ratio: 'square',
    sizeKey: 'medium',
    cols: 24,
    rows: 24,
    pixels: [],
    currentColor: '#4c8dff',
    brushSize: 1,
    guidesVisible: true
  };

  let undoStack = [];
  let redoStack = [];
  let strokeStartSnapshot = null;
  let strokeMode = null;
  let isPointerDown = false;
  let modalResolver = null;

  // ===== DOM =====
  const screens = {
    ratio: document.getElementById('screen-ratio'),
    size: document.getElementById('screen-size'),
    editor: document.getElementById('screen-editor')
  };
  const palette = document.getElementById('palette');
  const pixelGrid = document.getElementById('pixel-grid');
  const canvasArea = document.querySelector('.canvas-area');
  const canvasWrapper = document.getElementById('canvas-wrapper');
  const currentColorChip = document.getElementById('current-color-chip');
  const inputCustomColor = document.getElementById('input-custom-color');
  const btnCustomColor = document.getElementById('btn-custom-color');
  const editorMain = document.querySelector('.editor-main');
  const referencePreview = document.getElementById('reference-preview');
  const inputReference = document.getElementById('input-reference');
  const btnRemoveReference = document.getElementById('btn-remove-reference');
  const dropdownDisk = document.getElementById('dropdown-disk');
  const btnDisk = document.getElementById('btn-disk');
  const inputLoadJson = document.getElementById('input-load-json');
  const toastEl = document.getElementById('toast');
  const modalEl = document.getElementById('modal-confirm');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');
  const btnGuides = document.getElementById('btn-guides');

  // ===== 화면 전환 =====
  function showScreen(name) {
    Object.entries(screens).forEach(([k, el]) => {
      el.classList.toggle('active', k === name);
    });
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
  document.querySelectorAll('#screen-ratio .choice-card').forEach(card => {
    card.addEventListener('click', () => {
      state.ratio = card.dataset.ratio;
      updateSizeLabels();
      showScreen('size');
    });
  });
  document.getElementById('btn-back-to-ratio').addEventListener('click', () => showScreen('ratio'));

  function updateSizeLabels() {
    const presets = SIZE_PRESETS[state.ratio];
    document.getElementById('desc-small').textContent  = `${presets.small[0]} × ${presets.small[1]}`;
    document.getElementById('desc-medium').textContent = `${presets.medium[0]} × ${presets.medium[1]}`;
    document.getElementById('desc-large').textContent  = `${presets.large[0]} × ${presets.large[1]}`;
  }

  // ===== 2단계 =====
  document.querySelectorAll('#screen-size .choice-card').forEach(card => {
    card.addEventListener('click', () => {
      state.sizeKey = card.dataset.size;
      const [cols, rows] = SIZE_PRESETS[state.ratio][state.sizeKey];
      state.cols = cols;
      state.rows = rows;
      state.pixels = new Array(cols * rows).fill(null);
      undoStack = [];
      redoStack = [];
      enterEditor();
    });
  });

  // ===== 에디터 진입 =====
  function enterEditor() {
    buildPalette();
    buildGrid();
    updateCurrentColorChip();
    syncSizeButtons();
    updateHistoryButtons();
    updateGuidesUI();
    saveLocal();
    showScreen('editor');
  }
  function syncSizeButtons() {
    document.querySelectorAll('.size-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.brush, 10) === state.brushSize);
    });
  }

  // 홈 / 이전 단계
  document.getElementById('btn-home').addEventListener('click', async () => {
    const ok = await showConfirm('홈으로 가기', '홈 화면으로 돌아가요. 현재 그림은 자동으로 저장돼요.');
    if (!ok) return;
    saveLocal();
    showScreen('ratio');
  });
  document.getElementById('btn-back-step').addEventListener('click', async () => {
    const ok = await showConfirm('이전 단계로', '캔버스 크기 선택 화면으로 돌아가요. 다시 크기를 고르면 지금 그림이 사라질 수 있어요.');
    if (!ok) return;
    saveLocal();
    updateSizeLabels();
    showScreen('size');
  });

  // ===== 팔레트 =====
  function buildPalette() {
    palette.innerHTML = '';
    PALETTE.forEach(color => {
      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'color-swatch';
      s.style.background = color;
      s.dataset.color = color;
      if (color === state.currentColor) s.classList.add('active');
      s.addEventListener('click', () => selectColor(color));
      palette.appendChild(s);
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
    currentColorChip.style.background = state.currentColor;
  }

  btnCustomColor.addEventListener('click', () => inputCustomColor.click());
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

    const cssPad = 24;     // canvas-area padding 양쪽
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
  }

  // ResizeObserver로 캔버스 영역 변경 감지
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(canvasArea);
  }
  window.addEventListener('resize', () => resizeCanvas());

  function refreshGrid() {
    const cells = pixelGrid.children;
    for (let i = 0; i < state.pixels.length && i < cells.length; i++) {
      if (cells[i].classList && cells[i].classList.contains('pixel-cell')) {
        cells[i].style.background = state.pixels[i] || 'transparent';
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
        if (cells[i]) cells[i].style.background = value || 'transparent';
      }
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
    });
  });

  // ===== Undo / Redo / Clear =====
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

  document.getElementById('btn-clear').addEventListener('click', async () => {
    const hasContent = state.pixels.some(p => p !== null);
    if (!hasContent) { toast('이미 빈 캔버스예요!'); return; }
    const ok = await showConfirm('전체 지우기', '지금 그린 그림이 모두 사라져요. 정말 지울까요?');
    if (!ok) return;
    pushUndo(state.pixels.slice());
    state.pixels = new Array(state.cols * state.rows).fill(null);
    refreshGrid();
    saveLocal();
    toast('캔버스를 비웠어요!');
  });

  // ===== 중앙 가이드라인 토글 =====
  function updateGuidesUI() {
    canvasWrapper.classList.toggle('guides-hidden', !state.guidesVisible);
    btnGuides.classList.toggle('active', state.guidesVisible);
    btnGuides.title = state.guidesVisible ? '중앙 가이드라인 숨기기' : '중앙 가이드라인 보기';
  }
  btnGuides.addEventListener('click', () => {
    state.guidesVisible = !state.guidesVisible;
    updateGuidesUI();
    saveLocal();
  });

  // ===== 참고 이미지 =====
  document.getElementById('btn-reference').addEventListener('click', () => {
    editorMain.classList.toggle('reference-open');
    requestAnimationFrame(() => resizeCanvas());
  });
  document.getElementById('btn-close-reference').addEventListener('click', () => {
    editorMain.classList.remove('reference-open');
    requestAnimationFrame(() => resizeCanvas());
  });
  inputReference.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      referencePreview.innerHTML = '';
      const img = document.createElement('img');
      img.src = ev.target.result;
      img.alt = '참고 이미지';
      referencePreview.appendChild(img);
      btnRemoveReference.style.display = 'inline-flex';
    };
    reader.readAsDataURL(file);
  });
  btnRemoveReference.addEventListener('click', () => {
    referencePreview.innerHTML = '<p class="reference-hint">참고할 이미지를 올리면<br />여기에 보여요!</p>';
    inputReference.value = '';
    btnRemoveReference.style.display = 'none';
  });

  // ===== 디스켓 드롭다운 =====
  btnDisk.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownDisk.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!dropdownDisk.contains(e.target) && e.target !== btnDisk && !btnDisk.contains(e.target)) {
      dropdownDisk.classList.remove('open');
    }
  });

  // ===== 저장 / 불러오기 (JSON) =====
  document.getElementById('btn-save-json').addEventListener('click', () => {
    dropdownDisk.classList.remove('open');
    const data = {
      app: 'pixelworld',
      version: 1,
      ratio: state.ratio,
      sizeKey: state.sizeKey,
      cols: state.cols,
      rows: state.rows,
      pixels: state.pixels,
      savedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelworld-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('저장했어요!');
  });

  document.getElementById('btn-load-json').addEventListener('click', () => {
    dropdownDisk.classList.remove('open');
    inputLoadJson.click();
  });
  inputLoadJson.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data || !Array.isArray(data.pixels) || !data.cols || !data.rows) throw new Error('형식 오류');
        state.ratio = data.ratio || 'square';
        state.sizeKey = data.sizeKey || 'medium';
        state.cols = data.cols;
        state.rows = data.rows;
        state.pixels = data.pixels.slice(0, data.cols * data.rows);
        while (state.pixels.length < data.cols * data.rows) state.pixels.push(null);
        undoStack = [];
        redoStack = [];
        buildGrid();
        updateHistoryButtons();
        saveLocal();
        toast('불러왔어요!');
      } catch (err) {
        toast('파일을 읽을 수 없어요.');
      }
      inputLoadJson.value = '';
    };
    reader.readAsText(file);
  });

  // ===== Export =====
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

  document.getElementById('btn-export-jpg').addEventListener('click', () => {
    const c = renderToCanvas();
    c.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixelworld-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('JPG로 저장했어요!');
    }, 'image/jpeg', 0.92);
  });

  document.getElementById('btn-copy-jpg').addEventListener('click', () => {
    const c = renderToCanvas();
    c.toBlob(async (blob) => {
      try {
        if (!navigator.clipboard || !window.ClipboardItem) throw new Error('not supported');
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        toast('이미지가 클립보드에 복사됐어요!');
      } catch (err) {
        toast('이 브라우저에서는 복사를 지원하지 않아요.');
      }
    }, 'image/png');
  });

  document.getElementById('btn-share-link').addEventListener('click', async () => {
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
      toast('공유 링크를 복사했어요!');
    } catch (err) {
      prompt('이 링크를 복사해서 공유하세요:', url);
    }
  });

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
        guidesVisible: state.guidesVisible
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
        toast('공유 링크를 읽을 수 없어요.');
      }
    }

    const saved = loadLocal();
    if (saved && saved.cols && saved.rows && saved.pixels.length === saved.cols * saved.rows) {
      Object.assign(state, saved);
      if (typeof state.guidesVisible !== 'boolean') state.guidesVisible = true;
      enterEditor();
      return;
    }

    updateSizeLabels();
    showScreen('ratio');
  }

  bootstrap();
})();
