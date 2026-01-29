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

// Import additional controllers
import { NotificationController } from '../controllers/notification.controller.js';
import { WebsiteVisitController } from '../controllers/website-visit.controller.js';
import { SupportTicketController } from '../controllers/support-ticket.controller.js';

const notificationController = new NotificationController();
const websiteVisitController = new WebsiteVisitController();
const supportTicketController = new SupportTicketController();

/**
 * @route   GET /api/students/notifications
 * @desc    Get student notifications
 * @access  Private (Student only)
 */
router.get(
    '/notifications',
    authenticate,
    requireRole('student'),
    asyncHandler(notificationController.getNotifications.bind(notificationController))
);

/**
 * @route   PUT /api/students/notifications/read
 * @desc    Mark notifications as read
 * @access  Private (Student only)
 */
router.put(
    '/notifications/read',
    authenticate,
    requireRole('student'),
    asyncHandler(notificationController.markAsRead.bind(notificationController))
);

/**
 * @route   DELETE /api/students/notifications
 * @desc    Delete notifications
 * @access  Private (Student only)
 */
router.delete(
    '/notifications',
    authenticate,
    requireRole('student'),
    asyncHandler(notificationController.deleteNotifications.bind(notificationController))
);

/**
 * @route   POST /api/students/website-visits
 * @desc    Track a website visit
 * @access  Private (Student only)
 */
router.post(
    '/website-visits',
    authenticate,
    requireRole('student'),
    asyncHandler(websiteVisitController.trackVisit.bind(websiteVisitController))
);

/**
 * @route   GET /api/students/website-visits
 * @desc    Get website visits history
 * @access  Private (Student only)
 */
router.get(
    '/website-visits',
    authenticate,
    requireRole('student'),
    asyncHandler(websiteVisitController.getVisits.bind(websiteVisitController))
);

/**
 * @route   POST /api/students/support-tickets
 * @desc    Create a support ticket
 * @access  Private (Student only)
 */
router.post(
    '/support-tickets',
    authenticate,
    requireRole('student'),
    asyncHandler(supportTicketController.createTicket.bind(supportTicketController))
);

/**
 * @route   GET /api/students/support-tickets
 * @desc    Get support tickets
 * @access  Private (Student only)
 */
router.get(
    '/support-tickets',
    authenticate,
    requireRole('student'),
    asyncHandler(supportTicketController.getTickets.bind(supportTicketController))
);

/**
 * @route   GET /api/students/support-tickets/:id
 * @desc    Get a single support ticket with responses
 * @access  Private (Student only)
 */
router.get(
    '/support-tickets/:id',
    authenticate,
    requireRole('student'),
    asyncHandler(supportTicketController.getTicket.bind(supportTicketController))
);

/**
 * @route   POST /api/students/support-tickets/:id/responses
 * @desc    Add a response to a support ticket
 * @access  Private (Student only)
 */
router.post(
    '/support-tickets/:id/responses',
    authenticate,
    requireRole('student'),
    asyncHandler(supportTicketController.addResponse.bind(supportTicketController))
);

export default router;

