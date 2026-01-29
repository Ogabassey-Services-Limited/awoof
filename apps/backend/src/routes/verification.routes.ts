/**
 * Verification Routes
 * 
 * Handles student verification endpoints
 */

import { Router } from 'express';
import { asyncHandler } from '../common/middleware/errorHandler.js';
import { VerificationController } from '../controllers/verification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const verificationController = new VerificationController();

/**
 * @route   GET /api/verification/methods/:universityId
 * @desc    Get available verification methods for a university
 * @access  Public
 */
router.get(
    '/methods/:universityId',
    asyncHandler(verificationController.getVerificationMethods.bind(verificationController))
);

/**
 * @route   POST /api/verification/initiate
 * @desc    Initiate verification process (determines best method)
 * @access  Public
 */
router.post(
    '/initiate',
    asyncHandler(verificationController.initiateVerification.bind(verificationController))
);

/**
 * @route   POST /api/verification/email
 * @desc    Request email verification (sends magic link)
 * @access  Public
 */
router.post(
    '/email',
    asyncHandler(verificationController.verifyEmail.bind(verificationController))
);

/**
 * @route   GET /api/verification/email/verify
 * @desc    Verify email via magic link token
 * @access  Public
 */
router.get(
    '/email/verify',
    asyncHandler(verificationController.verifyMagicLink.bind(verificationController))
);

/**
 * @route   POST /api/verification/registration
 * @desc    Verify student via registration number
 * @access  Public
 */
router.post(
    '/registration',
    asyncHandler(verificationController.verifyRegistrationNumber.bind(verificationController))
);

/**
 * @route   POST /api/verification/whatsapp/request
 * @desc    Request WhatsApp OTP
 * @access  Public
 */
router.post(
    '/whatsapp/request',
    asyncHandler(verificationController.requestWhatsAppOTP.bind(verificationController))
);

/**
 * @route   POST /api/verification/whatsapp/verify
 * @desc    Verify WhatsApp OTP
 * @access  Public
 */
router.post(
    '/whatsapp/verify',
    asyncHandler(verificationController.verifyWhatsAppOTP.bind(verificationController))
);

/**
 * @route   GET /api/verification/status/:studentId
 * @desc    Get student verification status
 * @access  Public (could be made private later)
 */
router.get(
    '/status/:studentId',
    asyncHandler(verificationController.getVerificationStatus.bind(verificationController))
);

/**
 * @route   POST /api/verification/widget/token
 * @desc    Generate verification token for widget (for vendor website integration)
 * @access  Private (Student)
 */
router.post(
    '/widget/token',
    authenticate,
    asyncHandler(verificationController.generateWidgetToken.bind(verificationController))
);

export default router;

