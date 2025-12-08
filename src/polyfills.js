// ✅ FIX: Process polyfill for browser environment
// This file must be imported first before any other modules
// Some libraries (like Supabase) may try to access process.version

if (typeof window !== 'undefined') {
  if (typeof window.process === 'undefined') {
    window.process = {
      env: {},
      version: 'v18.0.0',
      browser: true
    };
  }
  if (typeof window.global === 'undefined') {
    window.global = window;
  }
}

if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.process === 'undefined') {
    globalThis.process = typeof window !== 'undefined' ? window.process : {
      env: {},
      version: 'v18.0.0',
      browser: true
    };
  }
  if (typeof globalThis.global === 'undefined') {
    globalThis.global = globalThis;
  }
}

// Ensure process is available globally
if (typeof process === 'undefined') {
  if (typeof globalThis !== 'undefined') {
    globalThis.process = globalThis.process || {
      env: {},
      version: 'v18.0.0',
      browser: true
    };
  }
}
