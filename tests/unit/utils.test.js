/**
 * Unit Tests for shared/utils.js
 *
 * Element Picker - Selector Generation Tests
 * 테스트 코드 = 기능 명세서
 *
 * TDD Red Phase: 이 테스트들은 현재 실패해야 합니다.
 */

// =============================================================================
// Test Helper Functions
// =============================================================================

/**
 * 테스트용 DOM 요소 생성
 * @param {Object} attributes - 요소 속성 { id, className, 'data-*', 'aria-label' }
 * @param {string} tagName - 태그 이름 (기본: 'div')
 * @returns {HTMLElement} 생성된 요소
 */
function createElement(attributes = {}, tagName = 'div') {
  const element = document.createElement(tagName);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'id') {
      element.id = value;
    } else {
      element.setAttribute(key, value);
    }
  });

  // Append to body for querySelectorAll to work
  document.body.appendChild(element);

  return element;
}

/**
 * 중첩된 요소 생성 (경로 기반 셀렉터 테스트용)
 * @returns {HTMLElement} 가장 안쪽 요소
 */
function createNestedElement() {
  const container = document.createElement('div');
  container.className = 'container';

  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';

  const span = document.createElement('span');
  span.className = 'target';

  container.appendChild(wrapper);
  wrapper.appendChild(span);
  document.body.appendChild(container);

  return span;
}

/**
 * 매우 긴 ID를 가진 요소 생성 (최대 길이 테스트용)
 * @returns {HTMLElement} 긴 ID 요소
 */
function createElementWithLongId() {
  const longId = 'a'.repeat(600); // MAX_SELECTOR_LENGTH(500) 초과
  return createElement({ id: longId });
}

/**
 * 테스트 후 DOM 정리
 */
function cleanupDOM() {
  document.body.innerHTML = '';
}

// =============================================================================
// generateSelector() Tests
// =============================================================================

describe('generateSelector', () => {
  afterEach(() => {
    cleanupDOM();
  });

  // ---------------------------------------------------------------------------
  // Priority 1: ID
  // ---------------------------------------------------------------------------

  test('ID가 있는 요소는 #id 셀렉터를 반환한다', () => {
    const element = createElement({ id: 'unique-id' });
    expect(generateSelector(element)).toBe('#unique-id');
  });

  test('ID에 특수문자가 있으면 올바르게 이스케이프한다', () => {
    const element = createElement({ id: 'id:with:colons' });
    expect(generateSelector(element)).toBe('#id\\:with\\:colons');
  });

  // ---------------------------------------------------------------------------
  // Priority 2: Unique data attribute
  // ---------------------------------------------------------------------------

  test('고유한 data 속성이 있으면 data 속성 셀렉터를 반환한다', () => {
    const element = createElement({ 'data-testid': 'unique-test' });
    expect(generateSelector(element)).toBe('[data-testid="unique-test"]');
  });

  test('여러 data 속성 중 고유한 것을 선택한다', () => {
    createElement({ 'data-common': 'shared' }); // 다른 요소
    const element = createElement({
      'data-common': 'shared',
      'data-unique': 'only-me',
    });

    const selector = generateSelector(element);
    expect(selector).toBe('[data-unique="only-me"]');
  });

  test('50자를 초과하는 data 속성은 무시한다', () => {
    const longValue = 'a'.repeat(60);
    const element = createElement({
      'data-long': longValue,
      className: 'fallback-class',
    });

    // Should fallback to class selector
    const selector = generateSelector(element);
    expect(selector).not.toContain('data-long');
  });

  // ---------------------------------------------------------------------------
  // Priority 3: aria-label
  // ---------------------------------------------------------------------------

  test('고유한 aria-label이 있으면 aria-label 셀렉터를 반환한다', () => {
    const element = createElement({ 'aria-label': 'Close button' });
    expect(generateSelector(element)).toBe('[aria-label="Close button"]');
  });

  test('aria-label이 고유하지 않으면 다음 우선순위로 넘어간다', () => {
    createElement({ 'aria-label': 'Submit' }); // 첫 번째
    const element = createElement({
      'aria-label': 'Submit', // 중복
      className: 'unique-class',
    });

    const selector = generateSelector(element);
    expect(selector).toContain('.unique-class');
  });

  test('50자를 초과하는 aria-label은 무시한다', () => {
    const longLabel = 'a'.repeat(60);
    const element = createElement({
      'aria-label': longLabel,
      className: 'fallback-class',
    });

    const selector = generateSelector(element);
    expect(selector).not.toContain('aria-label');
  });

  // ---------------------------------------------------------------------------
  // Priority 4: Class combination
  // ---------------------------------------------------------------------------

  test('클래스 조합으로 고유성을 확보한다', () => {
    createElement({ className: 'btn primary' }); // 다른 요소
    const element = createElement({ className: 'btn primary active' });

    const selector = generateSelector(element);
    expect(selector).toMatch(/\.btn\.primary\.active/);
  });

  test('최대 3개 클래스까지만 조합한다', () => {
    const element = createElement({
      className: 'class1 class2 class3 class4 class5',
    });

    const selector = generateSelector(element);
    const classCount = (selector.match(/\./g) || []).length;
    expect(classCount).toBeLessThanOrEqual(3);
  });

  test('클래스가 고유하지 않으면 경로 기반 셀렉터로 fallback한다', () => {
    createElement({ className: 'common' });
    const element = createElement({ className: 'common' });

    const selector = generateSelector(element);
    expect(selector).toMatch(/>/); // Path selector contains '>'
  });

  // ---------------------------------------------------------------------------
  // Priority 5: Path selector
  // ---------------------------------------------------------------------------

  test('다른 방법이 없으면 경로 기반 셀렉터로 fallback한다', () => {
    const element = createNestedElement();
    const selector = generateSelector(element);

    expect(selector).toMatch(/div/);
    expect(selector).toMatch(/>/);
    expect(selector).toMatch(/span/);
  });

  test('경로 기반 셀렉터는 nth-of-type을 포함할 수 있다', () => {
    const parent = createElement({}, 'div');
    const sibling1 = document.createElement('span');
    const sibling2 = document.createElement('span'); // 2nd span
    parent.appendChild(sibling1);
    parent.appendChild(sibling2);

    const selector = generateSelector(sibling2);
    expect(selector).toMatch(/nth-of-type/);
  });

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------

  test('body나 html 요소는 에러를 발생시킨다', () => {
    expect(() => generateSelector(document.body)).toThrow(
      'Cannot select body or html element'
    );
    expect(() => generateSelector(document.documentElement)).toThrow(
      'Cannot select body or html element'
    );
  });

  test('셀렉터가 최대 길이(500자)를 초과하면 에러를 발생시킨다', () => {
    const element = createElementWithLongId();

    expect(() => generateSelector(element)).toThrow(
      /Selector exceeds max length/
    );
  });

  test('iframe 내부 요소는 선택할 수 없다', () => {
    // Create iframe
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    // Access iframe document (may not work in jsdom)
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (iframeDoc) {
      const iframeElement = iframeDoc.createElement('div');
      iframeDoc.body.appendChild(iframeElement);

      expect(() => generateSelector(iframeElement)).toThrow(
        /Cannot select elements inside iframes/
      );
    } else {
      // Skip test if iframe access is not available
      console.warn('Iframe test skipped: iframe document not accessible');
    }
  });

  test('null 또는 undefined 요소는 에러를 발생시킨다', () => {
    expect(() => generateSelector(null)).toThrow();
    expect(() => generateSelector(undefined)).toThrow();
  });
});

