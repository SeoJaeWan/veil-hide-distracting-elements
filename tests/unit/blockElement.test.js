/**
 * Unit Tests for Block Element 기능
 *
 * 테스트 대상:
 * 1. Element 선택 후 저장 모달에서 이름 입력, URL 패턴 선택
 * 2. Block Element 목록 표시 및 삭제
 * 3. Block Element가 현재 URL과 매칭되는지 확인
 *
 * TDD Red Phase: 이 테스트들은 현재 실패해야 합니다.
 */

// =============================================================================
// Test Helper Functions
// =============================================================================

/**
 * Chrome Storage Mock 초기화
 */
function setupStorageMock() {
  const storage = {};

  global.chrome.storage.local.get.mockImplementation((keys, callback) => {
    const result = {};
    const keyArray = Array.isArray(keys) ? keys : [keys];

    keyArray.forEach((key) => {
      if (storage[key] !== undefined) {
        result[key] = storage[key];
      }
    });

    if (callback) {
      callback(result);
      return undefined;
    } else {
      return Promise.resolve(result);
    }
  });

  global.chrome.storage.local.set.mockImplementation((data, callback) => {
    Object.assign(storage, data);

    if (callback) {
      callback();
      return undefined;
    } else {
      return Promise.resolve();
    }
  });

  return storage;
}

/**
 * 테스트용 Block Element 생성
 */
function createMockBlockElement(overrides = {}) {
  return {
    id: generateId('be'),
    name: 'Test Block Element',
    selectors: ['#test-selector'],
    urlPattern: 'example.com',
    urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    createdAt: getCurrentISOTime(),
    updatedAt: getCurrentISOTime(),
    ...overrides,
  };
}

/**
 * 테스트 후 Mock 정리
 */
function cleanupMocks() {
  jest.clearAllMocks();
}

// =============================================================================
// Block Element 저장 및 조회 Tests
// =============================================================================

describe('getBlockElements', () => {
  let storage;

  beforeEach(() => {
    storage = setupStorageMock();
  });

  afterEach(() => {
    cleanupMocks();
  });

  test('Storage가 비어있으면 빈 배열을 반환한다', async () => {
    const result = await getBlockElements();

    expect(result).toEqual([]);
    expect(chrome.storage.local.get).toHaveBeenCalledWith([
      STORAGE_KEYS.BLOCK_ELEMENTS,
    ]);
  });

  test('Storage에 저장된 Block Elements를 반환한다', async () => {
    const mockElements = [
      createMockBlockElement({ id: 'be_1', name: 'Element 1' }),
      createMockBlockElement({ id: 'be_2', name: 'Element 2' }),
    ];

    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = mockElements;

    const result = await getBlockElements();

    expect(result).toEqual(mockElements);
    expect(result).toHaveLength(2);
  });

  test('Storage 읽기 실패 시 빈 배열을 반환한다', async () => {
    chrome.storage.local.get.mockRejectedValue(new Error('Storage error'));

    const result = await getBlockElements();

    expect(result).toEqual([]);
  });
});

