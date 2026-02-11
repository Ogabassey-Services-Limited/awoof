/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user to request
 * Follows Single Responsibility Principle - only handles authentication
 */

import type { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/auth/jwt.service.js';
import { UnauthorizedError } from '../common/errors/AppError.js';

/**
 * Extended Express Request with user data
 */
export type AuthRequest = Request;

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
// JWT format: three base64url segments separated by dots; max length 4096
const JWT_FORMAT = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const MAX_TOKEN_LENGTH = 4096;

export const authenticate = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.substring(7);

        if (!token || token.length > MAX_TOKEN_LENGTH || !JWT_FORMAT.test(token)) {
            throw new UnauthorizedError('Invalid token format');
        }

        const decoded = jwtService.verifyAccessToken(token);

        // Attach user to request (map userId to id for Express compatibility)
        req.user = {
            ...decoded,
            id: decoded.userId,
        };

        next();
    } catch {
        next(new UnauthorizedError('Authentication failed'));
    }
};

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't require it
 */
export const optionalAuth = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token && token.length <= MAX_TOKEN_LENGTH && JWT_FORMAT.test(token)) {
                const decoded = jwtService.verifyAccessToken(token);
                req.user = {
                    ...decoded,
                    id: decoded.userId,
                };
            }
        }
    } catch {
        // Ignore errors - authentication is optional
    }

    next();
};

/**
 * Role-based authorization middleware factory
 */
export const requireRole = (...allowedRoles: string[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new UnauthorizedError('Insufficient permissions'));
        }

        next();
    };
};

