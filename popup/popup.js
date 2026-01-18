/**
 * Popup UI 로직
 *
 * 주요 기능:
 * - Preset CRUD 및 토글
 * - Block Element 목록 표시 및 관리
 * - Element Picker 모드 활성화
 * - 현재 사이트 정보 표시
 */

// =============================================================================
// 전역 상태
// =============================================================================

let currentTabUrl = '';
let currentPresets = [];
let currentBlockElements = [];
let editingPresetId = null; // 편집 중인 Preset ID (null이면 새 프리셋)

// Modal 상태 관리 (전역 오염 방지)
const modalStates = {
  elementSave: null,
  presetCreate: null,
};

// =============================================================================
// 초기화
// =============================================================================

let messageListenerAttached = false;

/**
 * Message listener 등록 (중복 방지)
 */
function attachMessageListener() {
  if (messageListenerAttached) return;
  chrome.runtime.onMessage.addListener(handleBackgroundMessage);
  messageListenerAttached = true;
}

/**
 * 팝업이 열릴 때 초기화
 */
async function init() {
  // 프리셋 목록 로드 및 표시
  await loadPresets();

  // Block Element 목록 로드 및 표시
  await loadBlockElements();

  // Tab 복원
  await restoreActiveTab();

  // 이벤트 리스너 등록
  attachEventListeners();

  // Background로부터 ELEMENT_SELECTED 메시지 수신 대기 (중복 방지)
  attachMessageListener();

  // Temp selected data가 있으면 모달 표시
  await checkTempSelected();
}

// =============================================================================
// Tab 관리
// =============================================================================

/**
 * Tab 전환
 * @param {string} tabName - 'presets' | 'elements'
 */
function switchTab(tabName) {
  // Tab 버튼 활성화
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Tab 패널 활성화
  document.querySelectorAll('.tab-pane').forEach(pane => {
    if (pane.id === `${tabName}Tab`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // 마지막 활성 Tab 저장
  chrome.storage.local.set({ lastActiveTab: tabName });
}

/**
 * 마지막 활성 Tab 복원
 */
async function restoreActiveTab() {
  try {
    const result = await chrome.storage.local.get(['lastActiveTab']);
    const lastTab = result.lastActiveTab || 'presets';
    switchTab(lastTab);
  } catch (error) {
    switchTab('presets');
  }
}

/**
 * Tab count 업데이트
 */
function updateTabCounts() {
  const presetsCount = currentPresets.length;
  const elementsCount = currentBlockElements.length;

  document.getElementById('presetsCount').textContent = `(${presetsCount})`;
  document.getElementById('elementsCount').textContent = `(${elementsCount})`;
}

// =============================================================================
// 프리셋 관리
// =============================================================================

/**
 * 프리셋 목록 로드 및 렌더링
 */
async function loadPresets() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.GET_PRESETS
    });

    if (response.success) {
      currentPresets = response.data || [];
      renderPresets(currentPresets);
    } else {
      renderPresets([]);
    }
  } catch (error) {
    renderPresets([]);
  }
}

/**
 * 프리셋 목록 렌더링
 * @param {Array} presets - 프리셋 배열
 */
function renderPresets(presets) {
  const presetListEl = document.getElementById('presetList');

  if (!presets || presets.length === 0) {
    presetListEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">프리셋을 만들어보세요</p>
      </div>
    `;
    updateTabCounts();
    return;
  }

  const presetsHTML = presets.map(createPresetCard).join('');
  presetListEl.innerHTML = presetsHTML;
  updateTabCounts();
}

/**
 * 프리셋 카드 HTML 생성
 * @param {Object} preset - 프리셋 객체
 * @returns {string} HTML 문자열
 */
function createPresetCard(preset) {
  const activeClass = preset.enabled ? 'active' : '';
  const elementCount = preset.blockElementIds ? preset.blockElementIds.length : 0;

  return `
    <div class="preset-card" data-preset-id="${preset.id}">
      <div class="preset-info">
        <div class="preset-name">${escapeHtml(preset.name)}</div>
        <div class="preset-count">${elementCount}개 요소</div>
      </div>
      <div class="preset-card-actions">
        <div class="toggle ${activeClass}" data-action="toggle"></div>
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

/**
 * 프리셋 토글
 * @param {string} presetId - 프리셋 ID
 */
async function handlePresetToggle(presetId) {
  const card = document.querySelector(`[data-preset-id="${presetId}"]`);
  if (!card) return;

  const toggle = card.querySelector('.toggle');
  const isActive = toggle.classList.contains('active');

  // UI 즉시 업데이트 (낙관적 업데이트)
  toggle.classList.toggle('active');

  try {
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.TOGGLE_PRESET,
      payload: { id: presetId }
    });

    if (!response.success) {
      // 실패 시 UI 롤백
      toggle.classList.toggle('active');
      alert('프리셋 토글에 실패했습니다.');
    }
  } catch (error) {
    // 에러 시 UI 롤백
    toggle.classList.toggle('active');
    alert('프리셋 토글에 실패했습니다.');
  }
}

