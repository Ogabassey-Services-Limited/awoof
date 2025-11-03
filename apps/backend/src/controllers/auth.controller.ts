/**
 * Authentication Controller
 * 
 * Handles authentication business logic
 * Follows Single Responsibility Principle - only handles auth operations
 */

import type { Request, Response } from 'express';
import { db } from '../config/database.js';
import { redis } from '../config/redis.js';
import { jwtService } from '../services/auth/jwt.service.js';
import { passwordService } from '../services/auth/password.service.js';
import { generateOTP, getOTPExpiryDate, isOTPExpired } from '../services/auth/otp.service.js';
import { sendPasswordResetOTP } from '../services/email/email.service.js';
import {
    BadRequestError,
    UnauthorizedError,
    ConflictError,
} from '../common/errors/AppError.js';
import { success } from '../common/utils/response.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { z } from 'zod';

/**
 * Validation schemas
 */
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['student', 'vendor'], {
        errorMap: () => ({ message: 'Role must be student or vendor' }),
    }),
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Authentication Controller
 */
export class AuthController {
    /**
     * Register a new user
     */
    public async register(req: Request, res: Response): Promise<void> {
        // Validate input
        const validated = registerSchema.parse(req.body);

        // Validate password strength
        const passwordValidation = passwordService.validatePassword(
            validated.password
        );
        if (!passwordValidation.valid) {
            throw new BadRequestError(
                passwordValidation.errors.join(', ')
            );
        }

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
            [validated.email]
        );

        if (existingUser.rows.length > 0) {
            throw new ConflictError('User with this email already exists');
        }

        // Hash password
        const passwordHash = await passwordService.hashPassword(validated.password);

        // Start transaction (in case we need to rollback)
        const client = await db.getPool().connect();

