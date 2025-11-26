/**
 * Vendor Routes
 * 
 * Handles vendor profile management and file uploads
 */

import { Router } from 'express';
import { asyncHandler } from '../common/middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { VendorController } from '../controllers/vendor.controller.js';
import { ProductController } from '../controllers/product.controller.js';
import { OrderController } from '../controllers/order.controller.js';
import { upload } from '../config/upload.js';

const router = Router();
const vendorController = new VendorController();
const productController = new ProductController();
const orderController = new OrderController();

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

/**
 * Product Management Routes
 */

/**
 * @route   GET /api/vendors/products
 * @desc    Get all products for the vendor
 * @access  Private (Vendor)
 */
router.get(
    '/products',
    authenticate,
    asyncHandler(productController.getProducts.bind(productController))
);

/**
 * @route   GET /api/vendors/products/:id
 * @desc    Get a single product by ID
 * @access  Private (Vendor)
 */
router.get(
    '/products/:id',
    authenticate,
    asyncHandler(productController.getProduct.bind(productController))
);

/**
 * @route   POST /api/vendors/products
 * @desc    Create a new product
 * @access  Private (Vendor)
 */
router.post(
    '/products',
    authenticate,
    upload.single('productImage'),
    asyncHandler(productController.createProduct.bind(productController))
);

/**
 * @route   PUT /api/vendors/products/:id
 * @desc    Update a product
 * @access  Private (Vendor)
 */
router.put(
    '/products/:id',
    authenticate,
    upload.single('productImage'),
    asyncHandler(productController.updateProduct.bind(productController))
);

/**
 * @route   DELETE /api/vendors/products/:id
 * @desc    Delete a product (soft delete)
 * @access  Private (Vendor)
 */
router.delete(
    '/products/:id',
    authenticate,
    asyncHandler(productController.deleteProduct.bind(productController))
);

/**
 * @route   POST /api/vendors/products/sync
 * @desc    Trigger product sync from vendor API
 * @access  Private (Vendor)
 */
router.post(
    '/products/sync',
    authenticate,
    asyncHandler(productController.syncProducts.bind(productController))
);

/**
 * @route   GET /api/vendors/orders
 * @desc    Get all orders for the vendor
 * @access  Private (Vendor)
 */
router.get(
    '/orders',
    authenticate,
    asyncHandler(orderController.getOrders.bind(orderController))
);

/**
 * @route   GET /api/vendors/orders/:id
 * @desc    Get a single order by ID
 * @access  Private (Vendor)
 */
router.get(
    '/orders/:id',
    authenticate,
    asyncHandler(orderController.getOrder.bind(orderController))
);

/**
 * @route   PUT /api/vendors/orders/:id/status
 * @desc    Update order status
 * @access  Private (Vendor)
 */
router.put(
    '/orders/:id/status',
    authenticate,
    asyncHandler(orderController.updateOrderStatus.bind(orderController))
);

export default router;

