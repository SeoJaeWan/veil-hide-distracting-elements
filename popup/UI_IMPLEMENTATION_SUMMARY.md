# Veil Popup UI Implementation Summary

## 구현된 컴포넌트

### 1. Element 저장 모달 (`#elementSaveModal`)

**위치**: `popup.html` 하단

**구성 요소**:
- 이름 입력 필드 (placeholder: "유튜브 쇼츠 섹션")
- URL 패턴 선택 라디오 버튼 그룹:
  - 이 사이트 전체 (site_wide)
  - 이 경로에서만 (path_pattern)
  - 이 페이지만 (exact_page)
- 선택된 요소 정보 표시 영역
- 저장/취소 버튼

**주요 클래스**:
```css
.modal-overlay
.modal
.modal-header
.modal-body
.modal-footer
.form-group
.form-label
.input
.radio-group
.radio-option
.selected-element
```

---

### 2. Preset 생성 모달 (`#presetCreateModal`)

**위치**: `popup.html` 하단

**구성 요소**:
- 이름 입력 필드 (placeholder: "공부 모드")
- Block Element 체크박스 목록
- 저장/취소 버튼

**주요 클래스**:
```css
.checkbox-list
.checkbox-item
.checkbox-input
.checkbox-label
```

---

### 3. Preset 카드 (업데이트됨)

**위치**: `#presetList` 내부

**구성 요소**:
- Preset 이름
- 포함된 요소 개수
- ON/OFF 토글 스위치
- 편집/삭제 버튼 (호버 시 표시)

**주요 클래스**:
```css
.preset-card
.preset-info
.preset-name
.preset-count
.preset-card-actions
.toggle
.toggle.active
.preset-actions
```

---

### 4. Block Element 목록 아이템 (업데이트됨)

**위치**: `#elementList` 내부

**구성 요소**:
- 요소 이름
- CSS Selector 표시 (monospace font)
- 삭제 버튼 (호버 시 표시)

**주요 클래스**:
```css
.element-item
.element-item-info
.element-item-name
.element-item-selector
.element-item-actions
```

---

## 디자인 시스템 특징

### Color Palette (Monochrome)

```css
/* Background */
--bg-primary: #ffffff
--bg-secondary: #f7f7f5  /* Notion signature beige-gray */
--bg-tertiary: #efefef
--bg-hover: rgba(55, 53, 47, 0.08)
--bg-active: rgba(55, 53, 47, 0.16)

/* Text */
--text-primary: #37352f
--text-secondary: #6b6b6b
--text-muted: #9b9a97
--text-placeholder: #c4c4c4

/* Semantic (최소 사용) */
--color-blue: #2383e2   /* 링크, 활성 상태 */
--color-green: #0f7b6c  /* 성공, ON 상태 */
--color-red: #eb5757    /* 삭제, 경고 */
```

### Typography

```css
--text-xs: 11px    /* Labels, captions */
--text-sm: 12px    /* Secondary text */
--text-base: 14px  /* Body text */
--text-lg: 16px    /* Headings */

--font-normal: 400
--font-medium: 500
--font-semibold: 600
```

### Spacing & Radius

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px

--radius-sm: 3px
--radius-md: 5px
--radius-lg: 8px
```

### Animation

```css
--duration-fast: 100ms
--duration-normal: 150ms
--ease-out: cubic-bezier(0, 0, 0.2, 1)
```

---

## 인터랙션 패턴

### 1. 호버 효과
- 모든 클릭 가능한 요소: `background: var(--bg-hover)`
- 버튼 아이콘: 색상 변경 (`text-muted` → `text-secondary`)
- 삭제/편집 버튼: `opacity: 0` → `opacity: 1`

### 2. 토글 스위치
- OFF 상태: 회색 배경, 왼쪽 정렬
- ON 상태: 녹색 배경, 오른쪽 정렬
- 애니메이션: 150ms ease-out

### 3. 라디오 버튼
- 선택 시: 배경색 `bg-secondary`
- 호버 시: 배경색 `bg-hover`
- 라디오 버튼 accent 색상: blue

### 4. 모달
- 오버레이: 반투명 검정 배경
- 등장 애니메이션: fade-in + scale-up (150ms)
- 그림자: Notion-style dropdown shadow

---

## 파일 구조

```
popup/
├── popup.html              # 메인 HTML (모달 포함)
├── popup.css               # 모든 스타일
├── popup.js                # UI 로직 (기능 미구현)
└── popup-demo.html         # UI 데모 페이지 (테스트용)
```

---

## 데모 확인 방법

1. `popup-demo.html` 파일을 브라우저로 열기
2. 다음 UI 컴포넌트 확인 가능:
   - 메인 팝업 (Presets + Hidden Elements)
   - Element 저장 모달
   - Preset 생성 모달
   - Empty States

---

## 다음 단계 (Frontend Developer)

1. **Element 저장 모달 로직 구현**
   - Element Picker에서 요소 선택 후 모달 표시
   - URL 패턴 자동 생성
   - Storage에 저장

2. **Preset 생성 모달 로직 구현**
   - Block Element 목록 동적 로드
   - Preset 생성 및 Storage 저장
   - UI 업데이트

3. **Preset 카드 기능 구현**
   - 토글 스위치 동작 (ON/OFF)
   - 편집 버튼 클릭 시 모달 열기
   - 삭제 버튼 클릭 시 확인 후 삭제

4. **Block Element 아이템 기능 구현**
   - 삭제 버튼 동작
   - 인라인 삭제 확인 UI (선택사항)

---

## 주요 특징

### ✅ Monochrome 디자인 시스템 적용
- 흰 배경, 검정/회색 텍스트
- 최소한의 색상 사용 (blue, green, red)
- Notion 스타일 subtle shadow

### ✅ 텍스트 중심 UI
- 아이콘 최소화
- 타이포그래피로 계층 표현
- Monospace font for selectors

### ✅ Subtle 인터랙션
- 빠른 애니메이션 (100-150ms)
- 호버 시에만 액션 버튼 표시
- 부드러운 색상 전환

### ✅ 접근성
- ARIA labels
- Keyboard focus states
- High contrast text

---

## 참고 사항

- 모든 UI는 **레이아웃만** 구현됨 (기능 로직 없음)
- `popup.js`의 함수들은 모두 TODO 상태
- 실제 데이터는 Storage에서 가져와야 함
- Chrome Extension Message Passing 연동 필요
