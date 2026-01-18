/**
 * Content Script - DOM 조작 및 Element Picker
 *
 * 주요 기능:
 * - Element Picker: 요소 선택 모드
 * - Hiding Engine: CSS 클래스 토글로 요소 숨김/표시
 * - Mutation Observer: SPA 동적 콘텐츠 대응
 */

// =============================================================================
// 상태 관리
// =============================================================================

let isPickerActive = false;
let currentHighlightedElement = null;
let bannerElement = null;
let tooltipElement = null;
let escBtnClickHandler = null;

// =============================================================================
// Element Picker
// =============================================================================

/**
 * Element Picker 모드 시작
 */
function startElementPicker() {
  if (isPickerActive) return;

  isPickerActive = true;

  // Create banner
  createBanner();

  // Add event listeners
  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleEscape, true);
}

/**
 * Element Picker 모드 중지
 */
function stopElementPicker() {
  if (!isPickerActive) return;

  isPickerActive = false;

  // Remove banner and its event listener
  if (bannerElement) {
    const escBtn = bannerElement.querySelector('.veil-picker-esc');
    if (escBtn && escBtnClickHandler) {
      escBtn.removeEventListener('click', escBtnClickHandler);
    }
    bannerElement.remove();
    bannerElement = null;
    escBtnClickHandler = null;
  }

  // Remove tooltip
  if (tooltipElement) {
    tooltipElement.remove();
    tooltipElement = null;
  }

  // Remove highlight
  removeHighlight();

  // Remove event listeners
  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('keydown', handleEscape, true);
}

/**
 * 배너 UI 생성
 */
function createBanner() {
  bannerElement = document.createElement('div');
  bannerElement.id = 'veil-picker-banner';
  bannerElement.className = 'veil-picker-banner';
  bannerElement.innerHTML = `
    <div class="veil-picker-text">
      <span>클릭하여 요소 선택</span>
    </div>
    <div class="veil-picker-esc">ESC</div>
  `;

  // ESC button click handler
  escBtnClickHandler = stopElementPicker;
  const escBtn = bannerElement.querySelector('.veil-picker-esc');
  escBtn.addEventListener('click', escBtnClickHandler);

  document.body.appendChild(bannerElement);
}

/**
 * 마우스 호버 시 요소 하이라이트
 * @param {MouseEvent} event - 마우스 이벤트
 */
function handleMouseOver(event) {
  if (!isPickerActive) return;

  const element = event.target;

  // Ignore Veil UI elements
  if (isVeilElement(element)) {
    return;
  }

  // Ignore body/html
  if (element === document.body || element === document.documentElement) {
    return;
  }

  event.stopPropagation();

  // Remove previous highlight
  removeHighlight();

  // Highlight new element
  highlightElement(element);

  // Show tooltip
  showTooltip(element, event.clientX, event.clientY);
}

/**
 * 마우스 클릭 시 요소 선택
 * @param {MouseEvent} event - 마우스 이벤트
 */
function handleClick(event) {

  if (!isPickerActive) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();


  const element = event.target;


  // Ignore Veil UI
  if (isVeilElement(element)) {
    return;
  }

  // Ignore iframe elements
  if (element.ownerDocument !== document) {
    alert('iframe 내부의 요소는 선택할 수 없습니다.');
    return;
  }

  // Ignore body/html
  if (element === document.body || element === document.documentElement) {
    alert('body나 html 요소는 선택할 수 없습니다.');
    return;
  }


  // Generate selector candidates
  try {
    const selector = generateSelector(element);

    const selectors = [selector]; // Can add fallback selectors here

    // 디버깅
    const filteredClasses = element.className.split(' ').filter(c => c && !c.startsWith('veil-'));

    // Get element info
    const elementInfo = {
      selectors,
      description: getElementDescription(element),
      tagName: element.tagName.toLowerCase(),
      url: window.location.href,
      domain: window.location.hostname,
      pathPattern: window.location.hostname + window.location.pathname,
      rect: {
        width: element.offsetWidth,
        height: element.offsetHeight
      }
    };


    // Send to background
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.ELEMENT_SELECTED,
      payload: elementInfo
    });


    // Stop picker mode
    stopElementPicker();

  } catch (error) {
    alert('이 요소는 선택할 수 없습니다.');
  }
}

