# Chrome Web Store 배포 가이드

Veil 확장 프로그램을 Chrome Web Store에 배포하는 전체 절차입니다.

## 목차

1. [사전 준비](#1-사전-준비)
2. [개발자 등록](#2-개발자-등록)
3. [확장 프로그램 빌드](#3-확장-프로그램-빌드)
4. [스토어 정보 준비](#4-스토어-정보-준비)
5. [업로드 및 배포](#5-업로드-및-배포)
6. [검토 및 승인](#6-검토-및-승인)

---

## 1. 사전 준비

### 1.1 필수 요소 체크리스트

- [x] **아이콘**: 16x16, 48x48, 128x128 PNG
- [x] **manifest.json**: 올바르게 구성됨
- [x] **버전**: 1.2.0
- [ ] **개인정보 보호정책**: PRIVACY.md 작성 필요
- [ ] **스크린샷**: 최소 1개 (1280x800 또는 640x400)
- [ ] **상세 설명**: 한글/영문 준비

### 1.2 권한 사용 내역

현재 Veil이 요청하는 권한:

| 권한 | 사용 목적 |
|------|----------|
| `storage` | 프리셋 및 숨김 요소 설정을 브라우저 로컬 저장소에 저장 |
| `activeTab` | 현재 활성 탭에서 요소 선택 기능 제공 |
| `scripting` | 선택한 요소를 숨기기 위한 CSS 주입 |
| `sidePanel` | 사이드 패널 UI 표시 |
| `<all_urls>` | 모든 웹사이트에서 확장 프로그램 동작 가능 |

**중요**: Chrome Web Store는 `storage`, `activeTab`, `scripting` 권한 사용 시 **개인정보 보호정책을 필수로 요구**합니다.

---

## 2. 개발자 등록

### 2.1 개발자 계정 생성

1. Chrome Web Store Developer Dashboard 접속
   - URL: https://chrome.google.com/webstore/devconsole

2. Google 계정으로 로그인

3. **일회성 등록 비용 결제**
   - 금액: **$5 USD**
   - 결제 방법: 신용카드/체크카드
   - 평생 유효

4. 개발자 정보 입력
   - 이메일 주소 (공개됨)
   - 게시자 이름 (공개됨)
   - 웹사이트 (선택사항)

---

## 3. 확장 프로그램 빌드

### 3.1 빌드 실행

**Windows:**
```powershell
npm run build:win
```

**Mac/Linux:**
```bash
npm run build
```

### 3.2 빌드 출력 확인

빌드가 완료되면 다음 파일이 생성됩니다:

```
dist/
  └── veil-v1.2.0.zip
```

### 3.3 ZIP 파일 내용 검증

다음 파일들이 포함되어야 합니다:

```
veil-v1.2.0.zip
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── background/
│   └── background.js
├── content/
│   ├── content.js
│   └── content.css
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── shared/
│   ├── constants.js
│   ├── utils.js
│   └── store.js
├── manifest.json
├── README.md (선택)
└── PRIVACY.md (권장)
```

---

## 4. 스토어 정보 준비

### 4.1 기본 정보

**제품 이름:**
```
Veil - Focus Mode Manager
```

**짧은 설명 (영문, 132자 이내):**
```
Hide distracting elements and create custom focus presets for better productivity
```

**짧은 설명 (한글, 132자 이내):**
```
방해되는 웹 요소를 숨기고 나만의 집중 모드 프리셋을 만들어보세요
```

**카테고리:**
```
Productivity (생산성)
```

**언어:**
```
Korean (한국어)
English (영어)
```

### 4.2 상세 설명

#### 영문 버전:
```markdown
# Veil - Focus Mode Manager

Hide distracting web elements and create custom focus presets for better concentration while browsing.

## Key Features

🎯 **Element Picker**
Click to select and hide any distracting element on web pages with visual highlighting.

📋 **Preset Management**
Save frequently used hiding configurations as presets for quick switching between focus modes.

🌐 **URL Patterns**
Apply settings to entire site, specific paths, or individual pages with flexible URL matching.

🔄 **Quick Toggle**
Instantly switch between presets to create your ideal browsing environment.

## Use Cases

- Hide YouTube Shorts, recommended videos, and comments
- Remove social media timelines and trending sections
- Block news site comment sections and ads
- Create distraction-free reading environments

## Privacy

- All data stored locally in your browser
- No server communication
- No personal data collection
- Open source and transparent

Perfect for students, researchers, and anyone who wants to stay focused while browsing the web.
```

#### 한글 버전:
```markdown
# Veil - 집중 모드 관리자

웹 서핑 중 방해되는 요소를 숨기고, 나만의 집중 모드 프리셋을 만들어 생산성을 높여보세요.

## 주요 기능

🎯 **요소 선택**
클릭 한 번으로 원하는 요소를 선택하고 숨길 수 있습니다. 시각적 하이라이트로 정확한 선택이 가능합니다.

📋 **프리셋 관리**
자주 사용하는 숨김 설정을 프리셋으로 저장하여 빠르게 집중 모드를 전환할 수 있습니다.

🌐 **URL 패턴**
사이트 전체, 특정 경로, 또는 특정 페이지에만 설정을 적용할 수 있는 유연한 URL 매칭을 제공합니다.

🔄 **빠른 전환**
프리셋 간 즉시 전환으로 상황에 맞는 최적의 웹 환경을 조성할 수 있습니다.

## 사용 예시

- YouTube 쇼츠, 추천 동영상, 댓글 섹션 숨기기
- SNS 타임라인, 트렌드 섹션 제거
- 뉴스 사이트 댓글 및 광고 차단
- 집중력이 필요한 독서 환경 조성

## 개인정보 보호

- 모든 데이터는 브라우저 로컬에만 저장됩니다
- 서버 통신 없음
- 개인정보 수집 없음
- 오픈 소스로 투명하게 공개

학생, 연구원, 그리고 웹 서핑 중 집중력을 유지하고 싶은 모든 분들에게 완벽합니다.
```

### 4.3 스크린샷 준비

**필수 스크린샷 (최소 1개, 최대 5개):**

1. **메인 UI** (1280x800)
   - 사이드 패널 UI 전체 화면
   - 프리셋 탭 활성화 상태
   - 프리셋 목록 및 카운트 표시

2. **요소 선택** (1280x800)
   - Element Picker 활성화 상태
   - 요소 하이라이트 표시
   - 상단 배너 및 툴팁

3. **숨김 요소 관리** (1280x800)
   - 숨김 요소 탭 활성화
   - 요소 목록 표시
   - URL 패턴 표시

4. **Before/After** (1280x800)
   - YouTube 등의 실제 사용 예시
   - 요소 숨기기 전/후 비교

5. **프리셋 생성** (1280x800)
   - 프리셋 생성 모달
   - 요소 선택 체크박스

**프로모션 타일 (선택사항, 440x280):**
- 앱 로고와 주요 기능 강조

### 4.4 개인정보 보호정책

**필수 항목:**

1. **데이터 수집 내역**
   - 수집하는 데이터: 사용자가 생성한 프리셋, 숨김 요소 설정
   - 수집 목적: 확장 프로그램 기능 제공
   - 저장 위치: 브라우저 로컬 저장소 (chrome.storage.local)

2. **데이터 사용**
   - 서버 전송 여부: 없음
   - 제3자 공유: 없음
   - 데이터 보관 기간: 사용자가 직접 삭제할 때까지

3. **사용자 권리**
   - 데이터 삭제: 확장 프로그램 삭제 시 모든 데이터 자동 삭제
   - 데이터 내보내기: 지원 안 함 (로컬 저장소만 사용)

**PRIVACY.md 파일 생성이 필요합니다.**

---

## 5. 업로드 및 배포

### 5.1 Chrome Web Store 업로드

1. **Developer Dashboard 접속**
   - https://chrome.google.com/webstore/devconsole

2. **새 항목 추가**
   - "New Item" 버튼 클릭
   - `dist/veil-v1.2.0.zip` 파일 선택 및 업로드
   - 업로드 완료까지 대기 (약 1-2분)

3. **스토어 목록 작성**

   **기본 정보:**
   - Product name: `Veil - Focus Mode Manager`
   - Summary: (위 4.1 참조)
   - Detailed description: (위 4.2 참조)
   - Category: `Productivity`
   - Language: `Korean`, `English`

   **그래픽 자산:**
   - Icon: 128x128 (manifest.json에서 자동 추출)
   - Screenshots: 업로드 (위 4.3 참조)
   - Promotional tile: 업로드 (선택사항)

   **개인정보:**
   - Privacy policy URL: (PRIVACY.md 호스팅 URL 또는 GitHub 링크)
   - Permissions justification:
     ```
     - storage: Save user-created presets and hidden element settings
     - activeTab: Access current tab to select elements
     - scripting: Inject CSS to hide selected elements
     - sidePanel: Display side panel UI
     - <all_urls>: Work on all websites as requested by user
     ```

4. **배포 옵션 선택**

   - **공개 (Public)**: 누구나 검색 및 설치 가능 (권장)
   - **미등록 (Unlisted)**: 링크가 있는 사람만 설치 가능
   - **비공개 (Private)**: 특정 Google 계정만 설치 가능

5. **가격 설정**
   - Free (무료)

### 5.2 제출

- "Submit for Review" 버튼 클릭
- 확인 메시지 확인
- 검토 대기

---

## 6. 검토 및 승인

### 6.1 검토 프로세스

**예상 소요 시간:** 1-3일 (영업일 기준)

**검토 항목:**
1. 악성 코드 검사
2. 권한 사용의 정당성 확인
3. 개인정보 보호정책 준수
4. Chrome Web Store 정책 위반 여부
5. 설명과 실제 기능 일치 여부

### 6.2 승인 후

✅ **자동 게시**
- 승인되면 자동으로 Chrome Web Store에 게시
- 검색 및 설치 가능

📊 **통계 확인**
- Developer Dashboard에서 설치 수, 평점 등 확인 가능
- 사용자 리뷰 관리

### 6.3 거절 시 대응

❌ **거절 사유 확인**
- 이메일 또는 Dashboard에서 확인
- 주요 거절 사유:
  - 권한 사용 정당성 부족
  - 개인정보 보호정책 미비
  - 설명과 기능 불일치
  - 정책 위반

🔧 **수정 및 재제출**
1. 거절 사유에 따라 수정
2. 버전 번호 업데이트 (예: 1.2.0 → 1.2.1)
3. 재빌드 및 재업로드
4. 재제출

---

## 7. 업데이트 배포

### 7.1 버전 업데이트 절차

1. **manifest.json 버전 업데이트**
   ```json
   {
     "version": "1.3.0"
   }
   ```

2. **재빌드**
   ```powershell
   npm run build:win
   ```

3. **Developer Dashboard에서 업데이트**
   - 기존 항목 선택
   - "Upload Updated Package" 클릭
   - 새 ZIP 파일 업로드
   - "Submit for Review" 클릭

4. **변경 로그 작성**
   - 새로운 기능
   - 버그 수정
   - 개선 사항

### 7.2 버전 관리 규칙

**Semantic Versioning (MAJOR.MINOR.PATCH):**

- **MAJOR**: 주요 기능 변경, 호환성 깨짐
- **MINOR**: 새 기능 추가, 하위 호환성 유지
- **PATCH**: 버그 수정, 작은 개선

**예시:**
- 1.2.0 → 1.2.1: 버그 수정
- 1.2.0 → 1.3.0: 새 기능 추가
- 1.2.0 → 2.0.0: 메이저 리뉴얼

---

## 8. 체크리스트

### 배포 전 최종 확인

- [ ] manifest.json 버전 확인
- [ ] 빌드 성공 및 ZIP 파일 생성 확인
- [ ] PRIVACY.md 작성 완료
- [ ] 스크린샷 준비 (최소 1개)
- [ ] 한글/영문 설명 작성 완료
- [ ] 개발자 계정 등록 완료 ($5 결제)
- [ ] 권한 사용 정당성 설명 준비
- [ ] 테스트 완료 (로컬 환경)

### 제출 후 확인

- [ ] 제출 확인 이메일 수신
- [ ] 검토 상태 주기적 확인
- [ ] 승인 알림 확인
- [ ] Chrome Web Store에서 검색 확인
- [ ] 설치 테스트

---

## 9. 유용한 링크

- **Chrome Web Store Developer Dashboard**
  https://chrome.google.com/webstore/devconsole

- **Chrome Extension 개발 가이드**
  https://developer.chrome.com/docs/extensions/

- **Chrome Web Store 정책**
  https://developer.chrome.com/docs/webstore/program-policies/

- **개인정보 보호정책 가이드**
  https://developer.chrome.com/docs/webstore/user_data/

- **Veil GitHub 저장소**
  https://github.com/SeoJaeWan/Veil

---

## 10. 문제 해결

### 빌드 실패

**증상:** PowerShell 실행 정책 오류
**해결:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**증상:** ZIP 파일 크기 너무 큼 (> 100MB)
**해결:**
- `node_modules/`, `tests/` 제외 확인
- 불필요한 파일 제거

### 업로드 실패

**증상:** "Invalid manifest" 오류
**해결:**
- manifest.json 문법 확인
- JSON validator로 검증

**증상:** "Icon not found" 오류
**해결:**
- assets/ 폴더에 icon16.png, icon48.png, icon128.png 존재 확인
- manifest.json icons 경로 확인

### 검토 거절

**일반적인 거절 사유:**
1. 개인정보 보호정책 누락
2. 권한 사용 정당성 부족
3. 설명 불충분
4. 스크린샷 누락
5. 정책 위반 (스팸, 악성 코드 등)

**해결:**
- 거절 이메일 내용 정확히 확인
- 요구사항에 맞게 수정
- 필요 시 Support 팀에 문의

---

**작성일:** 2026-01-18
**버전:** 1.0
**작성자:** Claude Code
