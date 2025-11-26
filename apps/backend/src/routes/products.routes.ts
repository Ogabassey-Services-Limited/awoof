/**
 * Products Routes
 * 
 * Handles public product endpoints
 */

import { Router } from 'express';
import { asyncHandler } from '../common/middleware/errorHandler.js';
import { db } from '../config/database.js';
import { success } from '../common/utils/response.js';

const router = Router();

/**
 * @route   GET /api/products/categories
 * @desc    Get all product categories
 * @access  Public
 */
router.get(
    '/categories',
    asyncHandler(async (req, res) => {
        const result = await db.query(
            'SELECT id, name, description, slug FROM categories ORDER BY name ASC'
        );

        success(res, {
            message: 'Categories retrieved successfully',
            data: result.rows,
        });
    })
);

export default router;

