/**
 * Authentication Routes
 * 
 * Handles user registration, login, and token refresh
 */

import { Router } from 'express';
import { asyncHandler } from '../common/middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthController } from '../controllers/auth.controller.js';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    '/register',
    asyncHandler(authController.register.bind(authController))
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get tokens
 * @access  Public
 */
router.post(
    '/login',
    asyncHandler(authController.login.bind(authController))
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (but requires refresh token)
 */
router.post(
    '/refresh',
    asyncHandler(authController.refreshToken.bind(authController))
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
router.post(
    '/logout',
    authenticate,
    asyncHandler(authController.logout.bind(authController))
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get(
    '/me',
    authenticate,
    asyncHandler(authController.getCurrentUser.bind(authController))
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP for password reset
 * @access  Public
 */
router.post(
    '/forgot-password',
    asyncHandler(authController.forgotPassword.bind(authController))
);

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Verify OTP for password reset
 * @access  Public
 */
router.post(
    '/verify-reset-otp',
    asyncHandler(authController.verifyResetOTP.bind(authController))
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post(
    '/reset-password',
    asyncHandler(authController.resetPassword.bind(authController))
);

/**
 * @route   POST /api/auth/update-password
 * @desc    Update password (requires old password)
 * @access  Private
 */
router.post(
    '/update-password',
    authenticate,
    asyncHandler(authController.updatePassword.bind(authController))
);

export default router;

