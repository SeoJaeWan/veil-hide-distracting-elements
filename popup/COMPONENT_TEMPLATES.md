# Veil Popup - Component Templates

이 파일은 Frontend Developer가 동적으로 UI를 생성할 때 사용할 HTML 템플릿 모음입니다.

---

## 1. Preset Card

```html
<!-- Active Preset -->
<div class="preset-card" data-preset-id="${presetId}">
  <div class="preset-info">
    <div class="preset-name">${presetName}</div>
    <div class="preset-count">${elementCount}개 요소</div>
  </div>
  <div class="preset-card-actions">
    <div class="toggle active"></div>
    <div class="preset-actions">
      <button class="btn-menu" data-action="edit" title="편집">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M11.5 2.5l2 2L7 11H5v-2l6.5-6.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="btn-menu" data-action="delete" title="삭제">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M5.33 4V2.67a.67.67 0 01.67-.67h4a.67.67 0 01.67.67V4m2 0v9.33a.67.67 0 01-.67.67H4a.67.67 0 01-.67-.67V4h9.34z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</div>

<!-- Inactive Preset: toggle에 'active' 클래스 제거 -->
<div class="preset-card" data-preset-id="${presetId}">
  <div class="preset-info">
    <div class="preset-name">${presetName}</div>
    <div class="preset-count">${elementCount}개 요소</div>
  </div>
  <div class="preset-card-actions">
    <div class="toggle"></div> <!-- active 클래스 없음 -->
    <div class="preset-actions">
      <!-- ... -->
    </div>
  </div>
</div>
```

### JavaScript 생성 예시

```javascript
function createPresetCard(preset) {
  const activeClass = preset.enabled ? 'active' : '';

  return `
    <div class="preset-card" data-preset-id="${preset.id}">
      <div class="preset-info">
        <div class="preset-name">${preset.name}</div>
        <div class="preset-count">${preset.elementIds.length}개 요소</div>
      </div>
      <div class="preset-card-actions">
        <div class="toggle ${activeClass}"></div>
        <div class="preset-actions">
          <button class="btn-menu" data-action="edit" title="편집">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M11.5 2.5l2 2L7 11H5v-2l6.5-6.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="btn-menu" data-action="delete" title="삭제">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5.33 4V2.67a.67.67 0 01.67-.67h4a.67.67 0 01.67.67V4m2 0v9.33a.67.67 0 01-.67.67H4a.67.67 0 01-.67-.67V4h9.34z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// 사용 예시
const presetListEl = document.getElementById('presetList');
const presetsHTML = presets.map(createPresetCard).join('');
presetListEl.innerHTML = presetsHTML;
```

---

## 2. Block Element Item

```html
<div class="element-item" data-element-id="${elementId}">
  <div class="element-item-info">
    <div class="element-item-name">${elementName}</div>
    <div class="element-item-selector">${selector}</div>
  </div>
  <div class="element-item-actions">
    <button class="btn-menu" data-action="delete" title="삭제">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M5.33 4V2.67a.67.67 0 01.67-.67h4a.67.67 0 01.67.67V4m2 0v9.33a.67.67 0 01-.67.67H4a.67.67 0 01-.67-.67V4h9.34z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</div>
