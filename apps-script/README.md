# 도안 갤러리 서버 설정 (Google Apps Script)

PIXEL WORLD의 **도안 갤러리**는 구글 스프레드시트를 서버 삼아 도안을 주고받는 기능입니다.
별도의 서버 운영 없이 무료로 동작합니다. 아래 순서대로 한 번만 설정하면 됩니다.

## 1. 스프레드시트 만들기
1. [구글 스프레드시트](https://sheets.new) 에서 새 시트를 하나 만듭니다.
2. 메뉴에서 **확장 프로그램 → Apps Script** 를 엽니다.

## 2. 코드 붙여넣기
1. 열린 Apps Script 편집기의 기본 `Code.gs` 내용을 모두 지우고,
   이 폴더의 [`Code.gs`](./Code.gs) 내용을 그대로 붙여넣습니다.
2. 저장(💾)합니다. (`patterns` 시트는 처음 저장될 때 자동으로 생성됩니다.)

## 3. 웹앱으로 배포
1. 오른쪽 위 **배포 → 새 배포** 를 클릭합니다.
2. 유형 선택에서 **웹 앱**을 고릅니다.
3. 설정:
   - **실행 주체**: 나
   - **액세스 권한**: **모든 사용자**
4. **배포**를 누르고, 처음이라면 권한을 허용합니다.
5. 발급된 **웹 앱 URL**을 복사합니다.
   (형식: `https://script.google.com/macros/s/XXXXXXXX/exec`)

## 4. 앱에 주소 연결
프로젝트의 `app.js` 상단에서 아래 상수를 찾아 복사한 URL을 넣어 주세요.

```js
const GALLERY_API_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```

저장하고 새로고침하면 **더보기 → 도안 갤러리**에서 도안 목록을 보고,
도안 만들기 화면의 **갤러리에 올리기** 버튼으로 도안을 공유할 수 있습니다.

## API 요약
| 요청 | 설명 | 반환 |
|------|------|------|
| `GET ?action=list` | 최신 도안 목록 | 도안 객체 배열 |
| `POST` (JSON 본문) | 도안 한 개 저장 | `{ ok, id }` |

> 앱은 CORS preflight를 피하기 위해 `Content-Type: text/plain` 으로 POST를 보냅니다.
> Apps Script는 `e.postData.contents` 로 본문을 그대로 읽으므로 문제가 없습니다.

## 저장되는 도안 형식
```json
{
  "type": "pattern",
  "version": 1,
  "ratio": "square",
  "sizeKey": "medium",
  "cols": 24,
  "rows": 24,
  "legend": [{ "num": 1, "color": "#ff5959" }],
  "cells": [0, 1, 0, 1, ...]
}
```
- `cells`: 각 칸의 번호(`0`은 빈 칸), 길이는 `cols × rows`.
- `legend`: 번호 ↔ 색상(헥스) 대응표.
