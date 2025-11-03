/**
 * Student Routes
 * 
 * Handles student profile and verification endpoints
 */

import { Router } from 'express';
import { asyncHandler } from '../common/middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { StudentController } from '../controllers/student.controller.js';

const router = Router();
const studentController = new StudentController();

/**
 * @route   GET /api/students/profile
 * @desc    Get current student profile
 * @access  Private (Student only)
 */
router.get(
    '/profile',
    authenticate,
    requireRole('student'),
    asyncHandler(studentController.getProfile.bind(studentController))
);

/**
 * @route   PUT /api/students/profile
 * @desc    Update student profile
 * @access  Private (Student only)
 */
router.put(
    '/profile',
    authenticate,
    requireRole('student'),
    asyncHandler(studentController.updateProfile.bind(studentController))
);

/**
 * @route   GET /api/students/purchases
 * @desc    Get student purchase history
 * @access  Private (Student only)
 */
router.get(
    '/purchases',
    authenticate,
    requireRole('student'),
    asyncHandler(studentController.getPurchases.bind(studentController))
);

/**
 * @route   GET /api/students/savings
 * @desc    Get student savings statistics
 * @access  Private (Student only)
 */
router.get(
    '/savings',
    authenticate,
    requireRole('student'),
    asyncHandler(studentController.getSavings.bind(studentController))
);

export default router;

