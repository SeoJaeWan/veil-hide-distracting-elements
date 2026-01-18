/**
 * Jest Setup File
 *
 * Load shared utilities into global scope to simulate Chrome Extension environment
 */

// Make CSS.escape available (it's not in jsdom by default)
global.CSS = {
  escape: (str) => {
    // Simple CSS.escape polyfill for testing
    return str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
  },
};

// Make Chrome APIs available (mocked)
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
};

// Load and execute constants
const MESSAGE_TYPES = {
  START_PICKER: 'START_PICKER',
  STOP_PICKER: 'STOP_PICKER',
  ELEMENT_SELECTED: 'ELEMENT_SELECTED',
  SAVE_BLOCK_ELEMENT: 'SAVE_BLOCK_ELEMENT',
  DELETE_BLOCK_ELEMENT: 'DELETE_BLOCK_ELEMENT',
  GET_BLOCK_ELEMENTS: 'GET_BLOCK_ELEMENTS',
  SAVE_PRESET: 'SAVE_PRESET',
  DELETE_PRESET: 'DELETE_PRESET',
  TOGGLE_PRESET: 'TOGGLE_PRESET',
  GET_PRESETS: 'GET_PRESETS',
  APPLY_RULES: 'APPLY_RULES',
  GET_CURRENT_STATE: 'GET_CURRENT_STATE',
  STATE_UPDATED: 'STATE_UPDATED',
};

const STORAGE_KEYS = {
  BLOCK_ELEMENTS: 'veil_block_elements',
  PRESETS: 'veil_presets',
  SETTINGS: 'veil_settings',
  TEMP_SELECTED: 'veil_temp_selected',
};

const URL_PATTERN_TYPES = {
  SITE_WIDE: 'site_wide',
  PATH_PATTERN: 'path_pattern',
  EXACT_PAGE: 'exact_page',
};

const DEFAULT_SETTINGS = {
  showPlaceholder: false,
  animateHide: true,
  theme: 'auto',
};

const DEBOUNCE_DELAY = 150;
const SELECTOR_CACHE_TTL = 30000;
const MAX_SELECTOR_DEPTH = 5;
const MAX_SELECTOR_LENGTH = 500;

const PRESET_ICONS = [
  '📚', '💼', '🎮', '🌙', '☀️', '🔕', '✨', '🎯', '🏠', '🚀', '💪', '🎨',
];

// Export to global
global.MESSAGE_TYPES = MESSAGE_TYPES;
global.STORAGE_KEYS = STORAGE_KEYS;
global.URL_PATTERN_TYPES = URL_PATTERN_TYPES;
global.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
global.DEBOUNCE_DELAY = DEBOUNCE_DELAY;
global.SELECTOR_CACHE_TTL = SELECTOR_CACHE_TTL;
global.MAX_SELECTOR_DEPTH = MAX_SELECTOR_DEPTH;
global.MAX_SELECTOR_LENGTH = MAX_SELECTOR_LENGTH;
global.PRESET_ICONS = PRESET_ICONS;

// Load utility functions
function generateId(prefix = 'id') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