// =============================================================================
// generatePathSelector() Tests
// =============================================================================

describe('generatePathSelector', () => {
  afterEach(() => {
    cleanupDOM();
  });

  test('nth-of-type을 포함한 경로를 생성한다', () => {
    const parent = document.createElement('div');
    const child1 = document.createElement('span');
    const child2 = document.createElement('span');
    const child3 = document.createElement('span');

    parent.appendChild(child1);
    parent.appendChild(child2);
    parent.appendChild(child3);
    document.body.appendChild(parent);

    const path = generatePathSelector(child2);

    expect(path).toContain('span');
    expect(path).toContain('nth-of-type(2)');
  });

  test('최대 깊이(MAX_SELECTOR_DEPTH)를 초과하지 않는다', () => {
    // Create deeply nested structure
    let current = document.body;
    for (let i = 0; i < 10; i++) {
      const child = document.createElement('div');
      child.className = `level-${i}`;
      current.appendChild(child);
      current = child;
    }

    const path = generatePathSelector(current);
    const depth = (path.match(/>/g) || []).length + 1;

    // MAX_SELECTOR_DEPTH is 5 according to plan
    expect(depth).toBeLessThanOrEqual(5);
  });

  test('ID를 만나면 거기서 경로 생성을 중단한다', () => {
    const grandparent = createElement({ id: 'stop-here' });
    const parent = document.createElement('div');
    const child = document.createElement('span');

    grandparent.appendChild(parent);
    parent.appendChild(child);

    const path = generatePathSelector(child);

    expect(path).toContain('#stop-here');
    expect(path).not.toContain('body');
  });

  test('단일 자식인 경우 nth-of-type을 포함하지 않는다', () => {
    const parent = document.createElement('div');
    const onlyChild = document.createElement('span');
    parent.appendChild(onlyChild);
    document.body.appendChild(parent);

    const path = generatePathSelector(onlyChild);

    expect(path).toContain('span');
    expect(path).not.toContain('nth-of-type');
  });

  test('같은 태그명의 형제가 여러 개인 경우 nth-of-type을 사용한다', () => {
    const parent = document.createElement('div');
    const span1 = document.createElement('span');
    const span2 = document.createElement('span');
    const span3 = document.createElement('span');

    parent.appendChild(span1);
    parent.appendChild(span2);
    parent.appendChild(span3);
    document.body.appendChild(parent);

    const path = generatePathSelector(span3);

    expect(path).toMatch(/span:nth-of-type\(3\)/);
  });
});

