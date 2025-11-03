/**
 * Response Utility Functions
 * 
 * Consistent API response formatting
 * Follows DRY principle - single source of truth for response format
 */

import type { Response } from 'express';

/**
 * Success response interface
 */
export interface SuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    message?: string,
    meta?: SuccessResponse['meta']
): void => {
    const response: SuccessResponse<T> = {
        success: true,
        data,
        ...(message && { message }),
        ...(meta && { meta }),
    };

    res.status(statusCode).json(response);
};

/**
 * Simplified success response (alias for convenience)
 */
export const success = <T>(
    res: Response,
    options: {
        message?: string;
        data: T;
        meta?: SuccessResponse['meta'];
    },
    statusCode: number = 200
): void => {
    sendSuccess(res, options.data, statusCode, options.message, options.meta);
};

/**
 * Send paginated response
 */
export const sendPaginated = <T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
): void => {
    const totalPages = Math.ceil(total / limit);

    sendSuccess(res, data, 200, message, {
        page,
        limit,
        total,
        totalPages,
    });
};

