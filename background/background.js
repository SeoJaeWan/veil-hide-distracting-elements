/**
 * Background Service Worker
 *
 * 주요 기능:
 * - 메시지 라우팅: Popup ↔ Content Script
 * - Storage 동기화: 탭 간 상태 동기화
 * - State 관리: 전역 상태 관리
 * - 이벤트 리스너: Storage 변경 감지
 * - Side Panel 관리
 */

// Import shared modules
importScripts('../shared/constants.js', '../shared/utils.js');

// =============================================================================
// Side Panel 관리
// =============================================================================

/**
 * 확장 아이콘 클릭 시 Side Panel 열기
 */
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (error) {
    // Side panel open failed
  }
});

// =============================================================================
// 상태 관리
// =============================================================================

/**
 * 인메모리 캐시
 */
const cache = {
  blockElements: null,
  presets: null,
  settings: null,
};

// =============================================================================
// 메시지 라우팅
// =============================================================================

/**
 * Popup 및 Content Script로부터 메시지 수신
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;

  (async () => {
    try {
      switch (type) {
        // Element Picker
        case MESSAGE_TYPES.START_PICKER: {
          // Content Script에 전달
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab?.id) {
            await chrome.tabs.sendMessage(tab.id, message);
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'No active tab' });
          }
          break;
        }

        case MESSAGE_TYPES.STOP_PICKER: {
          // Content Script에 전달
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab?.id) {
            await chrome.tabs.sendMessage(tab.id, message);
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'No active tab' });
          }
          break;
        }

        case MESSAGE_TYPES.ELEMENT_SELECTED: {
          // Temp storage에 저장
          await chrome.storage.local.set({
            [STORAGE_KEYS.TEMP_SELECTED]: payload,
          });
          sendResponse({ success: true });
          break;
        }

        // Block Elements
        case MESSAGE_TYPES.SAVE_BLOCK_ELEMENT: {
          const elements = await getBlockElements();
          const existingIndex = elements.findIndex(e => e.id === payload.id);

          let savedElement;
          if (existingIndex >= 0) {
            // 업데이트
            savedElement = {
              ...elements[existingIndex],
              ...payload,
              updatedAt: getCurrentISOTime(),
            };
            elements[existingIndex] = savedElement;
          } else {
            // 새로 추가
            savedElement = {
              ...payload,
              id: payload.id || generateId('be'),
              createdAt: getCurrentISOTime(),
              updatedAt: getCurrentISOTime(),
            };
            elements.push(savedElement);
          }

          await chrome.storage.local.set({
            [STORAGE_KEYS.BLOCK_ELEMENTS]: elements,
          });

          // 캐시 갱신
          cache.blockElements = elements;

          // 모든 탭에 STATE_UPDATED 전송
          await notifyAllTabs({ type: MESSAGE_TYPES.STATE_UPDATED });

          sendResponse({ success: true, data: savedElement });
          break;
        }

        case MESSAGE_TYPES.DELETE_BLOCK_ELEMENT: {
          const elements = await getBlockElements();
          const filtered = elements.filter(e => e.id !== payload.id);

          await chrome.storage.local.set({
            [STORAGE_KEYS.BLOCK_ELEMENTS]: filtered,
          });

          // 캐시 갱신
          cache.blockElements = filtered;

          // 모든 탭에 STATE_UPDATED 전송
          await notifyAllTabs({ type: MESSAGE_TYPES.STATE_UPDATED });

          sendResponse({ success: true });
          break;
        }

        case MESSAGE_TYPES.GET_BLOCK_ELEMENTS: {
          const elements = await getBlockElements();
          sendResponse({ success: true, data: elements });
          break;
        }

        // Presets
        case MESSAGE_TYPES.SAVE_PRESET: {
          const presets = await getPresets();
          const existingIndex = presets.findIndex(p => p.id === payload.id);

          let savedPreset;
          if (existingIndex >= 0) {
            // 업데이트
            savedPreset = {
              ...presets[existingIndex],
              ...payload,
              updatedAt: getCurrentISOTime(),
            };
            presets[existingIndex] = savedPreset;
          } else {
            // 새로 추가
            savedPreset = {
              ...payload,
              id: payload.id || generateId('preset'),
              createdAt: getCurrentISOTime(),
              updatedAt: getCurrentISOTime(),
            };
            presets.push(savedPreset);
          }

          await chrome.storage.local.set({
            [STORAGE_KEYS.PRESETS]: presets,
          });

          // 캐시 갱신
          cache.presets = presets;

          // 모든 탭에 STATE_UPDATED 전송
          await notifyAllTabs({ type: MESSAGE_TYPES.STATE_UPDATED });

          sendResponse({ success: true, data: savedPreset });
          break;
        }

        case MESSAGE_TYPES.DELETE_PRESET: {
          const presets = await getPresets();
          const filtered = presets.filter(p => p.id !== payload.id);

          await chrome.storage.local.set({
            [STORAGE_KEYS.PRESETS]: filtered,
          });

          // 캐시 갱신
          cache.presets = filtered;

          // 모든 탭에 STATE_UPDATED 전송
          await notifyAllTabs({ type: MESSAGE_TYPES.STATE_UPDATED });

          sendResponse({ success: true });
          break;
        }

        case MESSAGE_TYPES.TOGGLE_PRESET: {
          const presets = await getPresets();
          const preset = presets.find(p => p.id === payload.id);

          if (!preset) {
            sendResponse({ success: false, error: 'Preset not found' });
            break;
          }

          preset.enabled = !preset.enabled;
          preset.updatedAt = getCurrentISOTime();

          await chrome.storage.local.set({
            [STORAGE_KEYS.PRESETS]: presets,
          });

          // 캐시 갱신
          cache.presets = presets;

          // 모든 탭에 STATE_UPDATED 전송
          await notifyAllTabs({ type: MESSAGE_TYPES.STATE_UPDATED });

          sendResponse({ success: true, data: preset });
          break;
        }

        case MESSAGE_TYPES.GET_PRESETS: {
          const presets = await getPresets();
          sendResponse({ success: true, data: presets });
          break;
        }

        // Apply Rules
        case MESSAGE_TYPES.APPLY_RULES: {
          // 모든 탭에 APPLY_RULES 전달
          await notifyAllTabs({ type: MESSAGE_TYPES.APPLY_RULES });
          sendResponse({ success: true });
          break;
        }

        case MESSAGE_TYPES.GET_CURRENT_STATE: {
          const blockElements = await getBlockElements();
          const presets = await getPresets();
          const result = await chrome.storage.local.get([STORAGE_KEYS.SETTINGS]);
          const settings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;

          sendResponse({
            success: true,
            data: { blockElements, presets, settings },
          });
          break;
        }

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  })();

  // 비동기 응답을 위해 true 반환
  return true;
});

// =============================================================================
// Storage 동기화
// =============================================================================

/**
 * Storage 변경 감지 및 캐시 무효화
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    let shouldNotify = false;

    if (changes[STORAGE_KEYS.BLOCK_ELEMENTS]) {
      cache.blockElements = null;
      shouldNotify = true;
    }

    if (changes[STORAGE_KEYS.PRESETS]) {
      cache.presets = null;
      shouldNotify = true;
    }

    if (changes[STORAGE_KEYS.SETTINGS]) {
      cache.settings = null;
      shouldNotify = true;
    }

    // Storage 변경 시 모든 탭에 STATE_UPDATED 전송
    if (shouldNotify) {
      notifyAllTabs({ type: MESSAGE_TYPES.STATE_UPDATED });
    }
  }
});

/**
 * 모든 활성 탭에 메시지 전송
 * @param {Object} message - 전송할 메시지
 */
