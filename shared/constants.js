/**
 * 공유 상수 정의
 *
 * Popup, Content Script, Background에서 공통으로 사용하는 상수
 */

// =============================================================================
// 메시지 타입
// =============================================================================

/**
 * Chrome Extension 메시지 타입
 */
const MESSAGE_TYPES = {
  // Element Picker
  START_PICKER: 'START_PICKER',
  STOP_PICKER: 'STOP_PICKER',
  ELEMENT_SELECTED: 'ELEMENT_SELECTED',

  // Block Elements
  SAVE_BLOCK_ELEMENT: 'SAVE_BLOCK_ELEMENT',
  DELETE_BLOCK_ELEMENT: 'DELETE_BLOCK_ELEMENT',
  GET_BLOCK_ELEMENTS: 'GET_BLOCK_ELEMENTS',

  // Presets
  SAVE_PRESET: 'SAVE_PRESET',
  DELETE_PRESET: 'DELETE_PRESET',
  TOGGLE_PRESET: 'TOGGLE_PRESET',
  GET_PRESETS: 'GET_PRESETS',

  // Apply Rules
  APPLY_RULES: 'APPLY_RULES',
  GET_CURRENT_STATE: 'GET_CURRENT_STATE',

  // Sync
  STATE_UPDATED: 'STATE_UPDATED',
};

// =============================================================================
// Storage Keys
// =============================================================================

/**
 * chrome.storage.local 키
 */
const STORAGE_KEYS = {
  BLOCK_ELEMENTS: 'veil_block_elements',
  PRESETS: 'veil_presets',
  SETTINGS: 'veil_settings',
  TEMP_SELECTED: 'veil_temp_selected',
};

// =============================================================================
// URL 패턴 타입
// =============================================================================

/**
 * URL 패턴 매칭 타입
 */
const URL_PATTERN_TYPES = {
  SITE_WIDE: 'site_wide',         // 사이트 전체 (예: youtube.com)
  PATH_PATTERN: 'path_pattern',   // 특정 경로 (예: youtube.com/watch*)
  EXACT_PAGE: 'exact_page',       // 정확한 페이지
};

// =============================================================================
// 기본 설정
// =============================================================================

/**
 * 기본 Settings 값
 */
const DEFAULT_SETTINGS = {
  showPlaceholder: false,
  animateHide: true,
  theme: 'auto',
};

// =============================================================================
// 성능 관련 상수
// =============================================================================

/**
 * Debounce 지연 시간 (ms)
 */
const DEBOUNCE_DELAY = 150;

/**
 * Selector 캐시 만료 시간 (ms)
 */
const SELECTOR_CACHE_TTL = 30000;

/**
 * 최대 Selector 깊이
 */
const MAX_SELECTOR_DEPTH = 5;

/**
 * 최대 Selector 길이 (문자)
 */
const MAX_SELECTOR_LENGTH = 500;

// =============================================================================
// Preset 아이콘
// =============================================================================

/**
 * 프리셋 선택 가능한 아이콘 목록
 */
const PRESET_ICONS = [
  '📚', // 공부
  '💼', // 업무
  '🎮', // 게임/여가
  '🌙', // 야간
  '☀️', // 주간
  '🔕', // 조용히
  '✨', // 클린
  '🎯', // 집중
  '🏠', // 홈
  '🚀', // 생산성
  '💪', // 운동
  '🎨', // 창작
];
