# Veil Popup - Component Hierarchy

이 문서는 Popup UI의 전체 구조를 트리 형태로 보여줍니다.

---

## 전체 구조

```
popup.html
│
├── .popup (메인 컨테이너)
│   │
│   ├── header.popup-header
│   │   ├── div.popup-logo ("Veil")
│   │   └── button.btn-icon#settingsBtn (설정 아이콘)
│   │
│   ├── div.divider
│   │
│   ├── section.section (PRESETS)
│   │   ├── div.section-header
│   │   │   ├── h2.section-title ("PRESETS")
│   │   │   └── button.btn-text#addPresetBtn ("+")
│   │   │
│   │   └── div.preset-list#presetList
│   │       └── [동적 생성: .preset-card ×N]
│   │           ├── div.preset-info
│   │           │   ├── div.preset-name
│   │           │   └── div.preset-count
│   │           └── div.preset-card-actions
│   │               ├── div.toggle[.active]
│   │               └── div.preset-actions
│   │                   ├── button.btn-menu[data-action="edit"]
│   │                   └── button.btn-menu[data-action="delete"]
│   │
│   ├── div.divider
│   │
│   ├── section.section (HIDDEN ELEMENTS)
│   │   ├── div.section-header
│   │   │   ├── h2.section-title ("HIDDEN ELEMENTS")
│   │   │   └── button.btn-text#addElementBtn ("+ Select")
│   │   │
│   │   └── div.element-list#elementList
│   │       └── [동적 생성: .element-item ×N]
│   │           ├── div.element-item-info
│   │           │   ├── div.element-item-name
│   │           │   └── div.element-item-selector
│   │           └── div.element-item-actions
│   │               └── button.btn-menu[data-action="delete"]
│   │
│   ├── div.divider
│   │
│   └── footer.popup-footer
│       └── div.current-site#currentSite ("youtube.com")
│
├── .modal-overlay#elementSaveModal (Element 저장 모달)
│   └── div.modal
│       ├── div.modal-header
│       │   ├── h3.modal-title ("숨김 요소 추가")
│       │   └── button.btn-icon#closeElementModalBtn
│       │
│       ├── div.modal-body
│       │   ├── div.form-group
│       │   │   ├── label.form-label ("이름")
│       │   │   └── input.input#elementNameInput
│       │   │
│       │   ├── div.form-group
│       │   │   ├── label.form-label ("적용 범위")
│       │   │   └── div.radio-group
│       │   │       ├── label.radio-option[.selected]
│       │   │       │   └── div.radio-label
│       │   │       │       ├── input[type="radio"].radio-input
│       │   │       │       └── div.radio-text
│       │   │       │           ├── div.radio-title ("이 사이트 전체")
│       │   │       │           └── div.radio-desc#siteWidePattern
│       │   │       │
│       │   │       ├── label.radio-option
│       │   │       │   └── div.radio-label
│       │   │       │       ├── input[type="radio"].radio-input
│       │   │       │       └── div.radio-text
│       │   │       │           ├── div.radio-title ("이 경로에서만")
│       │   │       │           └── div.radio-desc#pathPattern
│       │   │       │
│       │   │       └── label.radio-option
│       │   │           └── div.radio-label
│       │   │               ├── input[type="radio"].radio-input
│       │   │               └── div.radio-text
│       │   │                   ├── div.radio-title ("이 페이지만")
│       │   │                   └── div.radio-desc#exactPagePattern
│       │   │
│       │   └── div.form-group
│       │       ├── label.form-label ("선택된 요소")
│       │       └── div.selected-element#selectedElementInfo
│       │
│       └── div.modal-footer
│           ├── button.btn#cancelElementBtn ("취소")
│           └── button.btn-primary#saveElementBtn ("저장")
│
└── .modal-overlay#presetCreateModal (Preset 생성 모달)
    └── div.modal
        ├── div.modal-header
        │   ├── h3.modal-title ("새 프리셋")
        │   └── button.btn-icon#closePresetModalBtn
        │
        ├── div.modal-body
        │   ├── div.form-group
        │   │   ├── label.form-label ("이름")
        │   │   └── input.input#presetNameInput
        │   │
        │   └── div.form-group
        │       ├── label.form-label ("포함할 요소")
        │       └── div.checkbox-list#presetElementList
        │           └── [동적 생성: label.checkbox-item ×N]
        │               ├── input[type="checkbox"].checkbox-input
        │               └── span.checkbox-label
        │
        └── div.modal-footer
            ├── button.btn#cancelPresetBtn ("취소")
            └── button.btn-primary#savePresetBtn ("저장")
```

---

## 주요 ID 목록

### 고정 요소
- `#settingsBtn` - 설정 버튼
- `#addPresetBtn` - 프리셋 추가 버튼
- `#addElementBtn` - 요소 선택 버튼
- `#currentSite` - 현재 사이트 표시 영역

### 동적 콘텐츠 컨테이너
- `#presetList` - Preset 카드가 들어갈 컨테이너
- `#elementList` - Block Element 아이템이 들어갈 컨테이너