// =============================================================================
// isVeilElement() Tests
// =============================================================================

describe('isVeilElement', () => {
  afterEach(() => {
    cleanupDOM();
  });

  test('veil- 접두사가 있는 ID를 가진 요소를 감지한다', () => {
    const element = createElement({ id: 'veil-banner' });
    expect(isVeilElement(element)).toBe(true);
  });

  test('veil- 접두사가 있는 클래스를 가진 요소를 감지한다', () => {
    const element = createElement({ className: 'veil-picker-highlight' });
    expect(isVeilElement(element)).toBe(true);
  });

  test('중첩된 veil 요소를 감지한다', () => {
    const parent = createElement({ id: 'veil-picker' });
    const child = document.createElement('div');
    parent.appendChild(child);

    expect(isVeilElement(child)).toBe(true);
  });

  test('veil- 접두사가 없는 일반 요소는 false를 반환한다', () => {
    const element = createElement({ id: 'normal-element', className: 'btn' });
    expect(isVeilElement(element)).toBe(false);
  });

  test('null 또는 undefined는 false를 반환한다', () => {
    expect(isVeilElement(null)).toBe(false);
    expect(isVeilElement(undefined)).toBe(false);
  });

  test('부모가 veil 요소가 아니면 자식도 veil 요소가 아니다', () => {
    const parent = createElement({ id: 'normal-parent' });
    const child = document.createElement('div');
    parent.appendChild(child);

    expect(isVeilElement(child)).toBe(false);
  });

  test('className이 문자열이 아닌 경우를 처리한다', () => {
    // SVG elements have className as SVGAnimatedString, not string
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svg);

    expect(isVeilElement(svg)).toBe(false);
  });
});

// =============================================================================
// Additional Utility Tests
// =============================================================================

describe('sanitizeName', () => {
  test('HTML 태그를 제거한다', () => {
    const input = '<script>alert("xss")</script>Test Name';
    const output = sanitizeName(input);

    expect(output).not.toContain('<');
    expect(output).not.toContain('>');
    expect(output).toContain('Test Name');
  });

  test('앞뒤 공백을 제거한다', () => {
    const input = '  Test Name  ';
    const output = sanitizeName(input);

    expect(output).toBe('Test Name');
  });

  test('최대 50자로 제한한다', () => {
    const input = 'a'.repeat(100);
    const output = sanitizeName(input);

    expect(output.length).toBe(50);
  });
});

describe('safeSelector', () => {
  test('javascript: URL을 거부한다', () => {
    expect(() => safeSelector('javascript:alert(1)')).toThrow(
      'Invalid selector pattern'
    );
  });

  test('expression() 패턴을 거부한다', () => {
    expect(() => safeSelector('expression(alert(1))')).toThrow(
      'Invalid selector pattern'
    );
  });

  test('<script 태그를 거부한다', () => {
    expect(() => safeSelector('<script>alert(1)</script>')).toThrow(
      'Invalid selector pattern'
    );
  });

  test('안전한 셀렉터는 그대로 반환한다', () => {
    const selector = '.btn.primary';
    expect(safeSelector(selector)).toBe(selector);
  });
});

describe('generateId', () => {
  test('prefix와 timestamp, random을 조합하여 ID를 생성한다', () => {
    const id = generateId('be');

    expect(id).toMatch(/^be_\d+_[a-z0-9]+$/);
  });

  test('prefix 없이 호출하면 기본 prefix "id"를 사용한다', () => {
    const id = generateId();

    expect(id).toMatch(/^id_\d+_[a-z0-9]+$/);
  });

  test('생성된 ID는 고유하다', () => {
    const id1 = generateId('test');
    const id2 = generateId('test');

    expect(id1).not.toBe(id2);
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  test('지연 시간 동안 함수 호출을 연기한다', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('연속 호출 시 마지막 호출만 실행한다', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    jest.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('인자를 올바르게 전달한다', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc('arg1', 'arg2');

    jest.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('getCurrentISOTime', () => {
  test('ISO 8601 형식의 날짜를 반환한다', () => {
    const isoTime = getCurrentISOTime();

    expect(isoTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  test('유효한 Date 객체로 파싱할 수 있다', () => {
    const isoTime = getCurrentISOTime();
    const date = new Date(isoTime);

    expect(date).toBeInstanceOf(Date);
    expect(isNaN(date.getTime())).toBe(false);
  });
});
