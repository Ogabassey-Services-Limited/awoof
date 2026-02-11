/**
 * Authentication Middleware
 *
 * Verifies JWT tokens and attaches user to request. We always call
 * verifyAccessToken (no user-controlled condition guarding it) so CodeQL
 * does not flag a "user-controlled bypass"; the only gate is the crypto check.
 */

import type { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/auth/jwt.service.js';
import { UnauthorizedError } from '../common/errors/AppError.js';

/**
 * Extended Express Request with user data
 */
export type AuthRequest = Request;

/** Extract Bearer token from request; returns empty string if missing/invalid format. */
function getBearerToken(req: Request): string {
    const h = req.headers.authorization;
    if (typeof h !== 'string' || !h.startsWith('Bearer ')) return '';
    return h.substring(7);
}

export const authenticate = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void => {
    const token = getBearerToken(req);
    try {
        const decoded = jwtService.verifyAccessToken(token);
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
 * Optional authentication: try to verify and attach user; ignore failures.
 * Always calls verifyAccessToken (no user-controlled if guarding it).
 */
export const optionalAuth = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void => {
    const token = getBearerToken(req);
    try {
        const decoded = jwtService.verifyAccessToken(token);
        req.user = {
            ...decoded,
            id: decoded.userId,
        };
    } catch {
        // Invalid or expired – optional auth, ignore
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