```

### JavaScript 생성 예시

```javascript
function createElementItem(element) {
  // Selector가 너무 길면 첫 번째 것만 표시
  const displaySelector = element.selectors[0] || 'Unknown';

  return `
    <div class="element-item" data-element-id="${element.id}">
      <div class="element-item-info">
        <div class="element-item-name">${element.name}</div>
        <div class="element-item-selector">${displaySelector}</div>
      </div>
      <div class="element-item-actions">
        <button class="btn-menu" data-action="delete" title="삭제">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5.33 4V2.67a.67.67 0 01.67-.67h4a.67.67 0 01.67.67V4m2 0v9.33a.67.67 0 01-.67.67H4a.67.67 0 01-.67-.67V4h9.34z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

// 사용 예시
const elementListEl = document.getElementById('elementList');
const elementsHTML = blockElements.map(createElementItem).join('');
elementListEl.innerHTML = elementsHTML;
```

---

## 3. Checkbox Item (Preset Modal)

```html
<label class="checkbox-item">
  <input type="checkbox" class="checkbox-input" value="${elementId}" />
  <span class="checkbox-label">${elementName}</span>
</label>
```

### JavaScript 생성 예시

```javascript
function createCheckboxItem(element, checked = false) {
  const checkedAttr = checked ? 'checked' : '';

  return `
    <label class="checkbox-item">
      <input type="checkbox" class="checkbox-input" value="${element.id}" ${checkedAttr} />
      <span class="checkbox-label">${element.name}</span>
    </label>
  `;
}

// 사용 예시 (Preset 모달 열 때)
function openPresetModal(existingPreset = null) {
  const checkboxListEl = document.getElementById('presetElementList');

  const checkboxesHTML = blockElements.map(element => {
    const isChecked = existingPreset?.elementIds.includes(element.id);
    return createCheckboxItem(element, isChecked);
  }).join('');

  checkboxListEl.innerHTML = checkboxesHTML;

  // 모달 표시
  document.getElementById('presetCreateModal').style.display = 'flex';
}
```

---

## 4. Empty State

```html
<div class="empty-state">
  <p class="empty-state-text">${message}</p>
</div>
```

### 사용 예시

```javascript
// Presets가 없을 때
const presetListEl = document.getElementById('presetList');
if (presets.length === 0) {
  presetListEl.innerHTML = `
    <div class="empty-state">
      <p class="empty-state-text">프리셋을 만들어보세요</p>
    </div>
  `;
}

// Block Elements가 없을 때
const elementListEl = document.getElementById('elementList');
if (blockElements.length === 0) {
  elementListEl.innerHTML = `
    <div class="empty-state">
      <p class="empty-state-text">요소를 선택해서 추가하세요</p>
    </div>
  `;
}
```

---

## 5. Modal 표시/숨김

### Element Save Modal

```javascript
// 모달 표시
function showElementSaveModal(elementData) {
  const modal = document.getElementById('elementSaveModal');

  // 데이터 채우기
  document.getElementById('elementNameInput').value = elementData.suggestedName || '';
  document.getElementById('selectedElementInfo').textContent = elementData.selector;

  // URL 패턴 설정
  const url = new URL(elementData.url);
  document.getElementById('siteWidePattern').textContent = url.hostname;
  document.getElementById('pathPattern').textContent = url.hostname + url.pathname + '*';
  document.getElementById('exactPagePattern').textContent = url.href;

  // 모달 표시
  modal.style.display = 'flex';
}

// 모달 숨김
function hideElementSaveModal() {
  document.getElementById('elementSaveModal').style.display = 'none';
}

// 이벤트 리스너
document.getElementById('closeElementModalBtn').addEventListener('click', hideElementSaveModal);
document.getElementById('cancelElementBtn').addEventListener('click', hideElementSaveModal);
document.getElementById('saveElementBtn').addEventListener('click', () => {
  // 저장 로직
  // ...
  hideElementSaveModal();
});
```

### Preset Create Modal

```javascript
// 모달 표시 (새 프리셋)
function showPresetCreateModal() {
  const modal = document.getElementById('presetCreateModal');

  // 입력 필드 초기화
  document.getElementById('presetNameInput').value = '';

  // Block Element 체크박스 목록 생성
  const checkboxListEl = document.getElementById('presetElementList');
  const checkboxesHTML = blockElements.map(element =>
    createCheckboxItem(element, false)
  ).join('');
  checkboxListEl.innerHTML = checkboxesHTML;

  // 모달 표시
  modal.style.display = 'flex';
}

// 모달 표시 (기존 프리셋 편집)
function showPresetEditModal(preset) {
  const modal = document.getElementById('presetCreateModal');

  // 입력 필드 채우기
  document.getElementById('presetNameInput').value = preset.name;

  // 체크박스 생성 (기존 선택 항목 체크)
  const checkboxListEl = document.getElementById('presetElementList');
  const checkboxesHTML = blockElements.map(element => {
    const isChecked = preset.elementIds.includes(element.id);
    return createCheckboxItem(element, isChecked);
  }).join('');
  checkboxListEl.innerHTML = checkboxesHTML;

  // 모달 표시
  modal.style.display = 'flex';
}

// 모달 숨김
function hidePresetCreateModal() {
  document.getElementById('presetCreateModal').style.display = 'none';
}

// 이벤트 리스너
document.getElementById('closePresetModalBtn').addEventListener('click', hidePresetCreateModal);
document.getElementById('cancelPresetBtn').addEventListener('click', hidePresetCreateModal);
document.getElementById('savePresetBtn').addEventListener('click', () => {
  // 저장 로직
  // ...
  hidePresetCreateModal();
});
```

---

## 6. 현재 사이트 정보 표시

```javascript
async function displayCurrentSite() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);

    const currentSiteEl = document.getElementById('currentSite');
    currentSiteEl.textContent = url.hostname;
  } catch (error) {
    console.error('Failed to get current site:', error);
    document.getElementById('currentSite').textContent = 'Unknown';
  }
}
```

---

## 7. 이벤트 위임 패턴

동적으로 생성된 요소에 이벤트를 붙일 때는 **이벤트 위임(Event Delegation)**을 사용하세요.

```javascript
// Preset 카드 이벤트 처리
document.getElementById('presetList').addEventListener('click', (e) => {
  const card = e.target.closest('.preset-card');
  if (!card) return;

  const presetId = card.dataset.presetId;

  // 토글 클릭
  if (e.target.closest('.toggle')) {
    handlePresetToggle(presetId);
    return;
  }

  // 편집 버튼 클릭
  if (e.target.closest('[data-action="edit"]')) {
    handlePresetEdit(presetId);
    return;
  }

  // 삭제 버튼 클릭
  if (e.target.closest('[data-action="delete"]')) {
    handlePresetDelete(presetId);
    return;
  }
});

// Block Element 아이템 이벤트 처리
document.getElementById('elementList').addEventListener('click', (e) => {
  const item = e.target.closest('.element-item');
  if (!item) return;

  const elementId = item.dataset.elementId;

  // 삭제 버튼 클릭
  if (e.target.closest('[data-action="delete"]')) {
    handleElementDelete(elementId);
    return;
  }
});
```

---

## 8. 라디오 버튼 상태 관리

```javascript
// 라디오 옵션 선택 시 시각적 피드백
document.querySelectorAll('.radio-option').forEach(option => {
  option.addEventListener('click', () => {
    // 같은 그룹의 모든 옵션에서 'selected' 제거
    const group = option.closest('.radio-group');
    group.querySelectorAll('.radio-option').forEach(opt => {
      opt.classList.remove('selected');
    });

    // 클릭된 옵션에 'selected' 추가
    option.classList.add('selected');

    // 라디오 버튼 체크
    const radioInput = option.querySelector('.radio-input');
    radioInput.checked = true;
  });
});

// 선택된 URL 패턴 가져오기
function getSelectedUrlPattern() {
  const selectedRadio = document.querySelector('input[name="urlPattern"]:checked');
  return selectedRadio ? selectedRadio.value : 'site_wide';
}
```

---

## 9. 토글 스위치 상태 관리

```javascript
// 토글 클릭 핸들러
function handlePresetToggle(presetId) {
  const card = document.querySelector(`[data-preset-id="${presetId}"]`);
  const toggle = card.querySelector('.toggle');

  // UI 즉시 업데이트
  const isActive = toggle.classList.toggle('active');

  // Background에 메시지 전송
  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.TOGGLE_PRESET,
    payload: { presetId, enabled: isActive }
  }, (response) => {
    if (!response.success) {
      // 실패 시 UI 롤백
      toggle.classList.toggle('active');
      console.error('Failed to toggle preset:', response.error);
    }
  });
}
```

---

## 10. 삭제 확인 (인라인 방식 - 선택사항)

```html
<!-- 기본 상태 -->
<div class="element-item" data-element-id="123">
  <div class="element-item-info">...</div>
  <div class="element-item-actions">
    <button class="btn-menu" data-action="delete">...</button>
  </div>
</div>

<!-- 삭제 확인 상태 -->
<div class="element-item" data-element-id="123">
  <div class="delete-confirm">
    <span class="delete-confirm-text">삭제할까요?</span>
    <button class="btn delete-confirm-btn danger" data-action="confirm-delete">삭제</button>
    <button class="btn delete-confirm-btn" data-action="cancel-delete">취소</button>
  </div>
</div>
```

```css
.delete-confirm {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(235, 87, 87, 0.1);
  border-radius: var(--radius-md);
  width: 100%;
}

.delete-confirm-text {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.delete-confirm-btn {
  padding: 4px 8px;
  font-size: var(--text-xs);
}

.delete-confirm-btn.danger {
  background: var(--color-red);
  color: white;
}
```

---

## 참고 사항

- 모든 템플릿은 `popup-demo.html`에서 시각적으로 확인 가능
- SVG 아이콘은 현재 제공된 것 사용 (편집, 삭제, 닫기, 설정)
- 동적 생성 시 XSS 방지를 위해 텍스트는 `textContent` 사용 권장
- data-attribute를 활용하여 ID 관리
