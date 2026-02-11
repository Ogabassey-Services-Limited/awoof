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
export const authenticate = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            throw new UnauthorizedError('Token is required');
        }

        // Verify token
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
            const decoded = jwtService.verifyAccessToken(token);
            req.user = {
                ...decoded,
                id: decoded.userId,
            };
        }
    } catch (error) {
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