/**
 * ESC 키 처리
 * @param {KeyboardEvent} event - 키보드 이벤트
 */
function handleEscape(event) {
  if (event.key === 'Escape' && isPickerActive) {
    event.preventDefault();
    stopElementPicker();
  }
}

/**
 * 요소 하이라이트
 * @param {HTMLElement} element - 하이라이트할 요소
 */
function highlightElement(element) {
  element.classList.add('veil-picker-highlight');
  currentHighlightedElement = element;
}

/**
 * 하이라이트 제거
 */
function removeHighlight() {
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove('veil-picker-highlight');
    currentHighlightedElement = null;
  }
}

/**
 * Tooltip 표시
 * @param {HTMLElement} element - 대상 요소
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 */
function showTooltip(element, x, y) {
  // Reuse existing tooltip
  if (!tooltipElement) {
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'veil-picker-tooltip';
    document.body.appendChild(tooltipElement);
  }

  // Simple monospace text - Design: 작고 심플하게
  const description = getElementDescription(element);
  tooltipElement.textContent = description;

  // Position tooltip
  tooltipElement.style.left = `${x + 15}px`;
  tooltipElement.style.top = `${y + 15}px`;
}

/**
 * 요소 설명 생성
 * @param {HTMLElement} element - 대상 요소
 * @returns {string} 요소 설명
 */
function getElementDescription(element) {
  if (element.id) return `#${element.id}`;
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(c => c).slice(0, 2);
    if (classes.length > 0) return `.${classes.join('.')}`;
  }
  if (element.textContent && element.textContent.trim()) {
    return element.textContent.trim().slice(0, 30);
  }
  return element.tagName.toLowerCase();
}

/**
 * Veil UI 요소인지 확인
 * @param {HTMLElement} element - 확인할 요소
 * @returns {boolean} Veil UI 요소 여부
 */
function isVeilElement(element) {
  if (!element) return false;

  // Veil picker UI 요소 확인 (banner, tooltip 등)
  if (element.id && (element.id === 'veil-picker-banner' || element.id.startsWith('veil-'))) {
    return true;
  }

  // veil-picker-highlight는 선택 대상 요소에 붙는 클래스이므로 제외
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ');
    const veilClasses = classes.filter(c =>
      c.startsWith('veil-') && c !== 'veil-picker-highlight' && c !== 'veil-hidden'
    );
    if (veilClasses.length > 0) return true;
  }

  // 부모가 Veil UI인지 확인 (banner, tooltip)
  if (element.closest) {
    if (element.closest('#veil-picker-banner')) return true;
    if (element.closest('.veil-picker-tooltip')) return true;
    if (element.closest('.veil-picker-banner')) return true;
  }

  return false;
}

/**
 * CSS Selector 생성 (architecture.md 알고리즘)
 * @param {HTMLElement} element - 대상 요소
 * @returns {string} CSS selector
 */
// generateSelector, generatePathSelector, validateSelector는 utils.js에서 import됨

// =============================================================================
// Hiding Engine
// =============================================================================

/**
 * 활성 Block Element에 따라 요소 숨김/표시
 */
async function applyRules() {
  try {
    // MutationObserver 일시 중지 (무한 루프 방지)
    pauseMutationObserver();

    // 1. 현재 URL 가져오기
    const currentUrl = window.location.href;

    // 2. 활성 Block Element 가져오기
    const activeElements = await getActiveBlockElements(currentUrl);

    // 3. 먼저 모든 숨김 해제
    unhideAllElements();

    // 4. 활성 요소 숨김 적용
    if (activeElements.length > 0) {
      activeElements.forEach(element => {
        hideElementBySelectors(element.selectors);
      });
    }

    // MutationObserver 재개
    resumeMutationObserver();
  } catch (error) {
    // 에러 발생 시에도 MutationObserver 재개
    resumeMutationObserver();
  }
}

/**
 * Selector 배열로 요소 숨김 (fallback 지원)
 * @param {Array<string>} selectors - CSS selector 배열
 */
