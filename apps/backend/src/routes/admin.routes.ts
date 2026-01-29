/**
 * Admin Routes
 * 
 * Handles admin-only endpoints
 */

import { Router } from 'express';
import { asyncHandler } from '../common/middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { adminController } from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories (admin view)
 * @access  Admin
 */
router.get(
    '/categories',
    asyncHandler(adminController.getCategories.bind(adminController))
);

/**
 * @route   GET /api/admin/categories/:id
 * @desc    Get a single category by ID
 * @access  Admin
 */
router.get(
    '/categories/:id',
    asyncHandler(adminController.getCategory.bind(adminController))
);

/**
 * @route   POST /api/admin/categories
 * @desc    Create a new category
 * @access  Admin
 */
router.post(
    '/categories',
    asyncHandler(adminController.createCategory.bind(adminController))
);

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update a category
 * @access  Admin
 */
router.put(
    '/categories/:id',
    asyncHandler(adminController.updateCategory.bind(adminController))
);

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete a category
 * @access  Admin
 */
router.delete(
    '/categories/:id',
    asyncHandler(adminController.deleteCategory.bind(adminController))
);

export default router;


