/**
 * Admin Vendor Controller
 *
 * List vendors with product count, order count, revenue and commission for admin.
 */

import type { Request, Response } from 'express';
import { db } from '../config/database.js';
import { success } from '../common/utils/response.js';

export class AdminVendorController {
    /**
     * GET /api/admin/vendors
     * List vendors with pagination, search, product count, order count, revenue, commission.
     */
    async getVendors(req: Request, res: Response): Promise<void> {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
        const search = (req.query.search as string)?.trim();
        const offset = (page - 1) * limit;

        const params: unknown[] = [];
        let paramIdx = 1;
        let whereClause = ' WHERE v.deleted_at IS NULL AND u.deleted_at IS NULL';
        if (search) {
            const pattern = `%${search}%`;
            whereClause += ` AND (
                v.name ILIKE $${paramIdx} OR
                u.email ILIKE $${paramIdx} OR
                v.company_name ILIKE $${paramIdx} OR
                v.business_category ILIKE $${paramIdx}
            )`;
            params.push(pattern);
            paramIdx++;
        }

        const countQuery = `
            SELECT COUNT(*)::int AS total
            FROM vendors v
            JOIN users u ON u.id = v.user_id
            ${whereClause}
        `;
        const countResult = await db.query(countQuery, params);
        const total = countResult.rows[0]?.total ?? 0;

        params.push(limit, offset);
        const listQuery = `
            SELECT
                v.id,
                v.user_id,
                v.name,
                v.company_name,
                v.business_category,
                v.business_website,
                v.status,
                v.created_at,
                u.email,
                COALESCE(products_agg.product_count, 0)::int AS product_count,
                COALESCE(stats.order_count, 0)::int AS order_count,
                COALESCE(stats.total_revenue, 0)::numeric(12,2) AS total_revenue,
                COALESCE(stats.total_commission, 0)::numeric(12,2) AS total_commission
            FROM vendors v
            JOIN users u ON u.id = v.user_id
            LEFT JOIN (
                SELECT vendor_id, COUNT(*)::int AS product_count
                FROM products
                WHERE deleted_at IS NULL
                GROUP BY vendor_id
            ) products_agg ON products_agg.vendor_id = v.id
            LEFT JOIN (
                SELECT
                    vendor_id,
                    COUNT(*) AS order_count,
                    SUM(amount) AS total_revenue,
                    SUM(commission) AS total_commission
                FROM transactions
                WHERE status = 'completed'
                GROUP BY vendor_id
            ) stats ON stats.vendor_id = v.id
            ${whereClause}
            ORDER BY v.created_at DESC
            LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
        `;
        const result = await db.query(listQuery, params);

        const vendors = result.rows.map((row) => ({
            id: row.id,
            userId: row.user_id,
            name: row.name,
            email: row.email,
            companyName: row.company_name || null,
            businessCategory: row.business_category || null,
            businessWebsite: row.business_website || null,
            status: row.status || 'pending',
            createdAt: row.created_at,
            productCount: parseInt(row.product_count ?? '0'),
            orderCount: parseInt(row.order_count ?? '0'),
            totalRevenue: parseFloat(row.total_revenue ?? '0'),
            totalCommission: parseFloat(row.total_commission ?? '0'),
        }));

        success(res, {
            message: 'Vendors retrieved successfully',
            data: { vendors, total, page, limit },
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    }
}

export const adminVendorController = new AdminVendorController();
