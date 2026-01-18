/**
 * Storage 래퍼
 *
 * chrome.storage.local 래퍼로 캐싱 및 타입 안전성 제공
 */

// =============================================================================
// Extension Context 감지
// =============================================================================

let extensionContextInvalidated = false;

/**
 * Extension context가 유효한지 확인
 * @returns {boolean} Context 유효 여부
 */
function isExtensionContextValid() {
  if (extensionContextInvalidated) return false;

  try {
    // chrome.runtime.id가 접근 가능하면 context가 유효함
    return chrome.runtime && chrome.runtime.id !== undefined;
  } catch (error) {
    extensionContextInvalidated = true;
    return false;
  }
}

// =============================================================================
// Block Elements
// =============================================================================

/**
 * Block Element 목록 조회
 * @returns {Promise<Array>} Block Element 배열
 */
async function getBlockElements() {
  // Extension context 체크
  if (!isExtensionContextValid()) {
    return [];
  }

  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.BLOCK_ELEMENTS]);
    return result[STORAGE_KEYS.BLOCK_ELEMENTS] || [];
  } catch (error) {
    // Extension context invalidated 에러는 조용히 처리
    if (error.message?.includes('Extension context invalidated')) {
      extensionContextInvalidated = true;
      return [];
    }
    return [];
  }
}

/**
 * Block Element 저장
 * @param {Object} element - Block Element 객체
 * @returns {Promise<Object>} 저장된 Block Element
 */
async function saveBlockElement(element) {
  // Validation
  if (!element.name) {
    throw new Error('Element name is required');
  }

  if (!element.selectors || !Array.isArray(element.selectors)) {
    throw new Error('Selectors must be an array');
  }

  if (element.selectors.length === 0) {
    throw new Error('At least one selector is required');
  }

  if (!element.urlPattern) {
    throw new Error('URL pattern is required');
  }

  if (!element.urlPatternType) {
    throw new Error('URL pattern type is required');
  }

  // Validate URL pattern type
  const validTypes = [
    URL_PATTERN_TYPES.SITE_WIDE,
    URL_PATTERN_TYPES.PATH_PATTERN,
    URL_PATTERN_TYPES.EXACT_PAGE,
    'site_wide',
    'path_pattern',
    'exact_page',
  ];
  if (!validTypes.includes(element.urlPatternType)) {
    throw new Error('Invalid URL pattern type');
  }

  // Validate selectors for dangerous patterns
  for (const selector of element.selectors) {
    safeSelector(selector);
  }

  // Sanitize name and limit length
  const sanitizedName = sanitizeName(element.name);

  // Get existing elements
  const elements = await getBlockElements();

  let savedElement;
  if (element.id) {
    // Update existing
    const existingIndex = elements.findIndex((e) => e.id === element.id);
    if (existingIndex >= 0) {
      // Preserve createdAt, update everything else
      const { createdAt } = elements[existingIndex];
      savedElement = {
        ...element,
        name: sanitizedName,
        createdAt,
        updatedAt: getCurrentISOTime(),
      };
      elements[existingIndex] = savedElement;
    } else {
      // ID provided but not found - treat as new
      savedElement = {
        ...element,
        name: sanitizedName,
        id: generateId('be'),
        createdAt: getCurrentISOTime(),
        updatedAt: getCurrentISOTime(),
      };
      elements.push(savedElement);
    }
  } else {
    // Create new
    savedElement = {
      ...element,
      name: sanitizedName,
      id: generateId('be'),
      createdAt: getCurrentISOTime(),
      updatedAt: getCurrentISOTime(),
    };
    elements.push(savedElement);
  }

  // Save to storage
  await chrome.storage.local.set({
    [STORAGE_KEYS.BLOCK_ELEMENTS]: elements,
  });

  return savedElement;
}

/**
 * Block Element 삭제
 * @param {string} elementId - Block Element ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
async function deleteBlockElement(elementId) {
  try {
    const elements = await getBlockElements();
    const originalLength = elements.length;
    const filtered = elements.filter((e) => e.id !== elementId);

    if (filtered.length === originalLength) {
      // Element not found
      return false;
    }

    await chrome.storage.local.set({
      [STORAGE_KEYS.BLOCK_ELEMENTS]: filtered,
    });

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Block Element 조회 (ID)
 * @param {string} elementId - Block Element ID
 * @returns {Promise<Object|null>} Block Element 또는 null
 */
async function getBlockElementById(elementId) {
  try {
    const elements = await getBlockElements();
    const element = elements.find((e) => e.id === elementId);
    return element || null;
  } catch (error) {
    return null;
  }
}

// =============================================================================
// Presets
// =============================================================================

/**
 * Preset 목록 조회
 * @returns {Promise<Array>} Preset 배열
 */
async function getPresets() {
  // Extension context 체크
  if (!isExtensionContextValid()) {
    return [];
  }

  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.PRESETS]);
    const presets = result[STORAGE_KEYS.PRESETS] || [];
    // Sort by createdAt descending (newest first)
    return presets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    // Extension context invalidated 에러는 조용히 처리
    if (error.message?.includes('Extension context invalidated')) {
      extensionContextInvalidated = true;
      return [];
    }
    return [];
  }
}

/**
 * Preset 저장
 * @param {Object} preset - Preset 객체
 * @returns {Promise<Object>} 저장된 Preset
 */
