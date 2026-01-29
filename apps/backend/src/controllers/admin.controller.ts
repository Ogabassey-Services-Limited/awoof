/**
 * Admin Controller
 * 
 * Handles admin-only operations including category management
 */

import type { Response } from 'express';
import { db } from '../config/database.js';
import {
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
} from '../common/errors/AppError.js';
import { success } from '../common/utils/response.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { z } from 'zod';

/**
 * Validation schemas
 */
const createCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(255, 'Category name too long'),
    description: z.string().optional().nullable(),
    slug: z.string().optional().nullable(),
});

const updateCategorySchema = createCategorySchema.partial();

/**
 * Admin Controller
 */
export class AdminController {
    /**
     * Get all categories (admin view with additional info)
     */
    public async getCategories(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user || req.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required');
        }

        const result = await db.query(
            `SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.slug,
                c.created_at,
                c.updated_at,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.deleted_at IS NULL
            GROUP BY c.id, c.name, c.description, c.slug, c.created_at, c.updated_at
            ORDER BY c.name ASC`
        );

        success(res, {
            message: 'Categories retrieved successfully',
            data: result.rows.map(row => ({
                id: row.id,
                name: row.name,
                description: row.description,
                slug: row.slug,
                productCount: parseInt(row.product_count) || 0,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            })),
        });
    }

    /**
     * Get a single category by ID
     */
    public async getCategory(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user || req.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required');
        }

        const { id } = req.params;

        const result = await db.query(
            `SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.slug,
                c.created_at,
                c.updated_at,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.deleted_at IS NULL
            WHERE c.id = $1
            GROUP BY c.id, c.name, c.description, c.slug, c.created_at, c.updated_at`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Category not found');
        }

        const row = result.rows[0];
        success(res, {
            message: 'Category retrieved successfully',
            data: {
                id: row.id,
                name: row.name,
                description: row.description,
                slug: row.slug,
                productCount: parseInt(row.product_count) || 0,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            },
        });
    }

    /**
     * Create a new category
     */
    public async createCategory(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user || req.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required');
        }

        const validated = createCategorySchema.parse(req.body);

        // Generate slug from name if not provided
        let slug = validated.slug;
        if (!slug) {
            slug = validated.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // Check if slug already exists
        if (slug) {
            const existingSlug = await db.query(
                'SELECT id FROM categories WHERE slug = $1',
                [slug]
            );
            if (existingSlug.rows.length > 0) {
                throw new BadRequestError('A category with this slug already exists');
            }
        }

        // Check if name already exists
        const existingName = await db.query(
            'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
            [validated.name]
        );
        if (existingName.rows.length > 0) {
            throw new BadRequestError('A category with this name already exists');
        }

        const result = await db.query(
            `INSERT INTO categories (name, description, slug)
             VALUES ($1, $2, $3)
             RETURNING id, name, description, slug, created_at, updated_at`,
            [validated.name, validated.description || null, slug || null]
        );

        success(res, {
            message: 'Category created successfully',
            data: result.rows[0],
        }, 201);
    }

    /**
     * Update a category
     */
    public async updateCategory(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user || req.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required');
        }

        const { id } = req.params;
        const validated = updateCategorySchema.parse(req.body);

        // Check if category exists
        const existing = await db.query(
            'SELECT id, name, slug FROM categories WHERE id = $1',
            [id]
        );

        if (existing.rows.length === 0) {
            throw new NotFoundError('Category not found');
        }

        const currentCategory = existing.rows[0];

        // Generate slug from name if name is being updated and slug is not provided
        let slug = validated.slug !== undefined ? validated.slug : currentCategory.slug;
        if (validated.name && !validated.slug) {
            slug = validated.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // Check if slug already exists (excluding current category)
        if (slug && slug !== currentCategory.slug) {
            const existingSlug = await db.query(
                'SELECT id FROM categories WHERE slug = $1 AND id != $2',
                [slug, id]
            );
            if (existingSlug.rows.length > 0) {
                throw new BadRequestError('A category with this slug already exists');
            }
        }

        // Check if name already exists (excluding current category)
        if (validated.name && validated.name.toLowerCase() !== currentCategory.name.toLowerCase()) {
            const existingName = await db.query(
                'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2',
                [validated.name, id]
            );
            if (existingName.rows.length > 0) {
                throw new BadRequestError('A category with this name already exists');
            }
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: (string | null)[] = [];
        let paramCount = 1;

        if (validated.name !== undefined) {
            updates.push(`name = $${paramCount}`);
            values.push(validated.name);
            paramCount++;
        }

        if (validated.description !== undefined) {
            updates.push(`description = $${paramCount}`);
            values.push(validated.description || null);
            paramCount++;
        }

        if (slug !== undefined) {
            updates.push(`slug = $${paramCount}`);
            values.push(slug || null);
            paramCount++;
        }

        if (updates.length === 0) {
            throw new BadRequestError('No fields to update');
        }

        values.push(id as string);

        const result = await db.query(
            `UPDATE categories 
             SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
             WHERE id = $${paramCount}
             RETURNING id, name, description, slug, created_at, updated_at`,
            values
        );

        success(res, {
            message: 'Category updated successfully',
            data: result.rows[0],
        });
    }

    /**
     * Delete a category
     */
    public async deleteCategory(req: AuthRequest, res: Response): Promise<void> {
        if (!req.user || req.user.role !== 'admin') {
            throw new UnauthorizedError('Admin access required');
        }

        const { id } = req.params;

        // Check if category exists
        const existing = await db.query(
            'SELECT id FROM categories WHERE id = $1',
            [id]
        );

        if (existing.rows.length === 0) {
            throw new NotFoundError('Category not found');
        }

        // Check if category has products
        const productsCount = await db.query(
            'SELECT COUNT(*) as count FROM products WHERE category_id = $1 AND deleted_at IS NULL',
            [id]
        );

        if (parseInt(productsCount.rows[0].count) > 0) {
            throw new BadRequestError('Cannot delete category with associated products');
        }

        await db.query('DELETE FROM categories WHERE id = $1', [id]);

        success(res, {
            message: 'Category deleted successfully',
            data: {},
        });
    }
}

export const adminController = new AdminController();


