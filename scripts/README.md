# Build Scripts

Chrome Web Store 배포를 위한 빌드 스크립트입니다.

## 사용 방법

### Windows (PowerShell)

```powershell
npm run build:win
```

또는 직접 실행:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-extension.ps1
```

### Mac/Linux (Bash)

```bash
npm run build
```

또는 직접 실행:

```bash
bash scripts/build-extension.sh
```

## 출력

빌드가 완료되면 다음 파일이 생성됩니다:

```
dist/
  └── veil-v{version}.zip
```

예: `dist/veil-v1.2.0.zip`

## 포함되는 파일

- `assets/` - 아이콘 및 리소스
- `background/` - 백그라운드 스크립트
- `content/` - 콘텐츠 스크립트
- `popup/` - 팝업 UI
- `shared/` - 공유 유틸리티
- `manifest.json` - 확장 프로그램 설정
- `README.md` (선택)
- `LICENSE` (선택)
- `PRIVACY.md` (선택)

## 제외되는 파일

- `.claude/` - Claude 설정
- `.git/` - Git 저장소
- `tests/` - 테스트 파일
- `node_modules/` - 의존성
- `package.json`, `package-lock.json` - npm 설정
- `jest.config.js` - 테스트 설정
- `*.test.js`, `*.spec.js` - 테스트 파일
- `.DS_Store`, `Thumbs.db` - 시스템 파일
- `*.md` (README, PRIVACY 제외)

## Chrome Web Store 업로드

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) 접속
2. "New Item" 클릭
3. `dist/veil-v{version}.zip` 파일 업로드
4. 스토어 정보 입력 및 제출

## 문제 해결

### Windows에서 PowerShell 실행 정책 오류

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 권한 오류 (Mac/Linux)

```bash
chmod +x scripts/build-extension.sh
```

## 버전 업데이트

1. `manifest.json`의 `version` 필드 수정
2. 빌드 스크립트 실행
3. 자동으로 새 버전 번호가 ZIP 파일명에 반영됨
