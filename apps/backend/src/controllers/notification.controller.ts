/**
 * Notification Controller
 * 
 * Handles notification operations for students
 */

import type { Response } from 'express';
import { db } from '../config/database.js';
import {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} from '../common/errors/AppError.js';
import { success } from '../common/utils/response.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { z } from 'zod';

/**
 * Validation schemas
 */
const markAsReadSchema = z.object({
    notificationIds: z.array(z.string().uuid()).optional(),
    markAll: z.boolean().optional(),
});

const deleteNotificationSchema = z.object({
    notificationIds: z.array(z.string().uuid()).min(1, 'At least one notification ID is required'),
});

/**
 * Notification Controller
 */
export class NotificationController {
    /**
     * Get all notifications for current student
     */
    public async getNotifications(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const offset = (pageNum - 1) * limitNum;

        // Get student ID
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.userId]
        );

        if (studentResult.rows.length === 0) {
            throw new NotFoundError('Student profile not found');
        }

        const studentId = studentResult.rows[0].id;

        // Build query
        let query = `
            SELECT 
                n.id,
                n.title,
                n.message,
                n.type,
                n.read,
                n.metadata,
                n.created_at,
                n.read_at
            FROM notifications n
            WHERE n.student_id = $1
        `;
        const params: (string | number | boolean)[] = [studentId];

        if (unreadOnly === 'true') {
            query += ' AND n.read = false';
        }

        query += ' ORDER BY n.created_at DESC LIMIT $2 OFFSET $3';

        params.push(limitNum, offset);

        const result = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM notifications WHERE student_id = $1';
        const countParams: (string | boolean)[] = [studentId];
        if (unreadOnly === 'true') {
            countQuery += ' AND read = false';
        }
        const countResult = await db.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total, 10);

        // Get unread count
        const unreadCountResult = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE student_id = $1 AND read = false',
            [studentId]
        );
        const unreadCount = parseInt(unreadCountResult.rows[0].count, 10);

        success(res, {
            message: 'Notifications retrieved successfully',
            data: {
                notifications: result.rows.map(row => ({
                    id: row.id,
                    title: row.title,
                    message: row.message,
                    type: row.type,
                    read: row.read,
                    metadata: row.metadata,
                    createdAt: row.created_at,
                    readAt: row.read_at,
                })),
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
                unreadCount,
            },
        });
    }

    /**
     * Mark notifications as read
     */
    public async markAsRead(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        const validated = markAsReadSchema.parse(req.body);

        // Get student ID
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.userId]
        );

        if (studentResult.rows.length === 0) {
            throw new NotFoundError('Student profile not found');
        }

        const studentId = studentResult.rows[0].id;

        if (validated.markAll) {
            // Mark all as read
            await db.query(
                `UPDATE notifications 
                 SET read = true, read_at = CURRENT_TIMESTAMP 
                 WHERE student_id = $1 AND read = false`,
                [studentId]
            );
        } else if (validated.notificationIds && validated.notificationIds.length > 0) {
            // Mark specific notifications as read
            await db.query(
                `UPDATE notifications 
                 SET read = true, read_at = CURRENT_TIMESTAMP 
                 WHERE student_id = $1 AND id = ANY($2::uuid[])`,
                [studentId, validated.notificationIds]
            );
        } else {
            throw new BadRequestError('Either markAll or notificationIds must be provided');
        }

        success(res, {
            message: 'Notifications marked as read',
            data: {},
        });
    }

    /**
     * Delete notifications
     */
    public async deleteNotifications(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        const validated = deleteNotificationSchema.parse(req.body);

        // Get student ID
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.userId]
        );

        if (studentResult.rows.length === 0) {
            throw new NotFoundError('Student profile not found');
        }

        const studentId = studentResult.rows[0].id;

        // Delete notifications
        const result = await db.query(
            `DELETE FROM notifications 
             WHERE student_id = $1 AND id = ANY($2::uuid[])
             RETURNING id`,
            [studentId, validated.notificationIds]
        );

        success(res, {
            message: 'Notifications deleted successfully',
            data: {
                deletedCount: result.rows.length,
            },
        });
    }
}
