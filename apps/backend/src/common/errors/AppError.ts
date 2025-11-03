/**
 * Application Error Classes
 * 
 * Custom error handling following Open/Closed Principle
 * Extensible error types without modifying existing code
 */

/**
 * Base application error class
 * All custom errors extend this for consistent error handling
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code?: string;
    public readonly details?: Record<string, any>;

    constructor(
        message: string,
        statusCode: number = 500,
        code?: string,
        details?: Record<string, any>
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        if (code !== undefined) this.code = code;
        if (details !== undefined) this.details = details;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Bad Request Error (400)
 * Invalid input or request parameters
 */
export class BadRequestError extends AppError {
    constructor(message: string = 'Bad Request', details?: Record<string, any>) {
        super(message, 400, 'BAD_REQUEST', details);
    }
}

/**
 * Unauthorized Error (401)
 * Authentication required or invalid credentials
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized', details?: Record<string, any>) {
        super(message, 401, 'UNAUTHORIZED', details);
    }
}

/**
 * Forbidden Error (403)
 * Insufficient permissions
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden', details?: Record<string, any>) {
        super(message, 403, 'FORBIDDEN', details);
    }
}

/**
 * Not Found Error (404)
 * Resource not found
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Not Found', details?: Record<string, any>) {
        super(message, 404, 'NOT_FOUND', details);
    }
}

/**
 * Conflict Error (409)
 * Resource conflict (e.g., duplicate entry)
 */
export class ConflictError extends AppError {
    constructor(message: string = 'Conflict', details?: Record<string, any>) {
        super(message, 409, 'CONFLICT', details);
    }
}

/**
 * Validation Error (422)
 * Validation failed
 */
export class ValidationError extends AppError {
    constructor(message: string = 'Validation Failed', details?: Record<string, any>) {
        super(message, 422, 'VALIDATION_ERROR', details);
    }
}

/**
 * Rate Limit Error (429)
 * Too many requests
 */
export class RateLimitError extends AppError {
    constructor(message: string = 'Too Many Requests', details?: Record<string, any>) {
        super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
    }
}

/**
 * Internal Server Error (500)
 * Unexpected server error
 */
export class InternalServerError extends AppError {
    constructor(message: string = 'Internal Server Error', details?: Record<string, any>) {
        super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    }
}

/**
 * Service Unavailable Error (503)
 * External service unavailable
 */
export class ServiceUnavailableError extends AppError {
    constructor(message: string = 'Service Unavailable', details?: Record<string, any>) {
        super(message, 503, 'SERVICE_UNAVAILABLE', details);
    }
}