### Element Save Modal
- `#elementSaveModal` - 모달 오버레이
- `#closeElementModalBtn` - 닫기 버튼
- `#elementNameInput` - 이름 입력 필드
- `#siteWidePattern` - 사이트 전체 패턴 표시
- `#pathPattern` - 경로 패턴 표시
- `#exactPagePattern` - 정확한 페이지 패턴 표시
- `#selectedElementInfo` - 선택된 요소 Selector 표시
- `#cancelElementBtn` - 취소 버튼
- `#saveElementBtn` - 저장 버튼

### Preset Create Modal
- `#presetCreateModal` - 모달 오버레이
- `#closePresetModalBtn` - 닫기 버튼
- `#presetNameInput` - 프리셋 이름 입력 필드
- `#presetElementList` - 체크박스 목록 컨테이너
- `#cancelPresetBtn` - 취소 버튼
- `#savePresetBtn` - 저장 버튼

---

## 주요 클래스별 용도

### Layout
- `.popup` - 메인 컨테이너 (320px)
- `.section` - 섹션 컨테이너
- `.modal-overlay` - 모달 배경 (display: none → flex)
- `.modal` - 모달 컨테이너

### Components
- `.preset-card` - Preset 카드
- `.element-item` - Block Element 아이템
- `.checkbox-item` - 체크박스 아이템
- `.radio-option` - 라디오 옵션

### Interactive
- `.btn-icon` - 아이콘 버튼 (28×28px)
- `.btn-text` - 텍스트 버튼
- `.btn` - 기본 버튼
- `.btn-primary` - Primary 버튼 (파란색)
- `.btn-danger` - Danger 버튼 (빨간색)
- `.btn-menu` - 메뉴 버튼 (24×24px)
- `.toggle` - 토글 스위치

### Form
- `.form-group` - 폼 그룹
- `.form-label` - 폼 레이블
- `.input` - 텍스트 입력
- `.radio-group` - 라디오 그룹
- `.checkbox-list` - 체크박스 리스트

### Status
- `.active` - 활성 상태 (토글, 라디오)
- `.selected` - 선택 상태 (라디오 옵션)
- `.hidden` - 숨김 (display: none)

---

## 상태 관리 요약

### 토글 스위치
```css
.toggle           /* OFF - 회색 배경, 왼쪽 */
.toggle.active    /* ON - 녹색 배경, 오른쪽 */
```

### 라디오 옵션
```css
.radio-option           /* 기본 상태 */
.radio-option.selected  /* 선택 상태 - 베이지 배경 */
```

### 모달
```css
.modal-overlay { display: none; }  /* 숨김 */
.modal-overlay { display: flex; }  /* 표시 */
```

### 액션 버튼 (호버)
```css
.element-item-actions { opacity: 0; }                    /* 기본 */
.element-item:hover .element-item-actions { opacity: 1; } /* 호버 */
```

---

## 데이터 속성 (data-*)

동적으로 생성되는 요소에 사용되는 data 속성:

```html
<!-- Preset Card -->
<div class="preset-card" data-preset-id="preset_123">
  <!-- ... -->
</div>

<!-- Element Item -->
<div class="element-item" data-element-id="be_456">
  <!-- ... -->
</div>

<!-- Action Buttons -->
<button class="btn-menu" data-action="edit">
<button class="btn-menu" data-action="delete">
<button class="btn-menu" data-action="confirm-delete">
<button class="btn-menu" data-action="cancel-delete">

<!-- Checkbox -->
<input type="checkbox" value="be_123">

<!-- Radio -->
<input type="radio" name="urlPattern" value="site_wide">
<input type="radio" name="urlPattern" value="path_pattern">
<input type="radio" name="urlPattern" value="exact_page">
```

---

## CSS 변수 Quick Reference

```css
/* Colors */
--bg-primary: #ffffff
--bg-secondary: #f7f7f5
--bg-hover: rgba(55, 53, 47, 0.08)
--text-primary: #37352f
--text-secondary: #6b6b6b
--text-muted: #9b9a97
--color-blue: #2383e2
--color-green: #0f7b6c
--color-red: #eb5757

/* Spacing */
--space-2: 8px
--space-3: 12px
--space-4: 16px

/* Typography */
--text-xs: 11px
--text-sm: 12px
--text-base: 14px
--font-medium: 500
--font-semibold: 600

/* Radius */
--radius-sm: 3px
--radius-md: 5px
--radius-lg: 8px

/* Animation */
--duration-fast: 100ms
--duration-normal: 150ms
--ease-out: cubic-bezier(0, 0, 0.2, 1)
```

---

## 파일 참고

- **popup.html** - 전체 HTML 구조
- **popup.css** - 모든 스타일
- **popup.js** - UI 로직 (기능 미구현)
- **popup-demo.html** - 시각적 데모 (브라우저에서 바로 확인 가능)
- **COMPONENT_TEMPLATES.md** - JavaScript 생성 코드 예시
- **UI_IMPLEMENTATION_SUMMARY.md** - 구현 내용 요약
