/**
 * 공유 유틸리티 함수
 *
 * Popup, Content Script, Background에서 공통으로 사용하는 유틸리티
 */

// ID uniqueness validation enabled

// =============================================================================
// ID 생성
// =============================================================================

/**
 * 고유 ID 생성 (Crypto API 사용)
 * @param {string} prefix - ID 접두사 (예: 'be', 'preset')
 * @returns {string} 생성된 ID (예: 'be_1705123456789_abc123def456')
 */
function generateId(prefix = 'id') {
  const timestamp = Date.now();

  // Crypto API 사용 (충돌 위험 최소화)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(12);
    crypto.getRandomValues(array);
    const random = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${prefix}_${timestamp}_${random}`;
  }

  // Fallback: 더 많은 랜덤 바이트 사용
  const random1 = Math.random().toString(36).substr(2, 9);
  const random2 = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random1}${random2}`;
}

// =============================================================================
// Debounce
// =============================================================================

/**
 * Debounce 함수
 * @param {Function} func - 실행할 함수
 * @param {number} delay - 지연 시간 (ms)
 * @returns {Function} Debounced 함수
 */
function debounce(func, delay) {
  // TODO: debounce 구현
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// =============================================================================
// URL 매칭
// =============================================================================

/**
 * URL 패턴 매칭
 * @param {string} currentUrl - 현재 URL
 * @param {string} pattern - 매칭할 패턴
 * @param {string} patternType - 패턴 타입 ('site_wide' | 'path_pattern' | 'exact_page')
 * @returns {boolean} 매칭 여부
 */
function matchUrlPattern(currentUrl, pattern, patternType) {
  // Null/undefined/empty 체크 - false 반환 (throw 하지 않음)
  if (!currentUrl || !pattern || patternType === null || patternType === undefined) {
    return false;
  }

  try {
    const current = new URL(currentUrl);

    switch (patternType) {
      case URL_PATTERN_TYPES.EXACT_PAGE:
      case 'exact_page':
        // 정확히 일치
        return currentUrl === pattern;

      case URL_PATTERN_TYPES.SITE_WIDE:
      case 'site_wide':
        // 도메인만 비교
        const patternDomain = pattern.replace(/^https?:\/\//, '').split('/')[0];
        return (
          current.hostname === patternDomain ||
          current.hostname.endsWith('.' + patternDomain)
        );

      case URL_PATTERN_TYPES.PATH_PATTERN:
      case 'path_pattern':
        // 와일드카드 패턴 매칭
        const patternUrl = new URL(
          pattern.includes('://') ? pattern : `https://${pattern}`
        );

        // Check hostname match (with subdomain support like site_wide)
        const patternHost = patternUrl.hostname;
        const hostnameMatches =
          current.hostname === patternHost ||
          current.hostname.endsWith('.' + patternHost);

        if (!hostnameMatches) return false;

        const patternPath = patternUrl.pathname.replace(/\*/g, '.*');
        const regex = new RegExp(`^${patternPath}`);
        return regex.test(current.pathname);

      default:
        return false;
    }
  } catch (error) {
    // 에러 시 false 반환 (throw 하지 않음)
    return false;
  }
}

// =============================================================================
// CSS Selector 생성
// =============================================================================

/**
 * escapeSelector() 폴리필
 * @param {string} str - 이스케이프할 문자열
 * @returns {string} 이스케이프된 문자열
 */
function escapeSelector(str) {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(str);
  }
  // Fallback for older browsers
  return str.replace(/([^\x00-\x7f]|[!-\/:-@\[-\`\{-\xb9])/g, '\\$1');
}

/**
 * CSS Selector 생성 알고리즘
 *
 * 우선순위:
 * 1. ID (#id)
 * 2. 고유한 data 속성 ([data-*])
 * 3. aria-label
 * 4. 클래스 조합 (.class1.class2)
 * 5. 경로 기반 (div > span:nth-of-type(2))
 *
 * @param {HTMLElement} element - 대상 요소
 * @returns {string} 생성된 CSS selector
 * @throws {Error} body 또는 html 요소는 선택 불가
 */
function generateSelector(element) {

  // Exception 1: null/undefined check
  if (!element) {
    throw new Error('Element is null or undefined');
  }

  // Exception 2: body/html cannot be selected
  if (element === document.body || element === document.documentElement) {
    throw new Error('Cannot select body or html element');
  }

  // Exception 3: iframe internals cannot be selected
  if (element.ownerDocument !== document) {
    throw new Error('Cannot select elements inside iframes');
  }

  // 1. ID (highest priority) - 단, 유일한 경우만
  if (element.id) {
    const idSelector = `#${escapeSelector(element.id)}`;

    // 유일성 검증
    const matches = document.querySelectorAll(idSelector);

    if (matches.length === 1) {
      // 유일하면 그대로 사용
      if (idSelector.length <= MAX_SELECTOR_LENGTH) {
        return idSelector;
      }
    }

    // 여러 개 매칭되면 속성을 결합해서 구체화
    if (matches.length > 1) {
      const tagName = element.tagName.toLowerCase();

      // 전략 1: aria-label과 결합
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.length < 50) {
        const ariaSelector = `${tagName}${idSelector}[aria-label="${escapeSelector(ariaLabel)}"]`;
        const ariaMatches = document.querySelectorAll(ariaSelector).length;
        if (ariaMatches === 1 && ariaSelector.length <= MAX_SELECTOR_LENGTH) {
          return ariaSelector;
        }
      }

      // 전략 2: href와 결합 (링크 요소인 경우)
      const href = element.getAttribute('href');
      if (href && href.length < 100) {
        const hrefSelector = `${tagName}${idSelector}[href="${escapeSelector(href)}"]`;
        const hrefMatches = document.querySelectorAll(hrefSelector).length;
        if (hrefMatches === 1 && hrefSelector.length <= MAX_SELECTOR_LENGTH) {
          return hrefSelector;
        }
      }

      // 전략 3: title과 결합
      const title = element.getAttribute('title');
      if (title && title.length < 50) {
        const titleSelector = `${tagName}${idSelector}[title="${escapeSelector(title)}"]`;
        const titleMatches = document.querySelectorAll(titleSelector).length;
        if (titleMatches === 1 && titleSelector.length <= MAX_SELECTOR_LENGTH) {
          return titleSelector;
        }
      }

      // 전략 4: 부모 컨텍스트와 aria-label 결합
      if (element.parentElement && ariaLabel) {
        const parent = element.parentElement;
        const parentTag = parent.tagName.toLowerCase();
        const contextAria = `${parentTag} > ${tagName}${idSelector}[aria-label="${escapeSelector(ariaLabel)}"]`;
        const contextMatches = document.querySelectorAll(contextAria).length;
        if (contextMatches === 1 && contextAria.length <= MAX_SELECTOR_LENGTH) {
          return contextAria;
        }
      }

    }

    // ID로는 유일하게 식별 불가 → 다음 전략으로 fallback
  } else {
  }

  // 2. Unique data attribute
  const dataAttrs = Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('data-'))
    .filter(attr => attr.value && attr.value.length < 50);

  for (const attr of dataAttrs) {
    const selector = `[${attr.name}="${escapeSelector(attr.value)}"]`;
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }

  // 3. aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.length < 50) {
    const selector = `[aria-label="${escapeSelector(ariaLabel)}"]`;
    const matches = document.querySelectorAll(selector).length;
    if (matches === 1) {
      return selector;
    }
  }

  // 4. Tag + role attribute
  const role = element.getAttribute('role');
  const tagName = element.tagName.toLowerCase();
  if (role) {
    const selector = `${tagName}[role="${escapeSelector(role)}"]`;
    const matches = document.querySelectorAll(selector).length;
    if (matches === 1 && selector.length <= MAX_SELECTOR_LENGTH) {
      return selector;
    }
  }

  // 5. Class combination
  if (element.className && typeof element.className === 'string') {
    // Filter out Veil's own classes (temporary highlight, hidden state)
    const classes = element.className.split(' ')
      .filter(c => c)
      .filter(c => !c.startsWith('veil-')); // Exclude veil-picker-highlight, veil-hidden

    // Skip generic single-class selectors (common test/placeholder names)
    const isGeneric = classes.length === 1 &&
      ['container', 'wrapper', 'target', 'content', 'item'].includes(classes[0]);

    if (!isGeneric) {
      for (let i = 1; i <= Math.min(classes.length, 3); i++) {
        const selector = '.' + classes.slice(0, i).map(escapeSelector).join('.');
        const matches = document.querySelectorAll(selector).length;
        if (matches === 1) {
          return selector;
        }
      }

      // 6. Tag + classes (more specific than classes alone)
      for (let i = 1; i <= Math.min(classes.length, 2); i++) {
        const classSelector = classes.slice(0, i).map(escapeSelector).join('.');
        const selector = `${tagName}.${classSelector}`;
        const matches = document.querySelectorAll(selector).length;
        if (matches === 1 && selector.length <= MAX_SELECTOR_LENGTH) {
          return selector;
        }
      }

      // 7. Tag + classes + role (even more specific)
      if (role) {
        for (let i = 1; i <= Math.min(classes.length, 2); i++) {
          const classSelector = classes.slice(0, i).map(escapeSelector).join('.');
          const selector = `${tagName}.${classSelector}[role="${escapeSelector(role)}"]`;
          const matches = document.querySelectorAll(selector).length;
          if (matches === 1 && selector.length <= MAX_SELECTOR_LENGTH) {
            return selector;
          }
        }
      }

      // 8. Tag + classes + aria-label
      if (ariaLabel && ariaLabel.length < 50) {
        for (let i = 1; i <= Math.min(classes.length, 2); i++) {
          const classSelector = classes.slice(0, i).map(escapeSelector).join('.');
          const selector = `${tagName}.${classSelector}[aria-label="${escapeSelector(ariaLabel)}"]`;
          const matches = document.querySelectorAll(selector).length;
          if (matches === 1 && selector.length <= MAX_SELECTOR_LENGTH) {
            return selector;
          }
        }
      }
    }
  }

  // 9. Other aria-* attributes
  const ariaAttributes = ['aria-current', 'aria-selected', 'aria-checked', 'aria-expanded'];
  for (const attrName of ariaAttributes) {
    const attrValue = element.getAttribute(attrName);
    if (attrValue) {
      const selector = `${tagName}[${attrName}="${escapeSelector(attrValue)}"]`;
      const matches = document.querySelectorAll(selector).length;
      if (matches === 1 && selector.length <= MAX_SELECTOR_LENGTH) {
        return selector;
      }
    }
  }

  // 10. Path selector (fallback)
  const selector = generatePathSelector(element);

  // Validate selector length
  if (selector.length > MAX_SELECTOR_LENGTH) {
    throw new Error(`Selector exceeds max length: ${selector.length}`);
  }

  return selector;
}

/**
 * 경로 기반 Selector 생성
 * @param {HTMLElement} element - 대상 요소
 * @returns {string} 경로 기반 selector
 */
function generatePathSelector(element) {
  const path = [];
  let current = element;


  while (current && current !== document.body && path.length < MAX_SELECTOR_DEPTH) {
    let selector = current.tagName.toLowerCase();
    let hasId = false;

    // Check if current element has ID
    if (current.id) {
      selector = `${selector}#${escapeSelector(current.id)}`; // tag#id format
      hasId = true;
    }

    // Add nth-of-type if needed (even if element has ID, because ID might not be unique!)
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        c => c.tagName === current.tagName
      );

      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      } else {
      }
    }

    path.unshift(selector);

    // Stop at ID only if it's unique
    if (hasId) {
      const testSelector = path.join(' > ');
      const matches = document.querySelectorAll(testSelector).length;
      if (matches === 1) {
        break;
      }
    }

    current = current.parentElement;
  }

  const finalPath = path.join(' > ');
  return finalPath;
}