/**
 * 프리셋 편집 모달 열기
 * @param {string} presetId - 프리셋 ID
 */
async function handlePresetEdit(presetId) {
  const preset = currentPresets.find(p => p.id === presetId);
  if (!preset) {
    return;
  }

  editingPresetId = presetId;
  showPresetModal(preset);
}

/**
 * 프리셋 삭제
 * @param {string} presetId - 프리셋 ID
 */
async function handlePresetDelete(presetId) {
  const preset = currentPresets.find(p => p.id === presetId);
  if (!preset) return;

  if (!confirm(`"${preset.name}" 프리셋을 삭제하시겠습니까?`)) {
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.DELETE_PRESET,
      payload: { id: presetId }
    });

    if (response.success) {
      await loadPresets(); // 목록 새로고침
    } else {
      alert('프리셋 삭제에 실패했습니다.');
    }
  } catch (error) {
    alert('프리셋 삭제에 실패했습니다.');
  }
}

/**
 * 새 프리셋 추가 모달 열기
 */
function handleAddPreset() {
  editingPresetId = null;
  showPresetModal();
}

/**
 * 프리셋 모달 표시
 * @param {Object|null} preset - 편집할 프리셋 (null이면 새 프리셋)
 */
function showPresetModal(preset = null) {
  const modal = document.getElementById('presetCreateModal');
  const nameInput = document.getElementById('presetNameInput');
  const checkboxListEl = document.getElementById('presetElementList');

  // 입력 필드 설정
  nameInput.value = preset ? preset.name : '';

  // 체크박스 목록 생성
  if (currentBlockElements.length === 0) {
    checkboxListEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">먼저 숨김 요소를 추가해주세요</p>
      </div>
    `;
  } else {
    const checkboxesHTML = currentBlockElements.map(element => {
      const isChecked = preset && preset.blockElementIds && preset.blockElementIds.includes(element.id);
      return createCheckboxItem(element, isChecked);
    }).join('');
    checkboxListEl.innerHTML = checkboxesHTML;
  }

  // 모달 표시
  modal.style.display = 'flex';
}

/**
 * 프리셋 모달 숨김
 */
function hidePresetModal() {
  document.getElementById('presetCreateModal').style.display = 'none';
  editingPresetId = null;
}

/**
 * 프리셋 저장
 */
async function handleSavePreset() {
  const nameInput = document.getElementById('presetNameInput');
  const name = nameInput.value.trim();

  if (!name) {
    alert('프리셋 이름을 입력해주세요.');
    nameInput.focus();
    return;
  }

  // 선택된 Block Element ID 수집
  const checkboxes = document.querySelectorAll('#presetElementList .checkbox-input:checked');
  const blockElementIds = Array.from(checkboxes).map(cb => cb.value);

  if (blockElementIds.length === 0) {
    alert('최소 1개 이상의 요소를 선택해주세요.');
    return;
  }

  const presetData = {
    name,
    blockElementIds
  };

  // 편집 모드면 ID 포함
  if (editingPresetId) {
    presetData.id = editingPresetId;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SAVE_PRESET,
      payload: presetData
    });

    if (response.success) {
      hidePresetModal();
      await loadPresets(); // 목록 새로고침
    } else {
      alert('프리셋 저장에 실패했습니다: ' + response.error);
    }
  } catch (error) {
    alert('프리셋 저장에 실패했습니다.');
  }
}

// =============================================================================
// Block Element 관리
// =============================================================================

/**
 * Block Element 목록 로드 및 렌더링
 */
async function loadBlockElements() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.GET_BLOCK_ELEMENTS
    });

    if (response.success) {
      currentBlockElements = response.data || [];
      renderBlockElements(currentBlockElements);
    } else {
      renderBlockElements([]);
    }
  } catch (error) {
    renderBlockElements([]);
  }
}

/**
 * Block Element 목록 렌더링
 * @param {Array} elements - Block Element 배열
 */
function renderBlockElements(elements) {
  const elementListEl = document.getElementById('elementList');

  if (!elements || elements.length === 0) {
    elementListEl.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">요소를 선택해서 추가하세요</p>
      </div>
    `;
    updateTabCounts();
    return;
  }

  const elementsHTML = elements.map(createElementItem).join('');
  elementListEl.innerHTML = elementsHTML;
  updateTabCounts();
}

