// src/utils/debugLogger.js
// Centralized debug logging controlled by system.debugMode

import { getSetting } from './settingsManager.js';

let debugEnabled = true;
let originalConsoleLog = null;
let originalConsoleWarn = null;

function refreshDebugFlag() {
  try {
    const value = getSetting('system', 'debugMode');
    // default: ON unless explicitly false
    debugEnabled = value !== false;
  } catch (e) {
    debugEnabled = true;
  }
  applyConsoleFilter();
}

function applyConsoleFilter() {
  if (typeof console === 'undefined') return;

  // Save originals once
  if (!originalConsoleLog) {
    originalConsoleLog = console.log.bind(console);
    originalConsoleWarn = console.warn.bind(console);
  }

  if (debugEnabled) {
    // Restore original behavior
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
  } else {
    // When debug is OFF:
    // - Suppress our structured debug logs that start with bracketed tags "[GETUSERS]", "[SETTINGS]", etc.
    // - Keep other logs (from browser / libraries) so DevTools vẫn hữu ích.
    console.log = (...args) => {
      if (args.length > 0 && typeof args[0] === 'string' && /^\[[A-Z_]+\]/.test(args[0])) {
        return; // swallow our tagged debug log
      }
      originalConsoleLog(...args);
    };
    console.warn = (...args) => {
      if (args.length > 0 && typeof args[0] === 'string' && /^\[[A-Z_]+\]/.test(args[0])) {
        return;
      }
      originalConsoleWarn(...args);
    };
  }
}

export function initDebugConsoleFilter() {
  refreshDebugFlag();

  // Listen to settingsUpdated events to react to changes from Settings page
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('settingsUpdated', () => {
      refreshDebugFlag();
    });
  }
}

export function isDebugEnabled() {
  return debugEnabled;
}

// Helper functions in case we want explicit debug calls
export function debugLog(...args) {
  if (!debugEnabled) return;
  // eslint-disable-next-line no-console
  console.log(...args);
}

export function debugWarn(...args) {
  if (!debugEnabled) return;
  // eslint-disable-next-line no-console
  console.warn(...args);
}

// For serious errors we still log regardless of flag
export function debugError(...args) {
  // eslint-disable-next-line no-console
  console.error(...args);
}

export default {
  initDebugConsoleFilter,
  isDebugEnabled,
  debugLog,
  debugWarn,
  debugError
};


