/**
 * Registration Number Lookup Service
 * 
 * Handles registration number verification via university database API
 * Follows Single Responsibility Principle - only handles registration lookup
 */

import axios from 'axios';
import { db } from '../../config/database.js';

/**
 * Verify student registration number against university database
 */
export async function verifyRegistrationNumber(
    universityId: string,
    registrationNumber: string,
    studentName?: string,
    studentEmail?: string
): Promise<{
    verified: boolean;
    studentData?: {
        name: string;
        email?: string;
        registrationNumber: string;
        department?: string;
        level?: string;
        academicYear?: string;
    };
    error?: string;
}> {
    // Get university database API configuration
    const universityResult = await db.query(
        `SELECT u.id, u.name, u.database_api_url,
                uvm.api_endpoint, uvm.api_config
         FROM universities u
         LEFT JOIN university_verification_methods uvm 
             ON uvm.university_id = u.id 
             AND uvm.method_type = 'registration'
             AND uvm.is_active = true
         WHERE u.id = $1 AND u.is_active = true`,
        [universityId]
    );

    if (universityResult.rows.length === 0) {
        return {
            verified: false,
            error: 'University not found or inactive',
        };
    }

    const university = universityResult.rows[0];

    // Check if university has database API configured
    const apiEndpoint = university.api_endpoint || university.database_api_url;

    if (!apiEndpoint) {
        return {
            verified: false,
            error: 'University database API not configured',
        };
    }

    try {
        // Prepare API config
        const apiConfig = university.api_config || {};

        // Make API call to university database
        const response = await axios.post(
            apiEndpoint,
            {
                registrationNumber,
                ...(studentName && { name: studentName }),
                ...(studentEmail && { email: studentEmail }),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiConfig.apiKey && { 'Authorization': `Bearer ${apiConfig.apiKey}` }),
                    ...(apiConfig.apiKey && { 'X-API-Key': apiConfig.apiKey }),
                },
                timeout: 10000, // 10 second timeout
            }
        );

        // Check response structure (varies by university)
        if (response.data && response.data.verified !== undefined) {
            return {
                verified: response.data.verified,
                studentData: response.data.studentData || {
                    name: response.data.name || studentName || '',
                    email: response.data.email || studentEmail,
                    registrationNumber,
                    department: response.data.department,
                    level: response.data.level,
                    academicYear: response.data.academicYear,
                },
            };
        }

        // If response doesn't have verified field, assume success if student data returned
        if (response.data && (response.data.name || response.data.studentData)) {
            return {
                verified: true,
                studentData: {
                    name: response.data.name || response.data.studentData?.name || studentName || '',
                    email: response.data.email || response.data.studentData?.email || studentEmail,
                    registrationNumber,
                    department: response.data.department || response.data.studentData?.department,
                    level: response.data.level || response.data.studentData?.level,
                    academicYear: response.data.academicYear || response.data.studentData?.academicYear,
                },
            };
        }

        return {
            verified: false,
            error: 'Invalid response from university database',
        };
    } catch (error: any) {
        console.error('Registration number lookup error:', error.message);

        // Handle different error types
        if (error.response) {
            // API returned error response
            if (error.response.status === 404) {
                return {
                    verified: false,
                    error: 'Student not found in university database',
                };
            }
            if (error.response.status === 401 || error.response.status === 403) {
                return {
                    verified: false,
                    error: 'University API authentication failed',
                };
            }
        }

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return {
                verified: false,
                error: 'University database timeout. Please try again.',
            };
        }

        return {
            verified: false,
            error: error.message || 'Failed to verify registration number',
        };
    }
}

