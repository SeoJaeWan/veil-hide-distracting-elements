/**
 * Unit Tests for Preset Functionality
 *
 * Preset 기능 테스트
 * 테스트 코드 = 기능 명세서
 *
 * TDD Red Phase: 이 테스트들은 현재 실패해야 합니다.
 */

// =============================================================================
// Mock Setup
// =============================================================================

/**
 * chrome.storage.local API 모킹
 */
let mockStorage = {};

global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys) => {
        return Promise.resolve(
          keys.reduce((acc, key) => {
            acc[key] = mockStorage[key] || null;
            return acc;
          }, {})
        );
      }),
      set: jest.fn((data) => {
        Object.assign(mockStorage, data);
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        mockStorage = {};
        return Promise.resolve();
      }),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
  },
};

/**
 * 테스트 전 Storage 초기화
 */
function resetStorage() {
  mockStorage = {};
  chrome.storage.local.get.mockClear();
  chrome.storage.local.set.mockClear();
  chrome.runtime.sendMessage.mockClear();
}

/**
 * 테스트용 Block Element 생성
 */
function createBlockElement(overrides = {}) {
  return {
    id: `be_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: '테스트 Block Element',
    selectors: ['#test-element'],
    urlPattern: 'example.com',
    urlPatternType: 'site_wide',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * 테스트용 Preset 생성
 */
function createPreset(overrides = {}) {
  return {
    id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: '테스트 Preset',
    blockElementIds: [],
    enabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// =============================================================================
// Preset 생성 테스트
// =============================================================================

describe('Preset 생성', () => {
  beforeEach(() => {
    resetStorage();
  });

  test('이름과 Block Element 선택으로 Preset을 생성한다', async () => {
    const blockElement = createBlockElement({ name: '유튜브 쇼츠' });
    const preset = createPreset({
      name: '공부 모드',
      blockElementIds: [blockElement.id],
    });

    // Store에 Block Element 추가
    await chrome.storage.local.set({
      veil_block_elements: [blockElement],
    });

    // Preset 저장 함수 호출 (구현 필요)
    const saved = await savePreset(preset);

    expect(saved).toBeDefined();
    expect(saved.name).toBe('공부 모드');
    expect(saved.blockElementIds).toContain(blockElement.id);
    expect(saved.enabled).toBe(false); // 기본값은 비활성화
  });

  test('이름이 30자를 초과하면 에러를 발생시킨다', async () => {
    const longName = 'a'.repeat(31);
    const preset = createPreset({ name: longName });

    await expect(savePreset(preset)).rejects.toThrow(
      'Preset name must be 30 characters or less'
    );
  });

  test('비어있는 이름으로 생성하면 에러를 발생시킨다', async () => {
    const preset = createPreset({ name: '' });

    await expect(savePreset(preset)).rejects.toThrow(
      'Preset name cannot be empty'
    );
  });

  test('Block Element가 하나도 없으면 에러를 발생시킨다', async () => {
    const preset = createPreset({
      name: '빈 Preset',
      blockElementIds: [],
    });

    await expect(savePreset(preset)).rejects.toThrow(
      'Preset must contain at least one Block Element'
    );
  });

  test('생성 시 createdAt과 updatedAt이 자동으로 설정된다', async () => {
    const blockElement = createBlockElement();
    await chrome.storage.local.set({
      veil_block_elements: [blockElement],
    });

    const preset = createPreset({
      name: '새 Preset',
      blockElementIds: [blockElement.id],
    });

    const saved = await savePreset(preset);

    expect(saved.createdAt).toBeDefined();
    expect(saved.updatedAt).toBeDefined();
    expect(new Date(saved.createdAt)).toBeInstanceOf(Date);
    expect(new Date(saved.updatedAt)).toBeInstanceOf(Date);
  });

  test('존재하지 않는 Block Element ID를 포함하면 에러를 발생시킨다', async () => {
    const preset = createPreset({
      name: 'Invalid Preset',
      blockElementIds: ['be_nonexistent_id'],
    });

    await expect(savePreset(preset)).rejects.toThrow(
      'Some Block Elements do not exist'
    );
  });
});

// =============================================================================
// Preset 목록 표시 테스트
// =============================================================================

describe('Preset 목록 표시', () => {
  beforeEach(() => {
    resetStorage();
  });

  test('저장된 모든 Preset을 조회한다', async () => {
    const preset1 = createPreset({ name: 'Preset 1' });
    const preset2 = createPreset({ name: 'Preset 2' });

    await chrome.storage.local.set({
      veil_presets: [preset1, preset2],
    });

    const presets = await getPresets();

    expect(presets).toHaveLength(2);
    expect(presets[0].name).toBe('Preset 1');
    expect(presets[1].name).toBe('Preset 2');
  });

  test('Preset이 없으면 빈 배열을 반환한다', async () => {
    const presets = await getPresets();

    expect(presets).toEqual([]);
  });

  test('Preset은 생성일 기준 내림차순으로 정렬된다', async () => {
    const preset1 = createPreset({
      name: 'Old Preset',
      createdAt: '2025-01-01T00:00:00.000Z',
    });
    const preset2 = createPreset({
      name: 'New Preset',
      createdAt: '2025-01-15T00:00:00.000Z',
    });

    await chrome.storage.local.set({
      veil_presets: [preset1, preset2],
    });

    const presets = await getPresets();

    expect(presets[0].name).toBe('New Preset');
    expect(presets[1].name).toBe('Old Preset');
  });
});

// =============================================================================
// Preset 토글 (ON/OFF) 테스트
// =============================================================================

describe('Preset 토글', () => {
  beforeEach(() => {
    resetStorage();
  });

  test('비활성화된 Preset을 활성화한다', async () => {
    const preset = createPreset({
      name: 'Test Preset',
      enabled: false,
    });

    await chrome.storage.local.set({
      veil_presets: [preset],
    });

    const toggled = await togglePreset(preset.id, true);

    expect(toggled.enabled).toBe(true);
    expect(toggled.updatedAt).not.toBe(preset.updatedAt);
  });

  test('활성화된 Preset을 비활성화한다', async () => {
    const preset = createPreset({
      name: 'Test Preset',
      enabled: true,
    });

    await chrome.storage.local.set({
      veil_presets: [preset],
    });

    const toggled = await togglePreset(preset.id, false);

    expect(toggled.enabled).toBe(false);
  });

  test('토글 시 updatedAt이 갱신된다', async () => {
    const preset = createPreset({
      name: 'Test Preset',
      enabled: false,
      updatedAt: '2025-01-01T00:00:00.000Z',
    });

    await chrome.storage.local.set({
      veil_presets: [preset],
    });

    const toggled = await togglePreset(preset.id, true);

    expect(new Date(toggled.updatedAt).getTime()).toBeGreaterThan(
      new Date(preset.updatedAt).getTime()
    );
  });

  test('존재하지 않는 Preset ID로 토글하면 에러를 발생시킨다', async () => {
    await expect(togglePreset('preset_nonexistent_id', true)).rejects.toThrow(
      'Preset not found'
    );
  });

  test('여러 Preset을 동시에 활성화할 수 있다', async () => {
    const preset1 = createPreset({ name: 'Preset 1', enabled: false });
    const preset2 = createPreset({ name: 'Preset 2', enabled: false });

    await chrome.storage.local.set({
      veil_presets: [preset1, preset2],
    });

    await togglePreset(preset1.id, true);
    await togglePreset(preset2.id, true);

    const presets = await getPresets();

    expect(presets[0].enabled).toBe(true);
    expect(presets[1].enabled).toBe(true);
  });
});

// =============================================================================
// Preset 삭제 테스트
// =============================================================================

describe('Preset 삭제', () => {
  beforeEach(() => {
    resetStorage();
  });

  test('Preset을 삭제한다', async () => {
    const preset = createPreset({ name: 'To Delete' });

    await chrome.storage.local.set({
      veil_presets: [preset],
    });

    await deletePreset(preset.id);

    const presets = await getPresets();

    expect(presets).toHaveLength(0);
  });

  test('삭제 후 다른 Preset은 유지된다', async () => {
    const preset1 = createPreset({ name: 'Keep' });
    const preset2 = createPreset({ name: 'Delete' });

    await chrome.storage.local.set({
      veil_presets: [preset1, preset2],
    });

    await deletePreset(preset2.id);

    const presets = await getPresets();

    expect(presets).toHaveLength(1);
    expect(presets[0].name).toBe('Keep');
  });

  test('존재하지 않는 Preset ID로 삭제하면 에러를 발생시킨다', async () => {
    await expect(deletePreset('preset_nonexistent_id')).rejects.toThrow(
      'Preset not found'
    );
  });

  test('활성화된 Preset을 삭제할 수 있다', async () => {
    const preset = createPreset({
      name: 'Active Preset',
      enabled: true,
    });

    await chrome.storage.local.set({
      veil_presets: [preset],
    });

    await deletePreset(preset.id);

    const presets = await getPresets();

    expect(presets).toHaveLength(0);
  });
});

// =============================================================================
// 여러 Preset 동시 활성화 시 중복 Block Element 처리 테스트
// =============================================================================

describe('여러 Preset 동시 활성화 시 중복 Block Element 처리', () => {
  beforeEach(() => {
    resetStorage();
  });

  test('여러 Preset이 같은 Block Element를 포함할 수 있다', async () => {
    const blockElement = createBlockElement({ name: '공통 요소' });
    const preset1 = createPreset({
      name: 'Preset 1',
      blockElementIds: [blockElement.id],
      enabled: true,
    });
    const preset2 = createPreset({
      name: 'Preset 2',
      blockElementIds: [blockElement.id],
      enabled: true,
    });

    await chrome.storage.local.set({
      veil_block_elements: [blockElement],
      veil_presets: [preset1, preset2],
    });

    const activeElements = await getActiveBlockElements('https://example.com');

    // 중복 제거되어 한 번만 적용되어야 함
    expect(activeElements).toHaveLength(1);
    expect(activeElements[0].id).toBe(blockElement.id);
  });

  test('활성화된 여러 Preset의 모든 Block Element를 수집한다', async () => {
    const blockElement1 = createBlockElement({ name: '요소 1' });
    const blockElement2 = createBlockElement({ name: '요소 2' });
    const blockElement3 = createBlockElement({ name: '요소 3' });

    const preset1 = createPreset({
      name: 'Preset 1',
      blockElementIds: [blockElement1.id, blockElement2.id],
      enabled: true,
    });
    const preset2 = createPreset({
      name: 'Preset 2',
      blockElementIds: [blockElement2.id, blockElement3.id],
      enabled: true,
    });

    await chrome.storage.local.set({
      veil_block_elements: [blockElement1, blockElement2, blockElement3],
      veil_presets: [preset1, preset2],
    });

    const activeElements = await getActiveBlockElements('https://example.com');

    // blockElement1, blockElement2, blockElement3 모두 포함 (중복 제거)
    expect(activeElements).toHaveLength(3);
    expect(activeElements.map((el) => el.id)).toContain(blockElement1.id);
    expect(activeElements.map((el) => el.id)).toContain(blockElement2.id);
    expect(activeElements.map((el) => el.id)).toContain(blockElement3.id);
  });

  test('비활성화된 Preset의 Block Element는 적용되지 않는다', async () => {
    const blockElement1 = createBlockElement({ name: '활성 요소' });
    const blockElement2 = createBlockElement({ name: '비활성 요소' });

    const activePreset = createPreset({
      name: 'Active',
      blockElementIds: [blockElement1.id],
      enabled: true,
    });
    const inactivePreset = createPreset({
      name: 'Inactive',
      blockElementIds: [blockElement2.id],
      enabled: false,
    });

    await chrome.storage.local.set({
      veil_block_elements: [blockElement1, blockElement2],
      veil_presets: [activePreset, inactivePreset],
    });

    const activeElements = await getActiveBlockElements('https://example.com');

    expect(activeElements).toHaveLength(1);
    expect(activeElements[0].id).toBe(blockElement1.id);
  });

  test('URL 패턴에 매칭되지 않는 Block Element는 제외된다', async () => {
    const matchingElement = createBlockElement({
      name: '매칭 요소',
      urlPattern: 'example.com',
      urlPatternType: 'site_wide',
    });
    const nonMatchingElement = createBlockElement({
      name: '비매칭 요소',
      urlPattern: 'other.com',
      urlPatternType: 'site_wide',
    });

    const preset = createPreset({
      name: 'Test Preset',
      blockElementIds: [matchingElement.id, nonMatchingElement.id],
      enabled: true,
    });

    await chrome.storage.local.set({
      veil_block_elements: [matchingElement, nonMatchingElement],
      veil_presets: [preset],
    });

    const activeElements = await getActiveBlockElements('https://example.com');

    expect(activeElements).toHaveLength(1);
    expect(activeElements[0].id).toBe(matchingElement.id);
  });

  test('같은 Block Element를 참조하는 Preset이 모두 비활성화되면 적용되지 않는다', async () => {
    const blockElement = createBlockElement({ name: '공통 요소' });
    const preset1 = createPreset({
      name: 'Preset 1',
      blockElementIds: [blockElement.id],
      enabled: false,
    });
    const preset2 = createPreset({
      name: 'Preset 2',
      blockElementIds: [blockElement.id],
      enabled: false,
    });

    await chrome.storage.local.set({
      veil_block_elements: [blockElement],
      veil_presets: [preset1, preset2],
    });

    const activeElements = await getActiveBlockElements('https://example.com');

    expect(activeElements).toHaveLength(0);
  });
});

// =============================================================================
// Preset 수정 테스트
// =============================================================================

describe('Preset 수정', () => {
  beforeEach(() => {
    resetStorage();
  });

  test('Preset 이름을 수정한다', async () => {
    const preset = createPreset({ name: '원래 이름' });

    await chrome.storage.local.set({
      veil_presets: [preset],
    });

    const updated = await savePreset({
      ...preset,
      name: '새 이름',
    });

    expect(updated.name).toBe('새 이름');
    expect(updated.updatedAt).not.toBe(preset.updatedAt);
  });

  test('Preset에 포함된 Block Element를 추가한다', async () => {
    const blockElement1 = createBlockElement({ name: '요소 1' });
    const blockElement2 = createBlockElement({ name: '요소 2' });

    const preset = createPreset({
      name: 'Test Preset',
      blockElementIds: [blockElement1.id],
    });

    await chrome.storage.local.set({
      veil_block_elements: [blockElement1, blockElement2],
      veil_presets: [preset],
    });

    const updated = await savePreset({
      ...preset,
      blockElementIds: [blockElement1.id, blockElement2.id],
    });

    expect(updated.blockElementIds).toHaveLength(2);
    expect(updated.blockElementIds).toContain(blockElement2.id);
  });

  test('Preset에서 Block Element를 제거한다', async () => {
    const blockElement1 = createBlockElement({ name: '요소 1' });
    const blockElement2 = createBlockElement({ name: '요소 2' });

    const preset = createPreset({
      name: 'Test Preset',
      blockElementIds: [blockElement1.id, blockElement2.id],
    });

    await chrome.storage.local.set({
      veil_block_elements: [blockElement1, blockElement2],
      veil_presets: [preset],
    });

    const updated = await savePreset({
      ...preset,
      blockElementIds: [blockElement1.id],
    });

    expect(updated.blockElementIds).toHaveLength(1);
    expect(updated.blockElementIds).not.toContain(blockElement2.id);
  });

  test('모든 Block Element를 제거하면 에러를 발생시킨다', async () => {
    const blockElement = createBlockElement();
    const preset = createPreset({
      name: 'Test Preset',
      blockElementIds: [blockElement.id],
    });

    await chrome.storage.local.set({
      veil_block_elements: [blockElement],
      veil_presets: [preset],
    });

    await expect(
      savePreset({
        ...preset,
        blockElementIds: [],
      })
    ).rejects.toThrow('Preset must contain at least one Block Element');
  });
});

// =============================================================================
// Helper Functions (now implemented in tests/setup.js)
// =============================================================================
// All functions are now available globally from setup.js:
// - savePreset, getPresets, togglePreset, deletePreset
// - getActiveBlockElements
