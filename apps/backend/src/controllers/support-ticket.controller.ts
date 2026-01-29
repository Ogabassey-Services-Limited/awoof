/**
 * Support Ticket Controller
 * 
 * Handles support ticket operations for students
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
const createTicketSchema = z.object({
    subject: z.string().min(1, 'Subject is required').max(255, 'Subject too long'),
    message: z.string().min(1, 'Message is required'),
    category: z.enum(['general', 'technical', 'billing', 'account']).default('general'),
});

const addResponseSchema = z.object({
    message: z.string().min(1, 'Message is required'),
    isInternal: z.boolean().default(false),
});

/**
 * Support Ticket Controller
 */
export class SupportTicketController {
    /**
     * Create a new support ticket
     */
    public async createTicket(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        const validated = createTicketSchema.parse(req.body);

        // Get student ID
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.userId]
        );

        if (studentResult.rows.length === 0) {
            throw new NotFoundError('Student profile not found');
        }

        const studentId = studentResult.rows[0].id;

        // Create ticket
        const result = await db.query(
            `INSERT INTO support_tickets (
                student_id,
                subject,
                message,
                category
            ) VALUES ($1, $2, $3, $4)
            RETURNING id, status, created_at`,
            [studentId, validated.subject, validated.message, validated.category]
        );

        const ticket = result.rows[0];

        success(res, {
            message: 'Support ticket created successfully',
            data: {
                ticket: {
                    id: ticket.id,
                    subject: validated.subject,
                    message: validated.message,
                    category: validated.category,
                    status: ticket.status,
                    createdAt: ticket.created_at,
                },
            },
        }, 201);
    }

    /**
     * Get all tickets for current student
     */
    public async getTickets(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        const { page = 1, limit = 20, status } = req.query;
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
                t.id,
                t.subject,
                t.message,
                t.category,
                t.status,
                t.priority,
                t.created_at,
                t.updated_at,
                t.resolved_at,
                COUNT(r.id) as response_count
            FROM support_tickets t
            LEFT JOIN support_ticket_responses r ON t.id = r.ticket_id AND r.is_internal = false
            WHERE t.student_id = $1
        `;
        const params: (string | number)[] = [studentId];

        if (status && typeof status === 'string') {
            query += ' AND t.status = $2';
            params.push(status);
            query += ' ORDER BY t.created_at DESC LIMIT $3 OFFSET $4';
            params.push(limitNum, offset);
        } else {
            query += ' ORDER BY t.created_at DESC LIMIT $2 OFFSET $3';
            params.push(limitNum, offset);
        }

        query += ' GROUP BY t.id';

        const result = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM support_tickets WHERE student_id = $1';
        const countParams: (string | number)[] = [studentId];
        if (status && typeof status === 'string') {
            countQuery += ' AND status = $2';
            countParams.push(status);
        }
        const countResult = await db.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total, 10);

        success(res, {
            message: 'Support tickets retrieved successfully',
            data: {
                tickets: result.rows.map(row => ({
                    id: row.id,
                    subject: row.subject,
                    message: row.message,
                    category: row.category,
                    status: row.status,
                    priority: row.priority,
                    responseCount: parseInt(row.response_count) || 0,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                    resolvedAt: row.resolved_at,
                })),
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    }

    /**
     * Get a single ticket with responses
     */
    public async getTicket(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        const { id } = req.params;

        // Get student ID
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.userId]
        );

        if (studentResult.rows.length === 0) {
            throw new NotFoundError('Student profile not found');
        }

        const studentId = studentResult.rows[0].id;

        // Get ticket
        const ticketResult = await db.query(
            `SELECT 
                t.id,
                t.subject,
                t.message,
                t.category,
                t.status,
                t.priority,
                t.created_at,
                t.updated_at,
                t.resolved_at
            FROM support_tickets t
            WHERE t.id = $1 AND t.student_id = $2`,
            [id, studentId]
        );

        if (ticketResult.rows.length === 0) {
            throw new NotFoundError('Support ticket not found');
        }

        const ticket = ticketResult.rows[0];

        // Get responses (excluding internal notes for students)
        const responsesResult = await db.query(
            `SELECT 
                r.id,
                r.message,
                r.user_role,
                r.is_internal,
                r.created_at,
                u.email
            FROM support_ticket_responses r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.ticket_id = $1 AND r.is_internal = false
            ORDER BY r.created_at ASC`,
            [id]
        );

        success(res, {
            message: 'Support ticket retrieved successfully',
            data: {
                ticket: {
                    id: ticket.id,
                    subject: ticket.subject,
                    message: ticket.message,
                    category: ticket.category,
                    status: ticket.status,
                    priority: ticket.priority,
                    createdAt: ticket.created_at,
                    updatedAt: ticket.updated_at,
                    resolvedAt: ticket.resolved_at,
                    responses: responsesResult.rows.map(row => ({
                        id: row.id,
                        message: row.message,
                        userRole: row.user_role,
                        userEmail: row.email,
                        createdAt: row.created_at,
                    })),
                },
            },
        });
    }

    /**
     * Add a response to a ticket
     */
    public async addResponse(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        const { id } = req.params;
        const validated = addResponseSchema.parse(req.body);

        // Get student ID
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.userId]
        );

        if (studentResult.rows.length === 0) {
            throw new NotFoundError('Student profile not found');
        }

        const studentId = studentResult.rows[0].id;

        // Verify ticket belongs to student
        const ticketResult = await db.query(
            'SELECT id, status FROM support_tickets WHERE id = $1 AND student_id = $2',
            [id, studentId]
        );

        if (ticketResult.rows.length === 0) {
            throw new NotFoundError('Support ticket not found');
        }

        const ticket = ticketResult.rows[0];

        // Don't allow responses to closed tickets
        if (ticket.status === 'closed') {
            throw new BadRequestError('Cannot add response to a closed ticket');
        }

        // Add response
        const result = await db.query(
            `INSERT INTO support_ticket_responses (
                ticket_id,
                user_id,
                user_role,
                message,
                is_internal
            ) VALUES ($1, $2, 'student', $3, $4)
            RETURNING id, created_at`,
            [id, req.user.userId, validated.message, validated.isInternal]
        );

        // Update ticket updated_at
        await db.query(
            'UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );

        success(res, {
            message: 'Response added successfully',
            data: {
                response: {
                    id: result.rows[0].id,
                    message: validated.message,
                    createdAt: result.rows[0].created_at,
                },
            },
        }, 201);
    }
}