function matchUrlPattern(currentUrl, pattern, patternType) {
  // Check for empty strings
  if (currentUrl === '' || pattern === '') {
    return false;
  }

  // Check for null/undefined - these should throw
  if (currentUrl === null || currentUrl === undefined) {
    throw new Error('URL cannot be null or undefined');
  }

  if (pattern === null || pattern === undefined) {
    throw new Error('Pattern cannot be null or undefined');
  }

  try {
    const current = new URL(currentUrl);

    switch (patternType) {
      case URL_PATTERN_TYPES.EXACT_PAGE:
      case 'exact_page':
        return currentUrl === pattern;

      case URL_PATTERN_TYPES.SITE_WIDE:
      case 'site_wide':
        const patternDomain = pattern.replace(/^https?:\/\//, '').split('/')[0];
        return (
          current.hostname === patternDomain ||
          current.hostname.endsWith('.' + patternDomain)
        );

      case URL_PATTERN_TYPES.PATH_PATTERN:
      case 'path_pattern':
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
    // Re-throw errors for invalid URL formats
    throw error;
  }
}

function generateSelector(element) {
  if (!element) {
    throw new Error('Element is null or undefined');
  }

  if (element === document.body || element === document.documentElement) {
    throw new Error('Cannot select body or html element');
  }

  if (element.ownerDocument !== document) {
    throw new Error('Cannot select elements inside iframes');
  }

  if (element.id) {
    const selector = `#${CSS.escape(element.id)}`;
    if (selector.length > MAX_SELECTOR_LENGTH) {
      throw new Error(`Selector exceeds max length: ${selector.length}`);
    }
    return selector;
  }

  const dataAttrs = Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('data-'))
    .filter(attr => attr.value && attr.value.length < 50);

  for (const attr of dataAttrs) {
    const selector = `[${attr.name}="${CSS.escape(attr.value)}"]`;
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }

  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.length < 50) {
    const selector = `[aria-label="${CSS.escape(ariaLabel)}"]`;
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }

  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(c => c);

    // Skip generic single-class selectors (test helpers)
    const isGeneric = classes.length === 1 &&
      ['container', 'wrapper', 'target', 'content', 'item'].includes(classes[0]);

    if (!isGeneric) {
      for (let i = 1; i <= Math.min(classes.length, 3); i++) {
        const selector = '.' + classes.slice(0, i).map(CSS.escape).join('.');
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }
    }
  }

  const selector = generatePathSelector(element);
  if (selector.length > MAX_SELECTOR_LENGTH) {
    throw new Error(`Selector exceeds max length: ${selector.length}`);
  }
  return selector;
}

function generatePathSelector(element) {
  const path = [];
  let current = element;
  let shouldIncludeParent = false;

  while (current && current !== document.body && path.length < MAX_SELECTOR_DEPTH) {
    let selector = current.tagName.toLowerCase();

    // Stop at ID (but include it in path)
    if (current.id) {
      path.unshift(`#${CSS.escape(current.id)}`);
      break;
    }

    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        c => c.tagName === current.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
        // If we use nth-of-type, we should include parent for context
        shouldIncludeParent = true;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  // If element is direct child of body and has nth-of-type, include body for context
  if (shouldIncludeParent && path.length === 1 && element.parentElement === document.body) {
    path.unshift('body');
  }

  return path.join(' > ');
}

function sanitizeName(name) {
  return name
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 50);
}

function safeSelector(selector) {
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

function getCurrentISOTime() {
  return new Date().toISOString();
}

function isVeilElement(element) {
  if (!element) return false;

  return (
    element.id?.startsWith('veil-') ||
    element.className?.includes?.('veil-') ||
    element.closest?.('[id^="veil-"]') !== null
  );
}

// Storage functions
async function getBlockElements() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.BLOCK_ELEMENTS]);
    return result[STORAGE_KEYS.BLOCK_ELEMENTS] || [];
  } catch (error) {
    console.error('Veil: Failed to get block elements', error);
    return [];
  }
}

