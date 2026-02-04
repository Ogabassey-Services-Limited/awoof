/**
 * Student Email Verification Service
 *
 * Verifies student email against university database (email_domains + domain)
 * Uses only universities in the database - no hardcoded/dummy domains
 */

import { db } from '../../config/database.js';

export interface VerifyResult {
    verified: boolean;
    studentData?: {
        name?: string;
        email: string;
        matricNumber?: string;
    };
    error?: string;
}

/**
 * Verify student email against university database
 */
export async function verifyStudentEmail(
    universityId: string,
    email: string
): Promise<VerifyResult> {
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!emailDomain) {
        return { verified: false, error: 'Invalid email format' };
    }

    const result = await db.query(
        `SELECT id, name, domain, email_domains
         FROM universities
         WHERE id = $1 AND is_active = true`,
        [universityId]
    );

    if (result.rows.length === 0) {
        return { verified: false, error: 'University not found or inactive' };
    }

    const university = result.rows[0];
    let allowedDomains: string[] = [];

    // Parse email_domains - can be JSON array or string
    if (university.email_domains) {
        try {
            const parsed =
                typeof university.email_domains === 'string'
                    ? JSON.parse(university.email_domains)
                    : university.email_domains;
            allowedDomains = Array.isArray(parsed) ? parsed.map((d: string) => d.toLowerCase()) : [];
        } catch {
            allowedDomains = [];
        }
    }

    // Include primary domain if not in email_domains
    if (university.domain) {
        const primaryDomain = university.domain.toLowerCase();
        if (!allowedDomains.includes(primaryDomain)) {
            allowedDomains.push(primaryDomain);
        }
    }

    if (allowedDomains.length === 0) {
        return {
            verified: false,
            error: `No email domains configured for ${university.name}. Please contact support.`,
        };
    }

    const isAllowed = allowedDomains.includes(emailDomain);
    if (!isAllowed) {
        return {
            verified: false,
            error: `Email domain does not match ${university.name}. Use an email ending with: ${allowedDomains.join(', ')}`,
        };
    }

    return {
        verified: true,
        studentData: { email },
    };
}
