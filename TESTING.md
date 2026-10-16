# 개발 검증

빌드가 없는 정적 웹앱입니다. Node.js 22 이상과 Python 3을 사용합니다.

```sh
node --check app.js
node --check < apps-script/Code.gs
node --test tests/security.test.cjs
```

제한된 환경에서 테스트 subprocess 생성이 막히면 다음처럼 같은 테스트를 실행할 수 있습니다.

```sh
node --test --test-isolation=none tests/security.test.cjs
```

보안 테스트는 실제 예제 도안 17개와 잘못된 도안·메타데이터, 관리자 권한 검증, 수식 형태 문자열 처리를 검사합니다. Google 서비스는 Node VM 안의 테스트 대체 객체를 쓰므로 실제 Sheets 연동 검증은 아닙니다. 실제 시트에서의 문자 보존·백업 삭제·배포 권한은 비공개 테스트 환경에서 별도 확인해야 합니다.

## 브라우저 검증

Playwright와 Chromium이 설치된 테스트 환경에서:

```sh
node tests/browser.cjs
```

Chromium 경로 기본값은 `/usr/bin/chromium`이며 `CHROMIUM_PATH`로 변경할 수 있습니다. 저장소의 앱 실행에는 Playwright가 필요하지 않습니다. 테스트 환경에 Playwright가 없다면 저장소 밖 전용 경로에 설치하고 `NODE_PATH`로 해당 `node_modules`를 지정합니다. 저장소의 런타임 의존성이나 잠금파일을 새로 만들 필요는 없습니다.

테스트는 임시 로컬 서버를 직접 띄워 종료하며 외부 HTTPS 요청을 가로챕니다. 실제 공개 갤러리에 POST하거나 관리자 비밀번호를 사용하지 않습니다. 도안 파일·모의 갤러리의 HTML 삽입 차단, 예제 불러오기, 링크 검증, PC·모바일 편집/자동 저장, 언어와 업로드 안내를 검사합니다. 외부 글꼴을 차단한 환경이므로 실제 폰트/아이콘 표시 검증과는 구분합니다.

개발 서버는 저장소 루트에서 `python3 -m http.server 8000`으로 실행합니다. Apps Script 변경은 소스 수정만으로 운영 서버에 반영되지 않습니다. 운영자 검토 후 실제 Apps Script 프로젝트에 적용하고 새 버전으로 재배포해야 합니다. 이 검증 작업은 배포를 수행하지 않습니다.
