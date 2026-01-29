/**
 * Vendor Support Ticket Controller
 * 
 * Handles support ticket operations for vendors
 */

import type { Response } from 'express';
import { db } from '../config/database.js';
import {
    NotFoundError,
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
    category: z.enum(['general', 'technical', 'billing', 'account', 'integration', 'product']).default('general'),
});

const addResponseSchema = z.object({
    message: z.string().min(1, 'Message is required'),
    isInternal: z.boolean().default(false),
});

/**
 * Vendor Support Ticket Controller
 */
export class VendorSupportController {
    /**
     * Create a new support ticket
     */
    public async createTicket(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user || req.user.role !== 'vendor') {
            throw new UnauthorizedError('Only vendors can create support tickets');
        }

        const validated = createTicketSchema.parse(req.body);

        // Get vendor ID
        const vendorResult = await db.query(
            'SELECT id FROM vendors WHERE user_id = $1 AND deleted_at IS NULL',
            [req.user.userId]
        );

        if (vendorResult.rows.length === 0) {
            throw new NotFoundError('Vendor profile not found');
        }

        const vendorId = vendorResult.rows[0].id;

        // Create ticket
        const result = await db.query(
            `INSERT INTO vendor_support_tickets (
                vendor_id,
                subject,
                message,
                category
            ) VALUES ($1, $2, $3, $4)
            RETURNING id, status, created_at`,
            [vendorId, validated.subject, validated.message, validated.category]
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
     * Get all tickets for current vendor
     */
    public async getTickets(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user || req.user.role !== 'vendor') {
            throw new UnauthorizedError('Only vendors can view their support tickets');
        }

        // Get vendor ID
        const vendorResult = await db.query(
            'SELECT id FROM vendors WHERE user_id = $1 AND deleted_at IS NULL',
            [req.user.userId]
        );

        if (vendorResult.rows.length === 0) {
            throw new NotFoundError('Vendor profile not found');
        }

        const vendorId = vendorResult.rows[0].id;

        // Get query parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        // Build query
        let query = `
            SELECT id, subject, message, category, status, created_at, updated_at
            FROM vendor_support_tickets
            WHERE vendor_id = $1
        `;
        const values: (string | number)[] = [vendorId];
        let paramCount = 2;

        if (status) {
            query += ` AND status = $${paramCount}`;
            values.push(status);
            paramCount++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await db.query(query, values);

        // Get total count
        let countQuery = `
            SELECT COUNT(*) as total
            FROM vendor_support_tickets
            WHERE vendor_id = $1
        `;
        const countValues: (string | number)[] = [vendorId];
        let countParamCount = 2;

        if (status) {
            countQuery += ` AND status = $${countParamCount}`;
            countValues.push(status);
            countParamCount++;
        }

        const countResult = await db.query(countQuery, countValues);
        const total = parseInt(countResult.rows[0].total);

        success(res, {
            message: 'Support tickets retrieved successfully',
            data: {
                tickets: result.rows.map(row => ({
                    id: row.id,
                    subject: row.subject,
                    message: row.message,
                    category: row.category,
                    status: row.status,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    }

    /**
     * Get a single ticket with responses
     */
    public async getTicket(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user || req.user.role !== 'vendor') {
            throw new UnauthorizedError('Only vendors can view support tickets');
        }

        // Get vendor ID
        const vendorResult = await db.query(
            'SELECT id FROM vendors WHERE user_id = $1 AND deleted_at IS NULL',
            [req.user.userId]
        );

        if (vendorResult.rows.length === 0) {
            throw new NotFoundError('Vendor profile not found');
        }

        const vendorId = vendorResult.rows[0].id;
        const ticketId = req.params.id;

        // Get ticket
        const ticketResult = await db.query(
            `SELECT id, subject, message, category, status, admin_notes, created_at, updated_at, resolved_at
             FROM vendor_support_tickets
             WHERE id = $1 AND vendor_id = $2`,
            [ticketId, vendorId]
        );

        if (ticketResult.rows.length === 0) {
            throw new NotFoundError('Support ticket not found');
        }

        const ticket = ticketResult.rows[0];

        // Get responses (exclude internal notes for vendors)
        const responsesResult = await db.query(
            `SELECT r.id, r.message, r.user_role, r.created_at, r.is_internal,
                    u.email as user_email
             FROM vendor_support_ticket_responses r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.ticket_id = $1 AND (r.is_internal = false OR r.user_role = 'vendor')
             ORDER BY r.created_at ASC`,
            [ticketId]
        );

        success(res, {
            message: 'Support ticket retrieved successfully',
            data: {
                ticket: {
                    ...ticket,
                    responses: responsesResult.rows,
                },
            },
        });
    }

    /**
     * Add a response to a ticket
     */
    public async addResponse(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user || req.user.role !== 'vendor') {
            throw new UnauthorizedError('Only vendors can respond to support tickets');
        }

        // Get vendor ID
        const vendorResult = await db.query(
            'SELECT id FROM vendors WHERE user_id = $1 AND deleted_at IS NULL',
            [req.user.userId]
        );

        if (vendorResult.rows.length === 0) {
            throw new NotFoundError('Vendor profile not found');
        }

        const vendorId = vendorResult.rows[0].id;
        const ticketId = req.params.id;

        const validated = addResponseSchema.parse(req.body);

        // Verify ticket belongs to vendor
        const ticketResult = await db.query(
            'SELECT id, status FROM vendor_support_tickets WHERE id = $1 AND vendor_id = $2',
            [ticketId, vendorId]
        );

        if (ticketResult.rows.length === 0) {
            throw new NotFoundError('Support ticket not found');
        }

        // Add response
        const result = await db.query(
            `INSERT INTO vendor_support_ticket_responses (
                ticket_id,
                user_id,
                user_role,
                message,
                is_internal
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING id, message, user_role, created_at`,
            [
                ticketId,
                req.user.userId,
                'vendor',
                validated.message,
                false, // Vendors cannot create internal notes
            ]
        );

        // Update ticket updated_at
        await db.query(
            'UPDATE vendor_support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [ticketId]
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
