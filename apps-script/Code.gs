/**
 * PIXEL WORLD · 도안 갤러리 백엔드 (Google Apps Script)
 * ------------------------------------------------------
 * 구글 스프레드시트를 간단한 도안 저장소로 사용합니다.
 *  - GET  ?action=list   → 저장된 도안 목록(JSON 배열) 반환
 *  - POST (JSON body)     → 새 도안 한 개 저장
 *
 * ★ 필수 설정 ★
 * 아래 SPREADSHEET_ID 에 본인의 스프레드시트 ID를 입력하세요.
 * 스프레드시트 URL에서 /d/ 와 /edit 사이의 긴 문자열이 ID입니다.
 * 예) https://docs.google.com/spreadsheets/d/★이_부분★/edit
 */
var SPREADSHEET_ID = '여기에_스프레드시트_ID_붙여넣기';

// 도안을 저장할 시트 이름 (자동 생성됨)
var SHEET_NAME = 'patterns';
// 한 번에 내려줄 최대 도안 수 (최신순)
var MAX_LIST = 100;

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'list';
    if (action === 'list') {
      return jsonOutput_(listPatterns_());
    }
    return jsonOutput_({ error: 'unknown action: ' + action });
  } catch (err) {
    return jsonOutput_({ error: String(err) });
  }
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
  // openById를 사용해 독립형 웹앱에서도 스프레드시트를 열 수 있음
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['id', 'title', 'author', 'createdAt', 'payload']);
  }
  migrateSheet_(sh);
  return sh;
}

function migrateSheet_(sh) {
  var lastCol = Math.max(sh.getLastColumn(), 4);
  var header = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  if (header[0] === 'id' && header[1] === 'title' && header[2] === 'createdAt' && header[3] === 'payload') {
    sh.insertColumnAfter(2);
    sh.getRange(1, 3).setValue('author');
  }
}

function listPatterns_() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var rows = sh.getRange(2, 1, last - 1, 5).getValues();
  var out = [];
  for (var i = rows.length - 1; i >= 0 && out.length < MAX_LIST; i--) {
    try {
      var payload = JSON.parse(rows[i][4]);
      payload.id = rows[i][0];
      payload.title = rows[i][1];
      payload.author = rows[i][2] || payload.author || '';
      payload.createdAt = rows[i][3];
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
  var author = String(data.author || '익명').slice(0, 40);
  var payload = {
    app: 'pixelworld',
    type: 'pattern',
    version: 1,
    title: title,
    author: author,
    ratio: data.ratio || 'square',
    sizeKey: data.sizeKey || 'medium',
    cols: data.cols,
    rows: data.rows,
    legend: data.legend,
    cells: data.cells
  };
  sh.appendRow([id, title, author, createdAt, JSON.stringify(payload)]);
  return { id: id };
}

/**
 * 스크립트 에디터에서 직접 실행해 연결이 잘 됐는지 확인하는 테스트 함수.
 * 실행 후 로그(Ctrl+Enter → 실행 로그)에 "연결 성공" 이 뜨면 OK.
 */
function testConnection() {
  try {
    var sh = getSheet_();
    Logger.log('연결 성공! 시트 이름: ' + sh.getName() + ', 마지막 행: ' + sh.getLastRow());
  } catch (err) {
    Logger.log('오류: ' + err);
  }
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
