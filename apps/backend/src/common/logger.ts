/**
 * Application logger
 * Use instead of console.* in app code. In production, only errors are logged to stdout.
 * Sanitizes string args to prevent log injection (newlines, control chars).
 */

import { config } from '../config/env.js';

const isProd = config.isProduction;

function sanitize(arg: unknown): unknown {
  if (typeof arg === 'string') {
    return arg.replace(/[\r\n\x00-\x1f]/g, ' ');
  }
  if (Array.isArray(arg)) return arg.map(sanitize);
  if (arg !== null && typeof arg === 'object') return arg;
  return arg;
}

export const appLogger = {
  info: (...args: unknown[]) => {
    if (!isProd) console.log(...args.map(sanitize));
  },
  warn: (...args: unknown[]) => {
    if (!isProd) console.warn(...args.map(sanitize));
  },
  error: (...args: unknown[]) => {
    console.error(...args.map(sanitize));
  },
  debug: (...args: unknown[]) => {
    if (!isProd) console.debug(...args.map(sanitize));
  },
};
