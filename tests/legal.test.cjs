const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
for (const name of ['privacy.html', 'terms.html']) {
  test(`${name} contains usable bilingual content without unresolved publication placeholders`, () => {
    const html = read(name);
    assert.doesNotMatch(html, /검토용\s*초안|REVIEW DRAFT|Operator confirmation required|운영자 확인 필요|제안 초안/i);
    assert.match(html, /lang="ko" id="ko"/);
    assert.match(html, /lang="en" id="en"/);
    assert.match(html, /https:\/\/litt\.ly\/chichiboo/);
    assert.match(html, /2026-10-16/);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, 'section IDs must be unique');
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (href.startsWith('https://')) continue;
      const [target, fragment] = href.split('#');
      const linked = target ? read(target.split('?')[0]) : html;
      if (fragment) assert.ok(linked.includes(`id="${fragment}"`), `missing target ${href}`);
    }
  });
}
test('footer links do not retain the retired draft badge', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /검토용 초안|footer-draft/);
  assert.match(html, /href="privacy.html#ko"/);
  assert.match(html, /href="terms.html#ko"/);
});
