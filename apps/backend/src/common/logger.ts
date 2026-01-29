/**
 * Application logger
 * Use instead of console.* in app code. In production, only errors are logged to stdout.
 */

import { config } from '../config/env.js';

const isProd = config.isProduction;

export const appLogger = {
  info: (...args: unknown[]) => {
    if (!isProd) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (!isProd) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
  debug: (...args: unknown[]) => {
    if (!isProd) console.debug(...args);
  },
};
