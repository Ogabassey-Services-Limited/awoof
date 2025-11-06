/**
 * Vendor Routes
 * 
 * Handles vendor profile management and file uploads
 */

import { Router } from 'express';
import { asyncHandler } from '../common/middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { VendorController } from '../controllers/vendor.controller.js';
import { upload } from '../config/upload.js';

const router = Router();
const vendorController = new VendorController();

/**
 * @route   POST /api/vendors/upload
 * @desc    Upload vendor files (documents, logo, banner)
 * @access  Private (Vendor)
 */
router.post(
    '/upload',
    authenticate,
    upload.fields([
        { name: 'documentFront', maxCount: 1 },
        { name: 'documentBack', maxCount: 1 },
        { name: 'logoImage', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 },
    ]),
    asyncHandler(vendorController.uploadFiles.bind(vendorController))
);

/**
 * @route   POST /api/vendors/complete-registration
 * @desc    Complete vendor registration with company details
 * @access  Private (Vendor)
 */
router.post(
    '/complete-registration',
    authenticate,
    asyncHandler(vendorController.completeRegistration.bind(vendorController))
);

/**
 * @route   GET /api/vendors/profile
 * @desc    Get vendor profile
 * @access  Private (Vendor)
 */
router.get(
    '/profile',
    authenticate,
    asyncHandler(vendorController.getProfile.bind(vendorController))
);

/**
 * @route   PUT /api/vendors/profile
 * @desc    Update vendor profile
 * @access  Private (Vendor)
 */
router.put(
    '/profile',
    authenticate,
    asyncHandler(vendorController.updateProfile.bind(vendorController))
);

export default router;