async function notifyAllTabs(message) {
  try {
    const tabs = await chrome.tabs.query({});

    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, message);
        } catch (error) {
          // 탭이 메시지를 받을 수 없는 상태일 수 있음 (예: chrome:// 페이지)
        }
      }
    }
  } catch (error) {
    // Failed to notify tabs
  }
}

// =============================================================================
// Helper 함수
// =============================================================================

/**
 * 캐시 무효화
 */
function invalidateCache() {
  // TODO: 모든 캐시 null로 초기화
  cache.blockElements = null;
  cache.presets = null;
  cache.settings = null;
}

/**
 * Block Element 가져오기 (캐싱)
 * @returns {Promise<Array>} Block Element 배열
 */
async function getBlockElements() {
  if (cache.blockElements === null) {
    const result = await chrome.storage.local.get([STORAGE_KEYS.BLOCK_ELEMENTS]);
    cache.blockElements = result[STORAGE_KEYS.BLOCK_ELEMENTS] || [];
  }
  return cache.blockElements;
}

/**
 * Preset 가져오기 (캐싱)
 * @returns {Promise<Array>} Preset 배열
 */
async function getPresets() {
  if (cache.presets === null) {
    const result = await chrome.storage.local.get([STORAGE_KEYS.PRESETS]);
    cache.presets = result[STORAGE_KEYS.PRESETS] || [];
  }
  return cache.presets;
}

// =============================================================================
// 초기화
// =============================================================================

/**
 * Service Worker 설치 시
 */
chrome.runtime.onInstalled.addListener(async () => {
  // 기본 설정 초기화
  const result = await chrome.storage.local.get([STORAGE_KEYS.SETTINGS]);
  if (!result[STORAGE_KEYS.SETTINGS]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS,
    });
  }

  // Block Elements와 Presets가 없으면 빈 배열로 초기화
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.BLOCK_ELEMENTS,
    STORAGE_KEYS.PRESETS,
  ]);

  if (!data[STORAGE_KEYS.BLOCK_ELEMENTS]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.BLOCK_ELEMENTS]: [],
    });
  }

  if (!data[STORAGE_KEYS.PRESETS]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.PRESETS]: [],
    });
  }
});

/**
 * Service Worker 시작 시
 */
// Background service worker started