describe('saveBlockElement', () => {
  let storage;

  beforeEach(() => {
    storage = setupStorageMock();
  });

  afterEach(() => {
    cleanupMocks();
  });

  test('새 Block Element를 저장한다', async () => {
    const newElement = {
      name: 'YouTube Shorts',
      selectors: ['#shorts-container'],
      urlPattern: 'youtube.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    };

    const result = await saveBlockElement(newElement);

    expect(result.id).toMatch(/^be_\d+_[a-z0-9]+$/);
    expect(result.name).toBe('YouTube Shorts');
    expect(result.selectors).toEqual(['#shorts-container']);
    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      [STORAGE_KEYS.BLOCK_ELEMENTS]: [result],
    });
  });

  test('기존 Block Element를 업데이트한다', async () => {
    const existingElement = createMockBlockElement({
      id: 'be_123',
      name: 'Old Name',
    });

    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [existingElement];

    const updatedElement = {
      id: 'be_123',
      name: 'New Name',
      selectors: ['#new-selector'],
      urlPattern: 'example.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    };

    const result = await saveBlockElement(updatedElement);

    expect(result.id).toBe('be_123');
    expect(result.name).toBe('New Name');
    expect(result.selectors).toEqual(['#new-selector']);
    expect(result.updatedAt).not.toBe(existingElement.updatedAt);
  });

  test('여러 Block Elements를 저장할 수 있다', async () => {
    const element1 = { name: 'Element 1', selectors: ['#el1'], urlPattern: 'example.com', urlPatternType: URL_PATTERN_TYPES.SITE_WIDE };
    const element2 = { name: 'Element 2', selectors: ['#el2'], urlPattern: 'test.com', urlPatternType: URL_PATTERN_TYPES.SITE_WIDE };

    await saveBlockElement(element1);
    await saveBlockElement(element2);

    const savedElements = storage[STORAGE_KEYS.BLOCK_ELEMENTS];

    expect(savedElements).toHaveLength(2);
    expect(savedElements[0].name).toBe('Element 1');
    expect(savedElements[1].name).toBe('Element 2');
  });

  test('이름이 50자를 초과하면 잘라낸다', async () => {
    const longName = 'a'.repeat(100);
    const element = {
      name: longName,
      selectors: ['#test'],
      urlPattern: 'example.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    };

    const result = await saveBlockElement(element);

    expect(result.name.length).toBe(50);
  });

  test('HTML 태그가 포함된 이름을 sanitize한다', async () => {
    const element = {
      name: '<script>alert("xss")</script>Test',
      selectors: ['#test'],
      urlPattern: 'example.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    };

    const result = await saveBlockElement(element);

    expect(result.name).not.toContain('<');
    expect(result.name).not.toContain('>');
    expect(result.name).toContain('Test');
  });
});

describe('deleteBlockElement', () => {
  let storage;

  beforeEach(() => {
    storage = setupStorageMock();
  });

  afterEach(() => {
    cleanupMocks();
  });

  test('Block Element를 삭제한다', async () => {
    const element1 = createMockBlockElement({ id: 'be_1', name: 'Element 1' });
    const element2 = createMockBlockElement({ id: 'be_2', name: 'Element 2' });

    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [element1, element2];

    const result = await deleteBlockElement('be_1');

    expect(result).toBe(true);

    const remainingElements = storage[STORAGE_KEYS.BLOCK_ELEMENTS];
    expect(remainingElements).toHaveLength(1);
    expect(remainingElements[0].id).toBe('be_2');
  });

  test('존재하지 않는 ID를 삭제하려고 하면 false를 반환한다', async () => {
    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [
      createMockBlockElement({ id: 'be_1' }),
    ];

    const result = await deleteBlockElement('be_nonexistent');

    expect(result).toBe(false);
  });

  test('빈 목록에서 삭제하려고 하면 false를 반환한다', async () => {
    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [];

    const result = await deleteBlockElement('be_1');

    expect(result).toBe(false);
  });
});

describe('getBlockElementById', () => {
  let storage;

  beforeEach(() => {
    storage = setupStorageMock();
  });

  afterEach(() => {
    cleanupMocks();
  });

  test('ID로 Block Element를 조회한다', async () => {
    const element1 = createMockBlockElement({ id: 'be_1', name: 'Element 1' });
    const element2 = createMockBlockElement({ id: 'be_2', name: 'Element 2' });

    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [element1, element2];

    const result = await getBlockElementById('be_2');

    expect(result).toEqual(element2);
    expect(result.name).toBe('Element 2');
  });

  test('존재하지 않는 ID는 null을 반환한다', async () => {
    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [
      createMockBlockElement({ id: 'be_1' }),
    ];

    const result = await getBlockElementById('be_nonexistent');

    expect(result).toBeNull();
  });
});

// =============================================================================
// Block Element 목록 표시 Tests
// =============================================================================

describe('Block Element 목록', () => {
  let storage;

  beforeEach(() => {
    storage = setupStorageMock();
  });

  afterEach(() => {
    cleanupMocks();
  });

  test('모든 Block Elements를 createdAt 기준 내림차순으로 정렬한다', async () => {
    const element1 = createMockBlockElement({
      id: 'be_1',
      createdAt: '2025-01-01T00:00:00.000Z',
    });
    const element2 = createMockBlockElement({
      id: 'be_2',
      createdAt: '2025-01-03T00:00:00.000Z',
    });
    const element3 = createMockBlockElement({
      id: 'be_3',
      createdAt: '2025-01-02T00:00:00.000Z',
    });

    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [element1, element2, element3];

    const result = await getBlockElements();
    const sorted = result.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    expect(sorted[0].id).toBe('be_2'); // 2025-01-03
    expect(sorted[1].id).toBe('be_3'); // 2025-01-02
    expect(sorted[2].id).toBe('be_1'); // 2025-01-01
  });

  test('Block Element의 모든 정보를 포함한다', async () => {
    const element = createMockBlockElement({
      name: 'Test Element',
      selectors: ['#selector1', '.selector2'],
      urlPattern: 'example.com/path/*',
      urlPatternType: URL_PATTERN_TYPES.PATH_PATTERN,
    });

    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [element];

    const result = await getBlockElements();

    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('selectors');
    expect(result[0]).toHaveProperty('urlPattern');
    expect(result[0]).toHaveProperty('urlPatternType');
    expect(result[0]).toHaveProperty('createdAt');
    expect(result[0]).toHaveProperty('updatedAt');
  });
});

// =============================================================================
// URL 패턴 타입 Tests
// =============================================================================

describe('URL 패턴 타입 저장', () => {
  let storage;

  beforeEach(() => {
    storage = setupStorageMock();
  });

  afterEach(() => {
    cleanupMocks();
  });

  test('site_wide 패턴으로 저장한다', async () => {
    const element = {
      name: 'Site Wide Block',
      selectors: ['#ad'],
      urlPattern: 'example.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    };

    const result = await saveBlockElement(element);

    expect(result.urlPatternType).toBe(URL_PATTERN_TYPES.SITE_WIDE);
  });

  test('path_pattern 패턴으로 저장한다', async () => {
    const element = {
      name: 'Path Pattern Block',
      selectors: ['#sidebar'],
      urlPattern: 'example.com/videos/*',
      urlPatternType: URL_PATTERN_TYPES.PATH_PATTERN,
    };

    const result = await saveBlockElement(element);

    expect(result.urlPatternType).toBe(URL_PATTERN_TYPES.PATH_PATTERN);
  });

  test('exact_page 패턴으로 저장한다', async () => {
    const element = {
      name: 'Exact Page Block',
      selectors: ['#banner'],
      urlPattern: 'https://example.com/specific-page',
      urlPatternType: URL_PATTERN_TYPES.EXACT_PAGE,
    };

    const result = await saveBlockElement(element);

    expect(result.urlPatternType).toBe(URL_PATTERN_TYPES.EXACT_PAGE);
  });

  test('잘못된 패턴 타입은 에러를 발생시킨다', async () => {
    const element = {
      name: 'Invalid Pattern',
      selectors: ['#test'],
      urlPattern: 'example.com',
      urlPatternType: 'invalid_type',
    };

    await expect(saveBlockElement(element)).rejects.toThrow(
      'Invalid URL pattern type'
    );
  });
});

// =============================================================================
// 활성 Block Elements 계산 Tests
// =============================================================================

describe('getActiveBlockElements', () => {
  let storage;

  beforeEach(() => {
    storage = setupStorageMock();
  });

  afterEach(() => {
    cleanupMocks();
  });

  test('활성화된 Preset에 포함된 Block Element만 반환한다', async () => {
    const element1 = createMockBlockElement({ id: 'be_1' });
    const element2 = createMockBlockElement({ id: 'be_2' });
    const element3 = createMockBlockElement({ id: 'be_3' });

    const preset1 = {
      id: 'preset_1',
      name: 'Study Mode',
      blockElementIds: ['be_1', 'be_2'],
      enabled: true,
    };

    const preset2 = {
      id: 'preset_2',
      name: 'Work Mode',
      blockElementIds: ['be_3'],
      enabled: false, // 비활성화
    };

    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [element1, element2, element3];
    storage[STORAGE_KEYS.PRESETS] = [preset1, preset2];

    const result = await getActiveBlockElements('https://example.com');

    expect(result).toHaveLength(2);
    expect(result.find((el) => el.id === 'be_1')).toBeDefined();
    expect(result.find((el) => el.id === 'be_2')).toBeDefined();
    expect(result.find((el) => el.id === 'be_3')).toBeUndefined();
  });

  test('현재 URL과 매칭되는 Block Element만 반환한다', async () => {
    const element1 = createMockBlockElement({
      id: 'be_1',
      urlPattern: 'example.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    });

    const element2 = createMockBlockElement({
      id: 'be_2',
      urlPattern: 'other.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    });

    const preset = {
      id: 'preset_1',
      blockElementIds: ['be_1', 'be_2'],
      enabled: true,
    };

    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [element1, element2];
    storage[STORAGE_KEYS.PRESETS] = [preset];

    const result = await getActiveBlockElements('https://example.com/page');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('be_1');
  });

  test('활성화된 Preset이 없으면 빈 배열을 반환한다', async () => {
    const element1 = createMockBlockElement({ id: 'be_1' });

    const preset = {
      id: 'preset_1',
      blockElementIds: ['be_1'],
      enabled: false,
    };

    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [element1];
    storage[STORAGE_KEYS.PRESETS] = [preset];

    const result = await getActiveBlockElements('https://example.com');

    expect(result).toEqual([]);
  });

  test('여러 Preset의 Block Element를 합쳐서 반환한다', async () => {
    const element1 = createMockBlockElement({ id: 'be_1' });
    const element2 = createMockBlockElement({ id: 'be_2' });
    const element3 = createMockBlockElement({ id: 'be_3' });

    const preset1 = {
      id: 'preset_1',
      blockElementIds: ['be_1', 'be_2'],
      enabled: true,
    };

    const preset2 = {
      id: 'preset_2',
      blockElementIds: ['be_2', 'be_3'], // be_2 중복
      enabled: true,
    };

    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [element1, element2, element3];
    storage[STORAGE_KEYS.PRESETS] = [preset1, preset2];

    const result = await getActiveBlockElements('https://example.com');

    expect(result).toHaveLength(3);
    // 중복 제거 확인
    const ids = result.map((el) => el.id);
    expect(new Set(ids).size).toBe(3);
  });
});

// =============================================================================
// Selector 배열 Tests
// =============================================================================

describe('Selector 배열 저장 및 사용', () => {
  let storage;

  beforeEach(() => {
    storage = setupStorageMock();
  });

  afterEach(() => {
    cleanupMocks();
  });

  test('여러 Selector를 배열로 저장한다', async () => {
    const element = {
      name: 'Multi Selector',
      selectors: ['#primary-selector', '.fallback-class', 'div > span'],
      urlPattern: 'example.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    };

    const result = await saveBlockElement(element);

    expect(result.selectors).toHaveLength(3);
    expect(result.selectors).toEqual([
      '#primary-selector',
      '.fallback-class',
      'div > span',
    ]);
  });

  test('Selector가 빈 배열이면 에러를 발생시킨다', async () => {
    const element = {
      name: 'No Selector',
      selectors: [],
      urlPattern: 'example.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    };

    await expect(saveBlockElement(element)).rejects.toThrow(
      'At least one selector is required'
    );
  });

  test('Selector가 문자열 배열이 아니면 에러를 발생시킨다', async () => {
    const element = {
      name: 'Invalid Selector',
      selectors: '#single-selector', // 문자열 (배열이 아님)
      urlPattern: 'example.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    };

    await expect(saveBlockElement(element)).rejects.toThrow(
      'Selectors must be an array'
    );
  });

  test('위험한 Selector 패턴을 거부한다', async () => {
    const element = {
      name: 'Dangerous Selector',
      selectors: ['javascript:alert(1)'],
      urlPattern: 'example.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    };

    await expect(saveBlockElement(element)).rejects.toThrow(
      'Invalid selector pattern'
    );
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('Edge Cases', () => {
  let storage;

  beforeEach(() => {
    storage = setupStorageMock();
  });

  afterEach(() => {
    cleanupMocks();
  });

  test('필수 필드가 누락되면 에러를 발생시킨다', async () => {
    const invalidElement = {
      name: 'Missing Fields',
      // selectors, urlPattern, urlPatternType 누락
    };

    await expect(saveBlockElement(invalidElement)).rejects.toThrow();
  });

  test('updatedAt이 createdAt보다 이후여야 한다', async () => {
    const element = createMockBlockElement({ id: 'be_1' });
    storage[STORAGE_KEYS.BLOCK_ELEMENTS] = [element];

    // 잠시 대기 후 업데이트
    await new Promise((resolve) => setTimeout(resolve, 10));

    const updated = await saveBlockElement({
      id: 'be_1',
      name: 'Updated Name',
      selectors: ['#test'],
      urlPattern: 'example.com',
      urlPatternType: URL_PATTERN_TYPES.SITE_WIDE,
    });

    expect(new Date(updated.updatedAt) >= new Date(updated.createdAt)).toBe(
      true
    );
  });
});
