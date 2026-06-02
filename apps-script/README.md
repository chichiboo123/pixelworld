# 도안 갤러리 서버 설정 (Google Apps Script)

PIXEL WORLD의 **도안 갤러리**는 구글 스프레드시트를 저장소로 사용합니다.  
서버 운영 없이 무료로 동작하며, 아래 순서대로 한 번만 설정하면 됩니다.

---

## ★ 자주 발생하는 오류

> `TypeError: Cannot read properties of null (reading 'getSheetByName')`

**원인**: `getActiveSpreadsheet()`는 스크립트가 스프레드시트에 직접 연결된 경우만 동작합니다.  
독립형 Apps Script 프로젝트에서 실행하면 항상 이 오류가 납니다.  
→ **해결**: 아래 순서대로 스프레드시트 ID를 직접 지정하세요.

---

## 설정 순서

### 1단계. 스프레드시트 만들기

1. [구글 스프레드시트](https://sheets.new)에서 새 시트를 하나 만듭니다.
2. 주소창 URL을 확인합니다:
   ```
   https://docs.google.com/spreadsheets/d/★여기가_ID★/edit
   ```
   `/d/` 와 `/edit` 사이의 긴 문자열이 **스프레드시트 ID**입니다. 복사해 둡니다.

---

### 2단계. Apps Script 프로젝트 열기

방법 A (스프레드시트에서): 메뉴 → **확장 프로그램 → Apps Script**  
방법 B (독립형): [script.google.com](https://script.google.com) → **새 프로젝트**

> 방법 A가 더 간단하지만, 방법 B도 아래 ID 지정만 하면 완벽하게 동작합니다.

---

### 3단계. 코드 붙여넣기 + ID 입력

1. Apps Script 편집기의 `Code.gs` 내용을 모두 지우고,  
   이 폴더의 [`Code.gs`](./Code.gs) 내용을 그대로 붙여넣습니다.
2. **최상단의 `SPREADSHEET_ID`에 1단계에서 복사한 ID를 넣습니다:**
   ```js
   var SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms'; // 예시
   ```
3. 저장(💾, `Ctrl+S`)합니다.

---

### 4단계. 연결 확인 (테스트 실행)

1. 편집기 상단 함수 드롭다운에서 **`testConnection`** 을 선택합니다.
2. **▶ 실행**을 누릅니다. 처음엔 권한 허용 팝업이 나옵니다 → **허용**합니다.
3. 하단 **실행 로그**에 아래처럼 뜨면 연결 성공입니다:
   ```
   연결 성공! 시트 이름: patterns, 마지막 행: 1
   ```
   > `patterns` 시트가 없으면 자동으로 생성됩니다.

---

### 5단계. 웹앱으로 배포

1. 오른쪽 위 **배포 → 새 배포**를 클릭합니다.
2. 톱니바퀴(⚙) 아이콘 → **웹 앱** 선택합니다.
3. 아래처럼 설정합니다:

   | 항목 | 설정값 |
   |------|--------|
   | 설명 | `pixelworld-gallery` (선택) |
   | 실행 주체 | **나** |
   | 액세스 권한 | **모든 사용자** |

4. **배포**를 누릅니다.
5. 발급된 **웹 앱 URL**을 복사합니다:
   ```
   https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```

---

### 6단계. 관리자 비밀번호 설정

관리자 모드에서 갤러리 도안을 수정·삭제하려면 Apps Script의 **스크립트 속성**에 비밀번호를 저장해야 합니다.

1. Apps Script 왼쪽 메뉴에서 **프로젝트 설정(톱니바퀴)** 을 엽니다.
2. **스크립트 속성** 섹션에서 **스크립트 속성 추가**를 누릅니다.
3. 아래처럼 입력하고 저장합니다.

   | 속성 | 값 |
   |------|-----|
   | `ADMIN_PASSWORD` | 관리자 모드에서 사용할 비밀번호 |

또는 `Code.gs`의 `setAdminPasswordExample` 함수를 원하는 값으로 바꾼 뒤 한 번 실행해도 됩니다.

---

### 7단계. 앱에 URL 연결

`app.js` 상단의 `GALLERY_API_URL` 상수에 복사한 URL을 붙여넣습니다:

```js
const GALLERY_API_URL = 'https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXX/exec';
```

저장 후 새로고침하면 **더보기 → 도안 갤러리**가 활성화됩니다.

---

## 수정 후 재배포 주의

코드를 수정했을 때 **반드시 새 버전으로 재배포**해야 반영됩니다.  
→ **배포 → 배포 관리 → ✏️ 편집 → 버전: 새 버전 → 배포**

---

## API 요약

| 요청 | 설명 | 반환 예시 |
|------|------|----------|
| `GET ?action=list` | 최신 도안 목록 | `[{ cols, rows, legend, cells, title, author, ratio, views, ... }]` |
| `POST` (text/plain JSON) | 도안 저장 | `{ ok: true, id: "uuid" }` |
| `POST` `{ action: "view", id }` | 도안 조회수(클릭수) +1 | `{ ok: true, views: 12 }` |
| `POST` `{ action: "admin-list", password }` | 관리자 도안 목록 | `{ ok: true, items: [...] }` |
| `POST` `{ action: "admin-update", password, id, title, author }` | 도안 작품명/작가 수정 | `{ ok: true, item: {...} }` |
| `POST` `{ action: "admin-delete", password, id }` | 도안 삭제 | `{ ok: true }` |

> 앱은 CORS preflight를 피하기 위해 `Content-Type: text/plain`으로 POST를 보냅니다.

---

## 저장되는 스프레드시트 형식

| A열: id | B열: title | C열: author | D열: createdAt | E열: payload (JSON) | F열: views |
|---------|-----------|----------------|----------------|---------------------|------------|
| uuid | 도안 이름 | 작가(만든이) | ISO 날짜 | `{ type, title, author, ratio, cols, rows, legend, cells, ... }` | 조회수(정수) |

기존 4열(`id/title/createdAt/payload`) 형식으로 만들어진 시트는 새 코드 실행 시 `author` 열이 자동으로 추가됩니다.  
`views`(조회수) 열도 없으면 자동으로 추가되며, 기존 도안은 0부터 시작합니다. 갤러리에서 도안을 눌러 색칠을 시작할 때마다 조회수가 1씩 올라가고, 앱의 갤러리 화면에서 **인기순** 정렬에 사용됩니다.

> ⚠️ **인기순 정렬을 쓰려면** 이 폴더의 새 `Code.gs`를 붙여넣은 뒤 **반드시 새 버전으로 재배포**(배포 관리 → 편집 → 새 버전)해야 `views` 컬럼과 조회수 기능이 켜집니다.

> 관리자 수정·삭제 API는 `ADMIN_PASSWORD` 스크립트 속성과 요청 본문의 `password`가 일치할 때만 동작합니다. 수정은 작품명과 작가(만든이) 메타데이터를 바꾸고, 삭제는 해당 행을 스프레드시트에서 제거합니다.