        try {
            await client.query('BEGIN');

            // Create user
            const userResult = await client.query(
                `INSERT INTO users (email, password_hash, role, verification_status)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, email, role, verification_status, created_at`,
                [validated.email, passwordHash, validated.role, 'unverified']
            );

            const user = userResult.rows[0];

            // Create student or vendor profile if needed
            if (validated.role === 'student') {
                await client.query(
                    `INSERT INTO students (user_id, name, status)
                     VALUES ($1, $2, 'active')`,
                    [user.id, validated.name]
                );
            } else if (validated.role === 'vendor') {
                await client.query(
                    `INSERT INTO vendors (user_id, name, status)
                     VALUES ($1, $2, 'pending')`,
                    [user.id, validated.name]
                );
            }

            await client.query('COMMIT');

            // Generate tokens
            const tokens = jwtService.generateTokenPair({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            // Store refresh token in Redis (optional, for token invalidation)
            const redisClient = redis.getClient();
            if (redis.isConnected()) {
                await redisClient.setex(
                    `refresh_token:${user.id}`,
                    7 * 24 * 60 * 60, // 7 days in seconds
                    tokens.refreshToken
                );
            }

            success(res, {
                message: 'User registered successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        verificationStatus: user.verification_status,
                    },
                    tokens,
                },
            }, 201);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Login user
     */
    public async login(req: Request, res: Response): Promise<void> {
        // Validate input
        const validated = loginSchema.parse(req.body);

        // Find user
        const userResult = await db.query(
            `SELECT id, email, password_hash, role, verification_status, deleted_at
             FROM users
             WHERE email = $1`,
            [validated.email]
        );

        if (userResult.rows.length === 0) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const user = userResult.rows[0];

        // Check if user is deleted
        if (user.deleted_at) {
            throw new UnauthorizedError('Account has been deleted');
        }

        // Verify password
        const isPasswordValid = await passwordService.comparePassword(
            validated.password,
            user.password_hash
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Generate tokens
        const tokens = jwtService.generateTokenPair({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Store refresh token in Redis
        const redisClient = redis.getClient();
        if (redis.isConnected()) {
            await redisClient.setex(
                `refresh_token:${user.id}`,
                7 * 24 * 60 * 60, // 7 days
                tokens.refreshToken
            );
        }

        success(res, {
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    verificationStatus: user.verification_status,
                },
                tokens,
            },
        });
    }

    /**
     * Refresh access token
     */
    public async refreshToken(req: Request, res: Response): Promise<void> {
        // Validate input
        const validated = refreshTokenSchema.parse(req.body);

        // Verify refresh token
        let decoded;
        try {
            decoded = jwtService.verifyRefreshToken(validated.refreshToken);
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        // Check if refresh token exists in Redis (optional validation)
        const redisClient = redis.getClient();
        if (redis.isConnected()) {
            const storedToken = await redisClient.get(`refresh_token:${decoded.userId}`);
            if (storedToken !== validated.refreshToken) {
                throw new UnauthorizedError('Refresh token not found or invalid');
            }
        }

        // Generate new access token
        const accessToken = jwtService.generateAccessToken({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        });

        success(res, {
            message: 'Token refreshed successfully',
            data: {
                accessToken,
            },
        });
    }

    /**
     * Logout user
     */
    public async logout(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        // Remove refresh token from Redis
        const redisClient = redis.getClient();
        if (redis.isConnected()) {
            await redisClient.del(`refresh_token:${req.user.userId}`);
        }

        success(res, {
            message: 'Logged out successfully',
            data: {},
        });
    }

    /**
     * Get current user
     */
    public async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        // Get user details
        const userResult = await db.query(
            `SELECT id, email, role, verification_status, created_at
             FROM users
             WHERE id = $1 AND deleted_at IS NULL`,
            [req.user.userId]
        );

        if (userResult.rows.length === 0) {
            throw new UnauthorizedError('User not found');
        }

        const user = userResult.rows[0];

        // Get additional profile data based on role
        let profile = null;
        if (user.role === 'student') {
            const studentResult = await db.query(
                'SELECT name, university, registration_number FROM students WHERE user_id = $1',
                [user.id]
            );
            profile = studentResult.rows[0] || null;
        } else if (user.role === 'vendor') {
            const vendorResult = await db.query(
                'SELECT name, status FROM vendors WHERE user_id = $1',
                [user.id]
            );
            profile = vendorResult.rows[0] || null;
        }

        success(res, {
            message: 'User retrieved successfully',
            data: {
                user: {
                    ...user,
                    profile,
                },
            },
        }, 200);
    }

    /**
     * Forgot password - Send OTP
     */
    public async forgotPassword(req: Request, res: Response): Promise<void> {
        // Validate input
        const { email } = req.body;

        if (!email) {
            throw new BadRequestError('Email is required');
        }

        // Find user
        const userResult = await db.query(
            `SELECT id, email FROM users WHERE email = $1 AND deleted_at IS NULL`,
            [email]
        );

        // Don't reveal if email exists (security best practice)
        if (userResult.rows.length === 0) {
            success(res, {
                message: 'If the email exists, an OTP has been sent',
                data: {},
            });
            return;
        }

        const user = userResult.rows[0];

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = getOTPExpiryDate();

        // Store OTP in database
        await db.query(
            `UPDATE users 
             SET password_reset_otp = $1, password_reset_otp_expires_at = $2 
             WHERE id = $3`,
            [otp, expiresAt, user.id]
        );

        // Send OTP via email
        const emailResult = await sendPasswordResetOTP(user.email, otp);

        if (!emailResult.success) {
            console.error('Failed to send OTP email:', emailResult.error);
            // Still return success to user (security - don't reveal if email failed)
        }

        success(res, {
            message: 'If the email exists, an OTP has been sent',
            data: {},
        });
    }

    /**
     * Verify OTP for password reset
     */
    public async verifyResetOTP(req: Request, res: Response): Promise<void> {
        // Validate input
        const schema = z.object({
            email: z.string().email('Invalid email address'),
            otp: z.string().length(6, 'OTP must be 6 digits'),
        });

        const validated = schema.parse(req.body);

        // Find user with valid OTP
        const userResult = await db.query(
            `SELECT id, email, password_reset_otp, password_reset_otp_expires_at
             FROM users 
             WHERE email = $1 
               AND password_reset_otp = $2 
               AND deleted_at IS NULL`,
            [validated.email, validated.otp]
        );

        if (userResult.rows.length === 0) {
            throw new UnauthorizedError('Invalid OTP');
        }

        const user = userResult.rows[0];

        // Check if OTP is expired
        if (isOTPExpired(user.password_reset_otp_expires_at)) {
            throw new UnauthorizedError('OTP has expired. Please request a new one.');
        }

        // OTP is valid - generate a reset token (JWT) for password reset
        const resetToken = jwtService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: 'student', // Default, will be verified when resetting
        });

        // Store reset token in Redis (optional, for additional security)
        const redisClient = redis.getClient();
        if (redis.isConnected()) {
            await redisClient.setex(
                `password_reset:${user.id}`,
                10 * 60, // 10 minutes
                resetToken
            );
        }

        success(res, {
            message: 'OTP verified successfully',
            data: {
                resetToken,
            },
        });
    }