async function savePreset(preset) {
  // Validation
  if (!preset.name || preset.name.trim() === '') {
    throw new Error('Preset name cannot be empty');
  }

  if (preset.name.length > 30) {
    throw new Error('Preset name must be 30 characters or less');
  }

  if (!preset.blockElementIds || !Array.isArray(preset.blockElementIds)) {
    throw new Error('blockElementIds must be an array');
  }

  if (preset.blockElementIds.length === 0) {
    throw new Error('Preset must contain at least one Block Element');
  }

  // Verify that all Block Elements exist
  const elements = await getBlockElements();
  const elementIds = elements.map((e) => e.id);
  const invalidIds = preset.blockElementIds.filter((id) => !elementIds.includes(id));

  if (invalidIds.length > 0) {
    throw new Error('Some Block Elements do not exist');
  }

  // Get existing presets
  const presets = await getPresets();

  let savedPreset;
  if (preset.id) {
    // Update existing
    const existingIndex = presets.findIndex((p) => p.id === preset.id);
    if (existingIndex >= 0) {
      // Preserve createdAt, update everything else
      const { createdAt } = presets[existingIndex];
      savedPreset = {
        ...preset,
        createdAt,
        updatedAt: getCurrentISOTime(),
      };
      presets[existingIndex] = savedPreset;
    } else {
      // ID provided but not found - treat as new
      savedPreset = {
        ...preset,
        id: generateId('preset'),
        enabled: preset.enabled !== undefined ? preset.enabled : false,
        createdAt: getCurrentISOTime(),
        updatedAt: getCurrentISOTime(),
      };
      presets.push(savedPreset);
    }
  } else {
    // Create new
    savedPreset = {
      ...preset,
      id: generateId('preset'),
      enabled: preset.enabled !== undefined ? preset.enabled : false,
      createdAt: getCurrentISOTime(),
      updatedAt: getCurrentISOTime(),
    };
    presets.push(savedPreset);
  }

  // Save to storage
  await chrome.storage.local.set({
    [STORAGE_KEYS.PRESETS]: presets,
  });

  return savedPreset;
}

/**
 * Preset 삭제
 * @param {string} presetId - Preset ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
async function deletePreset(presetId) {
  try {
    const presets = await getPresets();
    const preset = presets.find((p) => p.id === presetId);

    if (!preset) {
      throw new Error('Preset not found');
    }

    const filtered = presets.filter((p) => p.id !== presetId);

    await chrome.storage.local.set({
      [STORAGE_KEYS.PRESETS]: filtered,
    });

    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Preset 토글
 * @param {string} presetId - Preset ID
 * @param {boolean} enabled - 활성화 여부
 * @returns {Promise<Object|null>} 업데이트된 Preset 또는 null
 */
async function togglePreset(presetId, enabled) {
  try {
    const presets = await getPresets();
    const preset = presets.find((p) => p.id === presetId);

    if (!preset) {
      throw new Error('Preset not found');
    }

    preset.enabled = enabled;
    preset.updatedAt = getCurrentISOTime();

    await chrome.storage.local.set({
      [STORAGE_KEYS.PRESETS]: presets,
    });

    return preset;
  } catch (error) {
    throw error;
  }
}

/**
 * Preset 조회 (ID)
 * @param {string} presetId - Preset ID
 * @returns {Promise<Object|null>} Preset 또는 null
 */
async function getPresetById(presetId) {
  try {
    const presets = await getPresets();
    const preset = presets.find((p) => p.id === presetId);
    return preset || null;
  } catch (error) {
    return null;
  }
}

// =============================================================================
// Settings
// =============================================================================

/**
 * Settings 조회
 * @returns {Promise<Object>} Settings 객체
 */
async function getSettings() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.SETTINGS]);
    return result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Settings 저장
 * @param {Object} settings - Settings 객체
 * @returns {Promise<Object>} 저장된 Settings
 */
async function saveSettings(settings) {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS]: settings,
    });
    return settings;
  } catch (error) {
    throw error;
  }
}

// =============================================================================
// 활성 Block Elements 계산
// =============================================================================

/**
 * 현재 URL에 해당하는 활성 Block Element 가져오기
 * @param {string} currentUrl - 현재 URL
 * @returns {Promise<Array>} 활성 Block Element 배열
 */
async function getActiveBlockElements(currentUrl) {
  try {
    const blockElements = await getBlockElements();
    const presets = await getPresets();

    // Collect enabled preset's Block Element IDs
    const activeIds = new Set();
    presets
      .filter((preset) => preset.enabled)
      .forEach((preset) => {
        preset.blockElementIds.forEach((id) => activeIds.add(id));
      });

    // Filter Block Elements that are active and match current URL
    const activeElements = blockElements.filter(
      (element) =>
        activeIds.has(element.id) &&
        matchUrlPattern(currentUrl, element.urlPattern, element.urlPatternType)
    );

    return activeElements;
  } catch (error) {
    return [];
  }
}

// =============================================================================
// Temp Selected (Element Picker 임시 데이터)
// =============================================================================

/**
 * 임시 선택 데이터 저장
 * @param {Object} data - 선택된 요소 데이터
 * @returns {Promise<Object>} 저장된 데이터
 */
async function saveTempSelected(data) {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.TEMP_SELECTED]: data,
    });
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * 임시 선택 데이터 조회
 * @returns {Promise<Object|null>} 임시 선택 데이터 또는 null
 */
async function getTempSelected() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.TEMP_SELECTED]);
    return result[STORAGE_KEYS.TEMP_SELECTED] || null;
  } catch (error) {
    return null;
  }
}

/**
 * 임시 선택 데이터 삭제
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
async function clearTempSelected() {
  try {
    await chrome.storage.local.remove([STORAGE_KEYS.TEMP_SELECTED]);
    return true;
  } catch (error) {
    return false;
  }
}
