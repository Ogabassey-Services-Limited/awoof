/**
 * Application logger
 * Use instead of console.* in app code. In production, only errors are logged to stdout.
 * Sanitizes all args to prevent log injection (newlines, control chars, including Error.message).
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

function safeArgs(args: unknown[]): string[] {
  return args.map(a => sanitize(a));
}

export const appLogger = {
  info: (...args: unknown[]) => {
    if (!isProd) console.log(...safeArgs(args));
  },
  warn: (...args: unknown[]) => {
    if (!isProd) console.warn(...safeArgs(args));
  },
  error: (...args: unknown[]) => {
    console.error(...safeArgs(args));
  },
  debug: (...args: unknown[]) => {
    if (!isProd) console.debug(...safeArgs(args));
  },
};