    /**
     * Reset password with OTP
     */
    public async resetPassword(req: Request, res: Response): Promise<void> {
        // Validate input
        const schema = z.object({
            email: z.string().email('Invalid email address'),
            otp: z.string().length(6, 'OTP must be 6 digits'),
            newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        });

        const validated = schema.parse(req.body);

        // Validate password strength
        const passwordValidation = passwordService.validatePassword(validated.newPassword);
        if (!passwordValidation.valid) {
            throw new BadRequestError(passwordValidation.errors.join(', '));
        }

        // Find user with valid OTP
        const userResult = await db.query(
            `SELECT id, email, password_reset_otp, password_reset_otp_expires_at
             FROM users 
             WHERE email = $1 
               AND password_reset_otp = $2 
               AND deleted_at IS NULL`,
            [validated.email, validated.otp]
        );

        if (userResult.rows.length === 0) {
            throw new UnauthorizedError('Invalid OTP');
        }

        const user = userResult.rows[0];

        // Check if OTP is expired
        if (isOTPExpired(user.password_reset_otp_expires_at)) {
            throw new UnauthorizedError('OTP has expired. Please request a new one.');
        }

        // Hash new password
        const passwordHash = await passwordService.hashPassword(validated.newPassword);

        // Update password and clear OTP
        await db.query(
            `UPDATE users 
             SET password_hash = $1, 
                 password_reset_otp = NULL, 
                 password_reset_otp_expires_at = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [passwordHash, user.id]
        );

        // Invalidate all refresh tokens (force re-login)
        const redisClient = redis.getClient();
        if (redis.isConnected()) {
            await redisClient.del(`refresh_token:${user.id}`);
            await redisClient.del(`password_reset:${user.id}`);
        }

        success(res, {
            message: 'Password reset successfully',
            data: {},
        });
    }

    /**
     * Update password (requires old password)
     */
    public async updatePassword(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        // Validate input
        const schema = z.object({
            oldPassword: z.string().min(1, 'Old password is required'),
            newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        });

        const validated = schema.parse(req.body);

        // Validate new password strength
        const passwordValidation = passwordService.validatePassword(validated.newPassword);
        if (!passwordValidation.valid) {
            throw new BadRequestError(passwordValidation.errors.join(', '));
        }

        // Get user with password hash
        const userResult = await db.query(
            `SELECT id, password_hash FROM users WHERE id = $1 AND deleted_at IS NULL`,
            [req.user.userId]
        );

        if (userResult.rows.length === 0) {
            throw new UnauthorizedError('User not found');
        }

        const user = userResult.rows[0];

        // Verify old password
        const isPasswordValid = await passwordService.comparePassword(
            validated.oldPassword,
            user.password_hash
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError('Old password is incorrect');
        }

        // Hash new password
        const passwordHash = await passwordService.hashPassword(validated.newPassword);

        // Update password
        await db.query(
            `UPDATE users 
             SET password_hash = $1, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [passwordHash, user.id]
        );

        // Invalidate all refresh tokens (force re-login with new password)
        const redisClient = redis.getClient();
        if (redis.isConnected()) {
            await redisClient.del(`refresh_token:${req.user.userId}`);
        }

        success(res, {
            message: 'Password updated successfully',
            data: {},
        });
    }
}

