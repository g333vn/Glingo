// src/utils/logger.js
// Centralized logger to control what appears in DevTools (F12) between dev and production.

const isProd = import.meta.env?.PROD ?? false;

function safeMeta(meta) {
  // Defensive copy & simple filter – DO NOT pass passwords / raw tokens here.
  if (!meta || typeof meta !== 'object') return meta;
  const clone = { ...meta };
  if ('password' in clone) clone.password = '[REDACTED]';
  if ('token' in clone) clone.token = '[REDACTED]';
  if ('accessToken' in clone) clone.accessToken = '[REDACTED]';
  if ('refreshToken' in clone) clone.refreshToken = '[REDACTED]';
  return clone;
}

// Placeholder for server-side logging (Sentry, LogRocket, custom API, etc.)
function sendLogToServer(level, message, meta) {
  try {
    // NOTE:
    // - Implement real server logging here if needed (Supabase Edge Function, API route, etc.)
    // - Keep it fire-and-forget, never block UI if logging fails.
    void fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        message,
        meta: safeMeta(meta),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Swallow all errors – logging must never break the app
  }
}

export const logger = {
  /**
   * Debug logs – visible only in development, completely silent in production.
   */
  debug(message, meta) {
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.debug(message, meta);
    }
  },

  /**
   * Informational logs – visible in dev; in production sent to server (if configured) but not printed.
   */
  info(message, meta) {
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.info(message, meta);
    } else {
      sendLogToServer('info', message, meta);
    }
  },

  /**
   * Warnings – visible in dev; in production sent to server, not printed to console.
   */
  warn(message, meta) {
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.warn(message, meta);
    } else {
      sendLogToServer('warn', message, meta);
    }
  },

  /**
   * Errors – visible in dev; in production gửi về server (nếu cần),
   * có thể in rất tối giản nếu bạn muốn, nhưng mặc định KHÔNG spam console.
   */
  error(message, meta) {
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.error(message, meta);
    } else {
      sendLogToServer('error', message, meta);
    }
  },
};


