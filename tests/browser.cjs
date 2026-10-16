// Requires Playwright and Chromium. Remote requests never reach live services.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://local').pathname;
  const name = path.resolve(root, '.' + decodeURIComponent(pathname === '/' ? '/index.html' : pathname));
  if (!name.startsWith(root + path.sep)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.readFile(name, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end();
      return;
    }
    const types = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
    res.setHeader('Content-Type', types[path.extname(name)] || 'text/html');
    res.end(data);
  });
});
const cases = [];
const test = (name, fn) => cases.push([name, fn]);
const unsafe = {
  type: 'pattern', cols: 16, rows: 16, ratio: 'square', sizeKey: 'small',
  legend: [{ num: 1, color: '#fff"><img src="/probe-missing" onerror="window.__legalProbe=1">' }],
  cells: Array(256).fill(1)
};
let browser;
let base;
const errors = [];
async function page() {
  const p = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'ko-KR' });
  p.on('pageerror', error => errors.push(error.message));
  await p.route('https://**/*', route => route.abort());
  await p.goto(base);
  return p;
}
async function upload(p, data) {
  await p.locator('#input-load-pattern').setInputFiles({
    name: 'fixture.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data))
  });
  await p.waitForFunction(() => document.querySelector('#input-load-pattern').value === '');
}
async function newDrawing(p) {
  await p.locator('[data-ratio="square"]').click();
  await p.locator('[data-size="small"]').click();
}
async function switchLanguage(p) {
  // Use the keyboard because blocked external icon fonts can alter button geometry.
  await p.locator('[data-language-toggle]:visible').first().focus();
  await p.keyboard.press('Enter');
}

test('unsafe pattern file never becomes HTML', async () => {
  const p = await page();
  try {
    await upload(p, unsafe);
    assert.equal(await p.locator('.legend-chip img').count(), 0);
    assert.equal(await p.evaluate(() => window.__legalProbe), undefined);
  } finally { await p.close(); }
});
test('unsafe gallery item never becomes HTML and makes no view POST', async () => {
  const p = await page();
  try {
    let posts = 0;
    await p.route('https://script.google.com/**', route => {
      if (route.request().method() === 'POST') posts++;
      return route.fulfill({ json: [{ ...unsafe, id: 'local-only', title: 'Unsafe fixture', author: 'Test' }] });
    });
    await p.locator('#btn-gallery-home').click();
    await p.locator('.gallery-item').click();
    assert.equal(await p.locator('.legend-chip img').count(), 0);
    assert.equal(posts, 0);
  } finally { await p.close(); }
});
test('all 17 shipped patterns load as color-by-number', async () => {
  const p = await page();
  try {
    const items = JSON.parse(fs.readFileSync(path.join(root, 'examples/gallery_seed.json'), 'utf8'));
    for (const item of items) {
      await upload(p, item);
      assert.equal(await p.locator('.pixel-cell').count(), item.cols * item.rows);
      assert.equal(await p.locator('.legend-chip').count(), item.legend.length);
    }
  } finally { await p.close(); }
});
test('oversized shared-link canvas is rejected', async () => {
  const p = await page();
  try {
    const payload = { r: 'square', s: 'small', c: 129, h: 1, p: { palette: [], runs: [[-1, 129]] } };
    await p.goto(base + '#art=' + Buffer.from(JSON.stringify(payload)).toString('base64url'));
    await p.reload();
    assert.equal(await p.locator('.pixel-cell').count(), 0);
  } finally { await p.close(); }
});
test('paint, undo, redo, persistence and language work on desktop and mobile', async () => {
  for (const width of [1280, 390]) {
    const p = await page();
    try {
      await p.setViewportSize({ width, height: 844 });
      await newDrawing(p);
      const saved = () => p.evaluate(() => JSON.parse(localStorage.getItem('pixelworld:v1')));
      await p.locator('.pixel-cell').first().click();
      const color = (await saved()).pixels[0];
      assert.ok(color);
      await p.locator('#btn-undo').click();
      assert.equal((await saved()).pixels[0], null);
      await p.locator('#btn-redo').click();
      assert.equal((await saved()).pixels[0], color);
      await p.reload();
      assert.equal((await saved()).pixels[0], color);
      await switchLanguage(p);
      assert.equal(await p.locator('html').getAttribute('lang'), 'en');
      assert.equal(await p.locator('#screen-editor.active').count(), 1);
    } finally { await p.close(); }
  }
});
test('English publication guidance uses nicknames and rejects an invalid country', async () => {
  const p = await page();
  try {
    await newDrawing(p);
    await p.locator('.pixel-cell').first().click();
    await switchLanguage(p);
    await p.locator('#btn-more').click();
    await p.locator('[data-action="make-pattern"]').click();
    await p.locator('#pattern-fab button').last().click();
    assert.equal(await p.locator('#gallery-upload-author').getAttribute('placeholder'), 'Ex: Blue Star');
    assert.ok((await p.locator('#gallery-upload-form').innerText()).includes('Use a nickname.'));
    await p.locator('#gallery-upload-title').fill('Test');
    await p.locator('#gallery-upload-author').fill('Blue Star');
    await p.locator('#gallery-upload-country').fill('invalid country');
    await p.locator('#gallery-upload-agree').check();
    await p.locator('#gallery-upload-form button[type="submit"]').click();
    assert.equal(await p.locator('#modal-confirm.open').count(), 0);
  } finally { await p.close(); }
});
test('malicious drawing files and restored local storage are rejected', async () => {
  const p = await page();
  try {
    const drawing = {
      cols: 16, rows: 16, ratio: 'square', sizeKey: 'small', pixels: Array(256).fill('#4c8dff'),
      patternMode: 'chart', patternCells: unsafe.cells, patternLegend: unsafe.legend, currentScreen: 'editor'
    };
    await upload(p, drawing);
    assert.equal(await p.locator('.legend-chip img').count(), 0);
    await p.evaluate(data => localStorage.setItem('pixelworld:v1', JSON.stringify(data)), drawing);
    await p.reload();
    assert.equal(await p.locator('.pixel-cell').count(), 0);
    assert.equal(await p.locator('.legend-chip img').count(), 0);
  } finally { await p.close(); }
});
test('valid shared links restore pixels and malformed runs are rejected', async () => {
  const payload = { r: 'square', s: 'small', c: 16, h: 16, p: { palette: ['#4c8dff'], runs: [[0, 1], [-1, 255]] } };
  for (const valid of [true, false]) {
    const p = await page();
    try {
      const data = structuredClone(payload);
      if (!valid) data.p.runs = [[2, 256]];
      await p.goto(base + '#art=' + Buffer.from(JSON.stringify(data)).toString('base64url'));
      await p.reload();
      assert.equal(await p.locator('.pixel-cell').count(), valid ? 256 : 0);
      if (valid) {
        assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('pixelworld:v1')).pixels[0]), '#4c8dff');
      }
    } finally { await p.close(); }
  }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}/`;
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox']
  });
  let failed = 0;
  try {
    for (const [name, fn] of cases) {
      try { await fn(); console.log('PASS', name); }
      catch (error) { failed++; console.error('FAIL', name, error.message); }
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log(`${cases.length - failed}/${cases.length} browser cases passed; page errors: ${errors.length}`);
  if (failed) process.exitCode = 1;
})().catch(error => {
  console.error(error);
  server.close();
  if (browser) browser.close();
  process.exitCode = 1;
});
