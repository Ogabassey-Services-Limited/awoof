/**
 * Verification Orchestrator Service
 * 
 * Coordinates the 4-tier verification system with fallback logic
 * Follows Single Responsibility Principle - orchestrates verification methods
 */

import { db } from '../../config/database.js';
import { validateStudentEmailDomain } from './email-verification.service.js';

export type VerificationMethod = 'portal' | 'email' | 'registration' | 'whatsapp';

export interface VerificationMethodInfo {
    methodType: VerificationMethod;
    isAvailable: boolean;
    priority: number;
    reason?: string;
}

/**
 * Get available verification methods for a university (in priority order)
 */
export async function getAvailableVerificationMethods(
    universityId: string
): Promise<VerificationMethodInfo[]> {
    const methodsResult = await db.query(
        `SELECT 
            method_type,
            is_active,
            priority_order
        FROM university_verification_methods
        WHERE university_id = $1 AND is_active = true
        ORDER BY priority_order ASC`,
        [universityId]
    );

    // Default fallback order if no methods configured
    const defaultOrder: VerificationMethod[] = ['portal', 'email', 'registration', 'whatsapp'];

    if (methodsResult.rows.length === 0) {
        // Return default order with all available
        return defaultOrder.map((method, index) => ({
            methodType: method,
            isAvailable: true,
            priority: index,
        }));
    }

    // Map configured methods
    const configuredMethods = methodsResult.rows.map(row => ({
        methodType: row.method_type as VerificationMethod,
        isAvailable: row.is_active,
        priority: row.priority_order,
    }));

    // Ensure all default methods are included (with fallback if not configured)
    const allMethods: VerificationMethodInfo[] = defaultOrder.map((method, index) => {
        const configured = configuredMethods.find(m => m.methodType === method);
        return configured || {
            methodType: method,
            isAvailable: true, // Available as fallback
            priority: index,
        };
    });

    return allMethods.sort((a, b) => a.priority - b.priority);
}

/**
 * Determine the best available verification method for a student
 * Returns method in fallback order
 */
export async function determineBestVerificationMethod(
    universityId: string,
    studentEmail?: string,
    hasRegistrationNumber?: boolean,
    hasPhoneNumber?: boolean
): Promise<VerificationMethod | null> {
    const availableMethods = await getAvailableVerificationMethods(universityId);

    // Try methods in priority order
    for (const methodInfo of availableMethods) {
        if (!methodInfo.isAvailable) {
            continue;
        }

        switch (methodInfo.methodType) {
            case 'portal':
                // Portal is always available if configured
                return 'portal';

            case 'email':
                // Email requires valid .edu domain
                if (studentEmail) {
                    const emailValidation = await validateStudentEmailDomain(studentEmail, universityId);
                    if (emailValidation.valid) {
                        return 'email';
                    }
                }
                break;

            case 'registration':
                // Registration requires registration number
                if (hasRegistrationNumber) {
                    return 'registration';
                }
                break;

            case 'whatsapp':
                // WhatsApp requires phone number
                if (hasPhoneNumber) {
                    return 'whatsapp';
                }
                break;
        }
    }

    return null; // No suitable method found
}

/**
 * Check if student is already verified
 */
export async function isStudentVerified(studentId: string): Promise<boolean> {
    const result = await db.query(
        `SELECT verification_status FROM users u
         JOIN students s ON s.user_id = u.id
         WHERE s.id = $1 AND u.deleted_at IS NULL`,
        [studentId]
    );

    if (result.rows.length === 0) {
        return false;
    }

    return result.rows[0].verification_status === 'verified';
}

/**
 * Get student's current verification status
 */
export async function getStudentVerificationStatus(studentId: string): Promise<{
    isVerified: boolean;
    verificationStatus: 'unverified' | 'verified' | 'expired';
    lastVerificationDate?: Date;
    verificationMethod?: VerificationMethod;
    expiresAt?: Date;
}> {
    const result = await db.query(
        `SELECT 
            u.verification_status,
            s.verification_date,
            v.method,
            v.expires_at
         FROM users u
         JOIN students s ON s.user_id = u.id
         LEFT JOIN verifications v ON v.student_id = s.id 
             AND v.status = 'verified'
         WHERE s.id = $1 AND u.deleted_at IS NULL
         ORDER BY v.verified_at DESC
         LIMIT 1`,
        [studentId]
    );

    if (result.rows.length === 0) {
        return {
            isVerified: false,
            verificationStatus: 'unverified',
        };
    }

    const row = result.rows[0];
    const isVerified = row.verification_status === 'verified';
    const expiresAt = row.expires_at ? new Date(row.expires_at) : undefined;
    const isExpired = expiresAt ? new Date() > expiresAt : false;
    const lastVerificationDate = row.verification_date ? new Date(row.verification_date) : undefined;
    const verificationMethod = row.method as VerificationMethod | undefined;

    return {
        isVerified: isVerified && !isExpired,
        verificationStatus: isExpired ? 'expired' : (row.verification_status || 'unverified'),
        ...(lastVerificationDate && { lastVerificationDate }),
        ...(verificationMethod && { verificationMethod }),
        ...(expiresAt && { expiresAt }),
    };
}

