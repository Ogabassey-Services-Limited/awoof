/**
 * Email Verification Service
 * 
 * Handles email domain validation and magic link generation
 * Follows Single Responsibility Principle - only handles email verification
 */

import crypto from 'crypto';
import { db } from '../../config/database.js';
import { sendEmail } from '../email/email.service.js';
import { config } from '../../config/env.js';

/**
 * Magic link expiry time (15 minutes)
 */
export const MAGIC_LINK_EXPIRY_MINUTES = 15;

/**
 * Generate magic link token
 */
export function generateMagicLinkToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate magic link expiry date
 */
export function getMagicLinkExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + MAGIC_LINK_EXPIRY_MINUTES);
    return expiresAt;
}

/**
 * Validate email domain for student verification
 * Checks if email domain is .edu, .edu.ng, or matches university domain
 */
export async function validateStudentEmailDomain(email: string, universityId?: string): Promise<{
    valid: boolean;
    universityId?: string;
    universityName?: string;
}> {
    const emailDomain = email.split('@')[1]?.toLowerCase();

    if (!emailDomain) {
        return { valid: false };
    }

    // Check for common student email domains
    const validDomains = [
        '.edu',
        '.edu.ng',
        '.ac.ng',
        '.sch.ng',
    ];

    const hasValidDomain = validDomains.some(domain => emailDomain.endsWith(domain));

    if (hasValidDomain) {
        // If university ID provided, verify it matches
        if (universityId) {
            const universityResult = await db.query(
                `SELECT id, name, domain FROM universities WHERE id = $1 AND is_active = true`,
                [universityId]
            );

            if (universityResult.rows.length > 0) {
                const university = universityResult.rows[0];
                // If university has specific domain, check match
                if (university.domain && !emailDomain.endsWith(university.domain)) {
                    return { valid: false };
                }
                return {
                    valid: true,
                    universityId: university.id,
                    universityName: university.name,
                };
            }
        }

        // If no university ID, check if we can find matching university
        const universityResult = await db.query(
            `SELECT id, name, domain FROM universities 
             WHERE (domain IS NOT NULL AND $1 LIKE '%' || domain) 
                OR (domain IS NULL)
             AND is_active = true
             LIMIT 1`,
            [emailDomain]
        );

        if (universityResult.rows.length > 0) {
            return {
                valid: true,
                universityId: universityResult.rows[0].id,
                universityName: universityResult.rows[0].name,
            };
        }

        return { valid: true }; // Generic .edu domain accepted
    }

    return { valid: false };
}

/**
 * Send magic link email
 */
export async function sendMagicLinkEmail(
    email: string,
    token: string,
    universityName?: string
): Promise<{ success: boolean; error?: string }> {
    const frontendUrl = config.frontend.url;
    const magicLink = `${frontendUrl}/verify/email?token=${token}`;

    const subject = 'Verify your student email - Awoof';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1D4ED8; padding: 20px; text-align: center;">
                <h1 style="color: #FFFFFF; margin: 0;">Awoof</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <h2 style="color: #1D4ED8;">Verify Your Student Email</h2>
                ${universityName ? `<p>Welcome, ${universityName} student!</p>` : ''}
                <p>Click the button below to verify your student email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${magicLink}" style="background-color: #1D4ED8; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Verify Email
                    </a>
                </div>
                <p style="font-size: 12px; color: #666;">Or copy and paste this link in your browser:</p>
                <p style="font-size: 12px; color: #666; word-break: break-all;">${magicLink}</p>
                <p style="font-size: 12px; color: #666;">This link will expire in ${MAGIC_LINK_EXPIRY_MINUTES} minutes.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
            </div>
            <div style="background-color: #1D4ED8; padding: 20px; text-align: center; color: #FFFFFF;">
                <p style="margin: 0;">© 2025 Awoof. All rights reserved.</p>
            </div>
        </div>
    `;

    const result = await sendEmail(email, subject, html);
    return result;
}

