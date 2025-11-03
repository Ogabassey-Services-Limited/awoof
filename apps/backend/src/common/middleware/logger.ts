/**
 * Logger Middleware
 * 
 * Request logging middleware
 * Follows Single Responsibility Principle - only handles logging
 */

import type { Request, Response, NextFunction } from 'express';
import { config } from '../../config/env.js';

/**
 * Request logger middleware
 * Logs all incoming requests with method, path, and response time
 */
export const logger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    // Log request
    if (config.isDevelopment) {
        console.log(`📥 ${req.method} ${req.path}`);
    }

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const statusEmoji = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';

        if (config.isDevelopment || status >= 400) {
            console.log(
                `${statusEmoji} ${req.method} ${req.path} ${status} - ${duration}ms`
            );
        }
    });

    next();
};