// =============================================================================
// 입력 Sanitization
// =============================================================================

/**
 * 사용자 입력 이름 sanitize
 * @param {string} name - 입력된 이름
 * @returns {string} Sanitized 이름
 */
function sanitizeName(name) {
  if (!name || typeof name !== 'string') return '';

  // 1. 기본 정제
  let cleaned = name.trim().slice(0, 50);

  // 2. 위험한 패턴 제거
  cleaned = cleaned.replace(/javascript:/gi, '');
  cleaned = cleaned.replace(/on[a-z]+=/gi, '');

  // 3. HTML 이스케이프 확인 (DOMParser 사용)
  const div = document.createElement('div');
  div.textContent = cleaned;

  return div.innerHTML;
}

/**
 * Selector 검증
 * @param {string} selector - CSS selector
 * @returns {string} 검증된 selector
 * @throws {Error} 위험한 패턴 포함 시
 */
function safeSelector(selector) {
  // TODO: 위험한 패턴 필터링
  const DANGEROUS_PATTERNS = [
    /javascript:/i,
    /expression\(/i,
    /<script/i,
  ];

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(selector)) {
      throw new Error('Invalid selector pattern');
    }
  }

  return selector;
}

// =============================================================================
// 날짜 포맷
// =============================================================================

/**
 * 현재 시간을 ISO 8601 형식으로 반환
 * @returns {string} ISO 8601 형식 날짜
 */
