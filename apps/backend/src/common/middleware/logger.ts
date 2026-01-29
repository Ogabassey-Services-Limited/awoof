/**
 * Logger Middleware
 * 
 * Request logging middleware
 * Follows Single Responsibility Principle - only handles logging
 */

import type { Request, Response, NextFunction } from 'express';
import { config } from '../../config/env.js';
import { appLogger } from '../logger.js';

/**
 * Request logger middleware
 * Logs requests in development; in production only 4xx/5xx are logged
 */
export const logger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    if (config.isDevelopment) {
        appLogger.info(`${req.method} ${req.path}`);
    }

    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        if (config.isDevelopment || status >= 400) {
            appLogger.info(`${req.method} ${req.path} ${status} - ${duration}ms`);
        }
    });

    next();
};