/**
 * Block Element 아이템 HTML 생성
 * @param {Object} element - Block Element 객체
 * @returns {string} HTML 문자열
 */
function createElementItem(element) {
  const displaySelector = element.selectors && element.selectors[0] ? element.selectors[0] : 'Unknown';

  return `
    <div class="element-item" data-element-id="${element.id}">
      <div class="element-item-info">
        <div class="element-item-name">${escapeHtml(element.name)}</div>
        <div class="element-item-selector">${escapeHtml(displaySelector)}</div>
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

/**
 * Element Picker 모드 시작
 */
async function handleAddElement() {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send START_PICKER message to content script
    await chrome.tabs.sendMessage(tab.id, {
      type: MESSAGE_TYPES.START_PICKER
    });

    // Side Panel은 열린 상태 유지 (window.close() 제거)

  } catch (error) {

    // 연결 실패 에러는 페이지 새로고침 안내
    if (error.message?.includes('Could not establish connection') ||
        error.message?.includes('Receiving end does not exist')) {
      alert('페이지를 새로고침한 후 다시 시도해주세요.\n(확장 프로그램이 업데이트되었습니다)');
    } else {
      alert('Element Picker를 시작할 수 없습니다.');
    }
  }
}

/**
 * Block Element 삭제
 * @param {string} elementId - Block Element ID
 */
async function handleDeleteElement(elementId) {
  const element = currentBlockElements.find(e => e.id === elementId);
  if (!element) return;

  if (!confirm(`"${element.name}" 요소를 삭제하시겠습니까?`)) {
    return;
  }

  try {
    // 1. 이 Element를 포함하는 Preset 찾기
    const affectedPresets = currentPresets.filter(preset =>
      preset.blockElementIds.includes(elementId)
    );

    // 2. 각 Preset에서 Element 제거 또는 Preset 삭제
    for (const preset of affectedPresets) {
      if (preset.blockElementIds.length === 1) {
        // Element가 하나만 있으면 Preset 삭제
        await chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.DELETE_PRESET,
          payload: { id: preset.id }
        });
      } else {
        // Element가 여러 개면 해당 Element만 제거
        const updatedIds = preset.blockElementIds.filter(id => id !== elementId);
        await chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.UPDATE_PRESET,
          payload: {
            ...preset,
            blockElementIds: updatedIds
          }
        });
      }
    }

    // 3. Block Element 삭제
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.DELETE_BLOCK_ELEMENT,
      payload: { id: elementId }
    });

    if (response.success) {
      await loadBlockElements(); // 목록 새로고침
      await loadPresets(); // 프리셋 목록도 새로고침
    } else {
      alert('요소 삭제에 실패했습니다.');
    }
  } catch (error) {
    alert('요소 삭제에 실패했습니다.');
  }
}

// =============================================================================
// Element Save Modal
// =============================================================================

/**
 * Temp selected data 확인 및 모달 표시
 */
async function checkTempSelected() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.TEMP_SELECTED]);
    const tempData = result[STORAGE_KEYS.TEMP_SELECTED];

    if (tempData) {
      showElementSaveModal(tempData);
      // Temp data 삭제
      await chrome.storage.local.remove([STORAGE_KEYS.TEMP_SELECTED]);
    }
  } catch (error) {
  }
}

/**
 * Element Save Modal 표시
 * @param {Object} elementData - 선택된 요소 데이터
 */
function showElementSaveModal(elementData) {
  const modal = document.getElementById('elementSaveModal');
  const nameInput = document.getElementById('elementNameInput');
  const selectorInfo = document.getElementById('selectedElementInfo');

  // 데이터 채우기
  nameInput.value = elementData.suggestedName || elementData.description || '';

  // Selector 표시 (배열의 첫 번째 값 또는 description)
  const displayText = elementData.description ||
                      (elementData.selectors && elementData.selectors[0]) ||
                      elementData.tagName ||
                      'Unknown';
  selectorInfo.textContent = displayText;

  // URL 패턴 설정
  try {
    const url = new URL(elementData.url);
    document.getElementById('siteWidePattern').textContent = url.hostname;
    document.getElementById('pathPattern').textContent = url.hostname + url.pathname + '*';
    document.getElementById('exactPagePattern').textContent = url.href;
  } catch (error) {
  }

  // 모달 표시
  modal.style.display = 'flex';

  // elementData를 modalStates에 저장 (전역 오염 방지)
  modalStates.elementSave = elementData;
}

/**
 * Element Save Modal 숨김
 */
async function hideElementSaveModal() {
  document.getElementById('elementSaveModal').style.display = 'none';
  modalStates.elementSave = null;

  // TEMP_SELECTED 삭제 (중요!)
  try {
    await chrome.storage.local.remove([STORAGE_KEYS.TEMP_SELECTED]);
  } catch (error) {
    // Temp data 삭제 실패는 조용히 처리
  }
}

/**
 * Element 저장
 */
async function handleSaveElement() {
  const nameInput = document.getElementById('elementNameInput');
  const name = nameInput.value.trim();

  if (!name) {
    alert('요소 이름을 입력해주세요.');
    nameInput.focus();
    return;
  }

  const selectedRadio = document.querySelector('input[name="urlPattern"]:checked');
  const urlPatternType = selectedRadio ? selectedRadio.value : 'site_wide';

  if (!modalStates.elementSave) {
    alert('선택된 요소 데이터가 없습니다.');
    hideElementSaveModal();
    return;
  }

  let urlPattern;
  try {
    const url = new URL(modalStates.elementSave.url);

    switch (urlPatternType) {
      case 'site_wide':
        urlPattern = url.hostname;
        break;
      case 'path_pattern':
        urlPattern = url.hostname + url.pathname + '*';
        break;
      case 'exact_page':
        urlPattern = url.href;
        break;
      default:
        urlPattern = url.hostname;
    }
  } catch (error) {
    alert('URL 패턴 생성에 실패했습니다.');
    return;
  }

  const elementData = {
    name,
    selectors: modalStates.elementSave.selectors,  // 배열 그대로 사용
    urlPattern,
    urlPatternType
  };

  try {
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SAVE_BLOCK_ELEMENT,
      payload: elementData
    });

    if (response.success) {
      await hideElementSaveModal(); // TEMP_SELECTED 삭제 대기
      await loadBlockElements(); // 목록 새로고침
    } else {
      alert('요소 저장에 실패했습니다: ' + response.error);
    }
  } catch (error) {
    alert('요소 저장에 실패했습니다.');
  }
}

// =============================================================================
// Background 메시지 처리
// =============================================================================

/**
 * Background로부터 메시지 수신
 * @param {Object} message - 메시지 객체
 */
function handleBackgroundMessage(message) {
  if (message.type === MESSAGE_TYPES.ELEMENT_SELECTED) {
    showElementSaveModal(message.payload);
  }
}

// =============================================================================
// 이벤트 리스너
// =============================================================================

/**
 * 이벤트 리스너 등록
 */
function attachEventListeners() {
  // Tab 버튼
  const presetsTabBtn = document.getElementById('presetsTabBtn');
  const elementsTabBtn = document.getElementById('elementsTabBtn');

  if (presetsTabBtn) {
    presetsTabBtn.addEventListener('click', () => switchTab('presets'));
  }

  if (elementsTabBtn) {
    elementsTabBtn.addEventListener('click', () => switchTab('elements'));
  }

  // 프리셋 추가 버튼
  const addPresetBtn = document.getElementById('addPresetBtn');
  if (addPresetBtn) {
    addPresetBtn.addEventListener('click', handleAddPreset);
  }

  // 요소 선택 버튼
  const addElementBtn = document.getElementById('addElementBtn');
  if (addElementBtn) {
    addElementBtn.addEventListener('click', handleAddElement);
  }

  // 프리셋 목록 이벤트 위임
  const presetList = document.getElementById('presetList');
  if (presetList) {
    presetList.addEventListener('click', (e) => {
      const card = e.target.closest('.preset-card');
      if (!card) return;

      const presetId = card.dataset.presetId;

      // 토글 클릭
      if (e.target.closest('[data-action="toggle"]')) {
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
  }

  // Block Element 목록 이벤트 위임
  const elementList = document.getElementById('elementList');
  if (elementList) {
    elementList.addEventListener('click', (e) => {
      const item = e.target.closest('.element-item');
      if (!item) return;

      const elementId = item.dataset.elementId;

      // 삭제 버튼 클릭
      if (e.target.closest('[data-action="delete"]')) {
        handleDeleteElement(elementId);
        return;
      }
    });
  }

  // Element Save Modal 이벤트
  const closeElementModalBtn = document.getElementById('closeElementModalBtn');
  if (closeElementModalBtn) {
    closeElementModalBtn.addEventListener('click', hideElementSaveModal);
  }

  const cancelElementBtn = document.getElementById('cancelElementBtn');
  if (cancelElementBtn) {
    cancelElementBtn.addEventListener('click', hideElementSaveModal);
  }

  const saveElementBtn = document.getElementById('saveElementBtn');
  if (saveElementBtn) {
    saveElementBtn.addEventListener('click', handleSaveElement);
  }

  // Preset Create Modal 이벤트
  const closePresetModalBtn = document.getElementById('closePresetModalBtn');
  if (closePresetModalBtn) {
    closePresetModalBtn.addEventListener('click', hidePresetModal);
  }

  const cancelPresetBtn = document.getElementById('cancelPresetBtn');
  if (cancelPresetBtn) {
    cancelPresetBtn.addEventListener('click', hidePresetModal);
  }

  const savePresetBtn = document.getElementById('savePresetBtn');
  if (savePresetBtn) {
    savePresetBtn.addEventListener('click', handleSavePreset);
  }

  // 라디오 옵션 시각적 피드백
  const radioOptions = document.querySelectorAll('.radio-option');
  radioOptions.forEach(option => {
    option.addEventListener('click', () => {
      const group = option.closest('.radio-group');
      if (group) {
        group.querySelectorAll('.radio-option').forEach(opt => {
          opt.classList.remove('selected');
        });
      }
      option.classList.add('selected');

      const radioInput = option.querySelector('.radio-input');
      if (radioInput) {
        radioInput.checked = true;
      }
    });
  });
}

// =============================================================================
// 헬퍼 함수
// =============================================================================

/**
 * 체크박스 아이템 HTML 생성
 * @param {Object} element - Block Element 객체
 * @param {boolean} checked - 체크 여부
 * @returns {string} HTML 문자열
 */
function createCheckboxItem(element, checked = false) {
  const checkedAttr = checked ? 'checked' : '';

  return `
    <label class="checkbox-item">
      <input type="checkbox" class="checkbox-input" value="${element.id}" ${checkedAttr} />
      <span class="checkbox-label">${escapeHtml(element.name)}</span>
    </label>
  `;
}

/**
 * HTML 이스케이프
 * @param {string} str - 이스케이프할 문자열
 * @returns {string} 이스케이프된 문자열
 */
function escapeHtml(str) {
  if (!str) return '';

  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// =============================================================================
// 실행
// =============================================================================

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);
