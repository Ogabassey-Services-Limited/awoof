/**
 * Application logger
 * Use instead of console.* in app code. In production, only errors are logged to stdout.
 * All output is sanitized (newlines/control chars removed) and passed as a single string
 * to avoid log injection (CWE-117). No user-controlled data is written unsanitized.
 */

import { config } from '../config/env.js';

const isProd = config.isProduction;

function sanitizeString(s: string): string {
  return s.replace(/[\r\n\x00-\x1f]/g, ' ');
}

function sanitize(arg: unknown): string {
  if (typeof arg === 'string') return sanitizeString(arg);
  if (arg instanceof Error) return sanitizeString(arg.message);
  if (Array.isArray(arg)) return arg.map(sanitize).join(' ');
  if (arg !== null && typeof arg === 'object') return sanitizeString(JSON.stringify(arg));
  return String(arg);
}

/** Sanitize and join all args into one safe string for logging. */
function toSafeLogMessage(args: unknown[]): string {
  return args.map(a => sanitize(a)).join(' ');
}

export const appLogger = {
  info: (...args: unknown[]) => {
    if (!isProd) console.log(toSafeLogMessage(args));
  },
  warn: (...args: unknown[]) => {
    if (!isProd) console.warn(toSafeLogMessage(args));
  },
  error: (...args: unknown[]) => {
    console.error(toSafeLogMessage(args));
  },
  debug: (...args: unknown[]) => {
    if (!isProd) console.debug(toSafeLogMessage(args));
  },
};
