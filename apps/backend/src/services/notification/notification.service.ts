/**
 * Notification Service
 * 
 * Handles creation and management of notifications for students
 */

import { db } from '../../config/database.js';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface CreateNotificationParams {
    studentId: string;
    title: string;
    message: string;
    type?: NotificationType;
    metadata?: Record<string, unknown>;
}

/**
 * Notification Service
 */
export class NotificationService {
    /**
     * Create a notification for a student
     */
    public static async createNotification(params: CreateNotificationParams): Promise<void> {
        const { studentId, title, message, type = 'info', metadata } = params;

        await db.query(
            `INSERT INTO notifications (
                student_id,
                title,
                message,
                type,
                metadata
            ) VALUES ($1, $2, $3, $4, $5)`,
            [studentId, title, message, type, metadata ? JSON.stringify(metadata) : null]
        );
    }

    /**
     * Create notifications for multiple students
     */
    public static async createBulkNotifications(
        studentIds: string[],
        title: string,
        message: string,
        type: NotificationType = 'info',
        metadata?: Record<string, unknown>
    ): Promise<void> {
        if (studentIds.length === 0) return;

        const values = studentIds.map((_, index) => {
            const baseIndex = index * 5;
            return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`;
        }).join(', ');

        const params: (string | null)[] = [];
        studentIds.forEach(studentId => {
            params.push(studentId, title, message, type, metadata ? JSON.stringify(metadata) : null);
        });

        await db.query(
            `INSERT INTO notifications (
                student_id,
                title,
                message,
                type,
                metadata
            ) VALUES ${values}`,
            params
        );
    }

    /**
     * Create notification for purchase confirmation
     */
    public static async notifyPurchaseConfirmation(
        studentId: string,
        productName: string,
        amount: number,
        discount: number,
        transactionId: string
    ): Promise<void> {
        await this.createNotification({
            studentId,
            title: 'Purchase Confirmed',
            message: `Your purchase of ${productName} has been confirmed. Receipt sent to your email.`,
            type: 'success',
            metadata: {
                transactionId,
                productName,
                amount,
                discount,
            },
        });
    }

    /**
     * Create notification for savings milestone
     */
    public static async notifySavingsMilestone(
        studentId: string,
        totalSavings: number
    ): Promise<void> {
        // Define milestone thresholds
        const milestones = [1000, 5000, 10000, 25000, 50000, 100000];
        const milestone = milestones.find(m => totalSavings >= m && totalSavings < m * 2);

        if (milestone) {
            await this.createNotification({
                studentId,
                title: 'Savings Milestone',
                message: `Congratulations! You have saved over ₦${milestone.toLocaleString()}`,
                type: 'success',
                metadata: {
                    milestone,
                    totalSavings,
                },
            });
        }
    }

    /**
     * Create notification for new deal/product
     */
    public static async notifyNewDeal(
        studentId: string,
        productName: string,
        categoryName: string,
        productId: string
    ): Promise<void> {
        await this.createNotification({
            studentId,
            title: 'New Deal Available',
            message: `A new discount is available for ${categoryName} category`,
            type: 'info',
            metadata: {
                productId,
                productName,
                categoryName,
            },
        });
    }

    /**
     * Create notification for verification success
     */
    public static async notifyVerificationSuccess(
        studentId: string
    ): Promise<void> {
        await this.createNotification({
            studentId,
            title: 'Verification Successful',
            message: 'Your student verification has been completed successfully!',
            type: 'success',
            metadata: {
                event: 'verification_success',
            },
        });
    }

    /**
     * Create notification for support ticket response
     */
    public static async notifySupportTicketResponse(
        studentId: string,
        ticketId: string,
        ticketSubject: string
    ): Promise<void> {
        await this.createNotification({
            studentId,
            title: 'Support Ticket Update',
            message: `You have a new response on your ticket: ${ticketSubject}`,
            type: 'info',
            metadata: {
                ticketId,
                ticketSubject,
            },
        });
    }
}
