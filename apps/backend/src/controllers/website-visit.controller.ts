/**
 * Website Visit Controller
 * 
 * Handles website visit tracking for students
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
const trackVisitSchema = z.object({
    productId: z.string().uuid().optional(),
    url: z.string().url('Invalid URL').max(500, 'URL too long'),
});

/**
 * Website Visit Controller
 */
export class WebsiteVisitController {
    /**
     * Track a website visit
     */
    public async trackVisit(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        const validated = trackVisitSchema.parse(req.body);

        // Get student ID
        const studentResult = await db.query(
            'SELECT id FROM students WHERE user_id = $1',
            [req.user.userId]
        );

        if (studentResult.rows.length === 0) {
            throw new NotFoundError('Student profile not found');
        }

        const studentId = studentResult.rows[0].id;

        // Get product and vendor info if productId is provided
        let productInfo = null;
        let vendorId: string | null = null;
        let vendorName: string | null = null;
        let productName: string | null = null;
        let categoryId: string | null = null;

        if (validated.productId) {
            const productResult = await db.query(
                `SELECT 
                    p.id,
                    p.name,
                    p.vendor_id,
                    p.category_id,
                    v.name as vendor_name
                FROM products p
                JOIN vendors v ON p.vendor_id = v.id
                WHERE p.id = $1 AND p.deleted_at IS NULL`,
                [validated.productId]
            );

            if (productResult.rows.length > 0) {
                productInfo = productResult.rows[0];
                vendorId = productInfo.vendor_id;
                vendorName = productInfo.vendor_name;
                productName = productInfo.name;
                categoryId = productInfo.category_id;
            }
        }

        // If no product info, try to extract vendor from URL or use a default
        if (!vendorId) {
            // Try to find vendor by domain or use a default
            // For now, we'll require productId or vendorId
            throw new BadRequestError('Product ID is required to track visit');
        }

        // Insert visit record
        const result = await db.query(
            `INSERT INTO website_visits (
                student_id,
                product_id,
                vendor_id,
                url,
                product_name,
                vendor_name,
                category_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, visited_at`,
            [
                studentId,
                validated.productId || null,
                vendorId,
                validated.url,
                productName,
                vendorName,
                categoryId,
            ]
        );

        success(res, {
            message: 'Visit tracked successfully',
            data: {
                visit: {
                    id: result.rows[0].id,
                    visitedAt: result.rows[0].visited_at,
                },
            },
        }, 201);
    }

    /**
     * Get website visits for current student
     */
    public async getVisits(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user) {
            throw new UnauthorizedError('User not authenticated');
        }

        const { page = 1, limit = 20 } = req.query;
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

        // Get visits
        const result = await db.query(
            `SELECT 
                wv.id,
                wv.product_id,
                wv.vendor_id,
                wv.url,
                wv.product_name,
                wv.vendor_name,
                wv.category_id,
                c.name as category_name,
                wv.visited_at
            FROM website_visits wv
            LEFT JOIN categories c ON wv.category_id = c.id
            WHERE wv.student_id = $1
            ORDER BY wv.visited_at DESC
            LIMIT $2 OFFSET $3`,
            [studentId, limitNum, offset]
        );

        // Get total count
        const countResult = await db.query(
            'SELECT COUNT(*) as total FROM website_visits WHERE student_id = $1',
            [studentId]
        );
        const total = parseInt(countResult.rows[0].total, 10);

        success(res, {
            message: 'Website visits retrieved successfully',
            data: {
                visits: result.rows.map(row => ({
                    id: row.id,
                    productId: row.product_id,
                    vendorId: row.vendor_id,
                    url: row.url,
                    productName: row.product_name,
                    vendorName: row.vendor_name,
                    categoryId: row.category_id,
                    categoryName: row.category_name,
                    visitedAt: row.visited_at,
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
}