function getCurrentISOTime() {
  return new Date().toISOString();
}

// =============================================================================
// 로깅
// =============================================================================

/**
 * 구조화된 로깅 객체
 */
const Logger = {
  /**
   * 정보 로그
   * @param {string} message - 로그 메시지
   * @param {Object} context - 추가 컨텍스트
   */
  info(message, context = {}) {
  },

  /**
   * 에러 로그
   * @param {string} message - 로그 메시지
   * @param {Error|Object} error - 에러 객체 또는 컨텍스트
   */
  error(message, error = {}) {
  },

  /**
   * 경고 로그
   * @param {string} message - 로그 메시지
   * @param {Object} context - 추가 컨텍스트
   */
  warn(message, context = {}) {
  },

  /**
   * 디버그 로그
   * @param {string} message - 로그 메시지
   * @param {Object} context - 추가 컨텍스트
   */
  debug(message, context = {}) {
  }
};

// =============================================================================
// DOM 유틸리티
// =============================================================================

/**
 * 요소가 Veil UI 요소인지 확인
 * @param {HTMLElement} element - 확인할 요소
 * @returns {boolean} Veil UI 요소 여부
 */
function isVeilElement(element) {
  if (!element) return false;

  return (
    element.id?.startsWith('veil-') ||
    element.className?.includes?.('veil-') ||
    element.closest?.('[id^="veil-"]') !== null
  );
}
