/**
 * JWT Service
 * 
 * Handles JWT token generation and validation
 * Follows Single Responsibility Principle - only handles JWT operations
 */

import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../../config/env.js';

/**
 * Token payload interface
 */
export interface TokenPayload {
    userId: string;
    email: string;
    role: 'student' | 'vendor' | 'admin';
}

/**
 * Token pair
 */
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

/**
 * Decoded token
 */
export interface DecodedToken extends TokenPayload {
    id: string; // Alias for userId (Express Request.user expects 'id')
    iat?: number;
    exp?: number;
}

/**
 * JWT Service
 * Handles all JWT operations
 */
class JWTService {
    /**
     * Generate access token
     */
    public generateAccessToken(payload: TokenPayload): string {
        const secret = config.jwt.secret;
        const expiry = config.jwt.expiry;
        if (!secret || !expiry) {
            throw new Error('JWT secret or expiry not configured');
        }
        const options: SignOptions = {
            expiresIn: expiry as any,
        };
        return jwt.sign(payload, secret, options);
    }

    /**
     * Generate refresh token
     */
    public generateRefreshToken(payload: TokenPayload): string {
        const secret = config.jwt.refreshSecret;
        const expiry = config.jwt.refreshExpiry;
        if (!secret || !expiry) {
            throw new Error('JWT refresh secret or expiry not configured');
        }
        const options: SignOptions = {
            expiresIn: expiry as any,
        };
        return jwt.sign(payload, secret, options);
    }

    /**
     * Generate token pair (access + refresh)
     */
    public generateTokenPair(payload: TokenPayload): TokenPair {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    }

    /**
     * Verify access token
     */
    public verifyAccessToken(token: string): DecodedToken {
        try {
            return jwt.verify(token, config.jwt.secret) as DecodedToken;
        } catch (error) {
            throw new Error('Invalid or expired access token');
        }
    }

    /**
     * Verify refresh token
     */
    public verifyRefreshToken(token: string): DecodedToken {
        try {
            return jwt.verify(token, config.jwt.refreshSecret) as DecodedToken;
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    /**
     * Decode token without verification (for debugging)
     */
    public decodeToken(token: string): DecodedToken | null {
        try {
            return jwt.decode(token) as DecodedToken | null;
        } catch (error) {
            return null;
        }
    }
}

export const jwtService = new JWTService();