function hideElementBySelectors(selectors) {

  if (!selectors || !Array.isArray(selectors) || selectors.length === 0) {
    return;
  }

  // Selector를 우선순위대로 시도 (첫 번째 성공 시 중단)
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector);

      if (elements.length > 0) {
        elements.forEach(el => {
          el.classList.add('veil-hidden');
        });
        return; // 첫 번째 성공 selector만 사용
      }
    } catch (error) {
      continue; // 다음 selector 시도
    }
  }

}

/**
 * 모든 숨김 해제
 */
function unhideAllElements() {
  const hiddenElements = document.querySelectorAll('.veil-hidden');
  hiddenElements.forEach(el => {
    el.classList.remove('veil-hidden');
  });
}

// =============================================================================
// Mutation Observer
// =============================================================================

let mutationObserver = null;

/**
 * MutationObserver 설정 및 시작
 */
function setupMutationObserver() {
  // 이미 설정된 경우 무시
  if (mutationObserver) return;

  // Debounce된 applyRules 함수
  const debouncedApplyRules = debounce(applyRules, 300);

  // MutationObserver 생성
  mutationObserver = new MutationObserver((mutations) => {
    // 의미 있는 변경만 필터링
    const hasSignificantChange = mutations.some(mutation => {
      // Veil이 추가한 변경사항은 무시 (무한 루프 방지)
      if (mutation.target && isVeilElement(mutation.target)) {
        return false;
      }

      // 1. 자식 노드 추가/제거
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        return true;
      }

      // 2. 속성 변경 (class, id 등)
      if (mutation.type === 'attributes') {
        const attrName = mutation.attributeName;
        // veil-hidden 클래스 변경은 무시 (무한 루프 방지)
        if (attrName === 'class') {
          const element = mutation.target;
          const oldValue = mutation.oldAttributeValue || '';
          const newValue = element.className || '';

          // veil-hidden만 변경된 경우 무시
          const oldClasses = oldValue.split(' ').filter(c => c && c !== 'veil-hidden').sort().join(' ');
          const newClasses = newValue.split(' ').filter(c => c && c !== 'veil-hidden').sort().join(' ');

          if (oldClasses === newClasses) {
            return false; // veil-hidden만 변경됨 → 무시
          }
        }

        return attrName === 'class' || attrName === 'id' || attrName?.startsWith('data-');
      }
      return false;
    });

    if (hasSignificantChange) {
      debouncedApplyRules();
    }
  });

  // document.body 관찰 시작
  if (document.body) {
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'data-*'],
      attributeOldValue: true  // 이전 속성 값 추적
    });
  }
}

/**
 * MutationObserver 정리
 */
function cleanupMutationObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
}

/**
 * MutationObserver 일시 중지
 */
function pauseMutationObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }
}

/**
 * MutationObserver 재개
 */
function resumeMutationObserver() {
  if (mutationObserver && document.body) {
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'data-*'],
      attributeOldValue: true
    });
  }
}

// =============================================================================
// 메시지 리스너
// =============================================================================

let messageListenerAttached = false;

/**
 * Message listener 등록 (중복 방지)
 */
function attachMessageListener() {
  if (messageListenerAttached) return;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type } = message;

    if (type === MESSAGE_TYPES.START_PICKER) {
      startElementPicker();
      sendResponse({ success: true });
    } else if (type === MESSAGE_TYPES.STOP_PICKER) {
      stopElementPicker();
      sendResponse({ success: true });
    } else if (type === MESSAGE_TYPES.APPLY_RULES) {
      // 규칙 즉시 적용
      applyRules();
      sendResponse({ success: true });
    } else if (type === MESSAGE_TYPES.STATE_UPDATED) {
      // Storage 변경 시 규칙 재적용
      applyRules();
      sendResponse({ success: true });
    }

    return true; // Keep message channel open for async response
  });

  messageListenerAttached = true;
}

// =============================================================================
// 초기화
// =============================================================================

/**
 * Content Script 초기화
 */
function init() {
  // 메시지 리스너 등록 (중복 방지)
  attachMessageListener();

  // MutationObserver 설정
  setupMutationObserver();

  // 초기 규칙 적용
  applyRules();
}

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