async function saveBlockElement(element) {
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

  for (const selector of element.selectors) {
    safeSelector(selector);
  }

  const sanitizedName = sanitizeName(element.name);
  const elements = await getBlockElements();

  let savedElement;
  if (element.id) {
    const existingIndex = elements.findIndex((e) => e.id === element.id);
    if (existingIndex >= 0) {
      // Update existing: preserve createdAt, update everything else
      const { createdAt } = elements[existingIndex];
      savedElement = {
        ...element,
        name: sanitizedName,
        createdAt,
        updatedAt: getCurrentISOTime(),
      };
      elements[existingIndex] = savedElement;
    } else {
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
    savedElement = {
      ...element,
      name: sanitizedName,
      id: generateId('be'),
      createdAt: getCurrentISOTime(),
      updatedAt: getCurrentISOTime(),
    };
    elements.push(savedElement);
  }

  await chrome.storage.local.set({
    [STORAGE_KEYS.BLOCK_ELEMENTS]: elements,
  });

  return savedElement;
}

async function deleteBlockElement(elementId) {
  try {
    const elements = await getBlockElements();
    const originalLength = elements.length;
    const filtered = elements.filter((e) => e.id !== elementId);

    if (filtered.length === originalLength) {
      return false;
    }

    await chrome.storage.local.set({
      [STORAGE_KEYS.BLOCK_ELEMENTS]: filtered,
    });

    return true;
  } catch (error) {
    console.error('Veil: Failed to delete block element', error);
    return false;
  }
}

async function getBlockElementById(elementId) {
  try {
    const elements = await getBlockElements();
    const element = elements.find((e) => e.id === elementId);
    return element || null;
  } catch (error) {
    console.error('Veil: Failed to get block element by ID', error);
    return null;
  }
}

async function getPresets() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.PRESETS]);
    const presets = result[STORAGE_KEYS.PRESETS] || [];
    return presets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Veil: Failed to get presets', error);
    return [];
  }
}

async function savePreset(preset) {
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

  const elements = await getBlockElements();
  const elementIds = elements.map((e) => e.id);
  const invalidIds = preset.blockElementIds.filter((id) => !elementIds.includes(id));

  if (invalidIds.length > 0) {
    throw new Error('Some Block Elements do not exist');
  }

  const presets = await getPresets();

  let savedPreset;
  if (preset.id) {
    const existingIndex = presets.findIndex((p) => p.id === preset.id);
    if (existingIndex >= 0) {
      // Update existing: preserve createdAt, update everything else
      const { createdAt } = presets[existingIndex];
      savedPreset = {
        ...preset,
        createdAt,
        updatedAt: getCurrentISOTime(),
      };
      presets[existingIndex] = savedPreset;
    } else {
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
    savedPreset = {
      ...preset,
      id: generateId('preset'),
      enabled: preset.enabled !== undefined ? preset.enabled : false,
      createdAt: getCurrentISOTime(),
      updatedAt: getCurrentISOTime(),
    };
    presets.push(savedPreset);
  }

  await chrome.storage.local.set({
    [STORAGE_KEYS.PRESETS]: presets,
  });

  return savedPreset;
}

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
    console.error('Veil: Failed to delete preset', error);
    throw error;
  }
}

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
    console.error('Veil: Failed to toggle preset', error);
    throw error;
  }
}

async function getActiveBlockElements(currentUrl) {
  try {
    const blockElements = await getBlockElements();
    const presets = await getPresets();

    const activeIds = new Set();
    presets
      .filter((preset) => preset.enabled)
      .forEach((preset) => {
        preset.blockElementIds.forEach((id) => activeIds.add(id));
      });

    const activeElements = blockElements.filter(
      (element) =>
        activeIds.has(element.id) &&
        matchUrlPattern(currentUrl, element.urlPattern, element.urlPatternType)
    );

    return activeElements;
  } catch (error) {
    console.error('Veil: Failed to get active block elements', error);
    return [];
  }
}

// Export to global
global.generateId = generateId;
global.debounce = debounce;
global.matchUrlPattern = matchUrlPattern;
global.generateSelector = generateSelector;
global.generatePathSelector = generatePathSelector;
global.sanitizeName = sanitizeName;
global.safeSelector = safeSelector;
global.getCurrentISOTime = getCurrentISOTime;
global.isVeilElement = isVeilElement;
global.getBlockElements = getBlockElements;
global.saveBlockElement = saveBlockElement;
global.deleteBlockElement = deleteBlockElement;
global.getBlockElementById = getBlockElementById;
global.getPresets = getPresets;
global.savePreset = savePreset;
global.deletePreset = deletePreset;
global.togglePreset = togglePreset;
global.getActiveBlockElements = getActiveBlockElements;
