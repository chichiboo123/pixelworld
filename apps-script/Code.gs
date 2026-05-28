/**
 * PIXEL WORLD · 도안 갤러리 백엔드 (Google Apps Script)
 * ------------------------------------------------------
 * 구글 스프레드시트를 간단한 도안 저장소로 사용합니다.
 *  - GET  ?action=list   → 저장된 도안 목록(JSON 배열) 반환
 *  - POST (JSON body)     → 새 도안 한 개 저장
 *
 * 배포 방법은 같은 폴더의 README.md 를 참고하세요.
 */

// 도안을 저장할 시트 이름
var SHEET_NAME = 'patterns';
// 한 번에 내려줄 최대 도안 수 (최신순)
var MAX_LIST = 100;

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'list';
  if (action === 'list') {
    return jsonOutput_(listPatterns_());
  }
  return jsonOutput_({ error: 'unknown action: ' + action });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var saved = savePattern_(data);
    return jsonOutput_({ ok: true, id: saved.id });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['id', 'title', 'createdAt', 'payload']);
  }
  return sh;
}

function listPatterns_() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var rows = sh.getRange(2, 1, last - 1, 4).getValues();
  var out = [];
  for (var i = rows.length - 1; i >= 0 && out.length < MAX_LIST; i--) {
    try {
      var payload = JSON.parse(rows[i][3]);
      payload.id = rows[i][0];
      payload.title = rows[i][1];
      payload.createdAt = rows[i][2];
      out.push(payload);
    } catch (err) { /* 잘못된 행은 건너뜀 */ }
  }
  return out;
}

function savePattern_(data) {
  if (!data || !data.cells || !data.legend || !data.cols || !data.rows) {
    throw new Error('invalid pattern payload');
  }
  var sh = getSheet_();
  var id = Utilities.getUuid();
  var createdAt = new Date().toISOString();
  var title = String(data.title || '제목 없음').slice(0, 60);
  var payload = {
    app: 'pixelworld',
    type: 'pattern',
    version: 1,
    ratio: data.ratio || 'square',
    sizeKey: data.sizeKey || 'medium',
    cols: data.cols,
    rows: data.rows,
    legend: data.legend,
    cells: data.cells
  };
  sh.appendRow([id, title, createdAt, JSON.stringify(payload)]);
  return { id: id };
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
