/**
 * Student Email Verification Service
 * 
 * Verifies student email against university database
 * For now uses dummy data matching frontend universities
 * Later will call external university API
 * Follows Single Responsibility Principle - only handles student email verification
 */

// import axios from 'axios'; // Will be used when external API is integrated
import { db } from '../../config/database.js';

/**
 * Dummy student data for demo/testing
 * Matches the universities in the frontend UniversitySelect component
 */
const DUMMY_STUDENT_DATA: Record<string, Array<{ email: string; name?: string; matricNumber?: string }>> = {
    '550e8400-e29b-41d4-a716-446655440000': [ // University of Lagos
        { email: 'student1@unilag.edu.ng', name: 'John Doe', matricNumber: '180123456' },
        { email: 'student2@unilag.edu.ng', name: 'Jane Smith', matricNumber: '180123457' },
        { email: 'test@unilag.edu.ng', name: 'Test Student', matricNumber: '180123458' },
    ],
    '550e8400-e29b-41d4-a716-446655440001': [ // University of Ibadan
        { email: 'student1@ui.edu.ng', name: 'Ade Johnson', matricNumber: '190123456' },
        { email: 'student2@ui.edu.ng', name: 'Chioma Okoro', matricNumber: '190123457' },
        { email: 'test@ui.edu.ng', name: 'Test Student', matricNumber: '190123458' },
    ],
    '550e8400-e29b-41d4-a716-446655440002': [ // Ahmadu Bello University
        { email: 'student1@abu.edu.ng', name: 'Musa Ibrahim', matricNumber: '200123456' },
        { email: 'student2@abu.edu.ng', name: 'Amina Hassan', matricNumber: '200123457' },
        { email: 'test@abu.edu.ng', name: 'Test Student', matricNumber: '200123458' },
    ],
    '550e8400-e29b-41d4-a716-446655440003': [ // University of Nigeria, Nsukka
        { email: 'student1@unn.edu.ng', name: 'Emeka Okafor', matricNumber: '210123456' },
        { email: 'student2@unn.edu.ng', name: 'Ngozi Eze', matricNumber: '210123457' },
        { email: 'test@unn.edu.ng', name: 'Test Student', matricNumber: '210123458' },
    ],
    '550e8400-e29b-41d4-a716-446655440004': [ // Obafemi Awolowo University
        { email: 'student1@oauife.edu.ng', name: 'Tunde Adeyemi', matricNumber: '220123456' },
        { email: 'student2@oauife.edu.ng', name: 'Folake Williams', matricNumber: '220123457' },
        { email: 'test@oauife.edu.ng', name: 'Test Student', matricNumber: '220123458' },
    ],
};

/**
 * Verify student email against university database
 * 
 * @param universityId - UUID of the university
 * @param email - Student email to verify
 * @returns Verification result with student data if verified
 */
export async function verifyStudentEmail(
    universityId: string,
    email: string
): Promise<{
    verified: boolean;
    studentData?: {
        name?: string;
        email: string;
        matricNumber?: string;
        department?: string;
        level?: string;
        academicYear?: string;
    };
    error?: string;
}> {
    const emailDomain = email.split('@')[1]?.toLowerCase();

    // Get university information from database (if exists)
    const universityResult = await db.query(
        `SELECT id, name, domain, database_api_url
         FROM universities 
         WHERE id = $1 AND is_active = true`,
        [universityId]
    );

    // Check if university exists in dummy data (for demo/testing)
    const dummyData = DUMMY_STUDENT_DATA[universityId];
    const hasDummyData = !!dummyData;

    // If university not in database and not in dummy data, return error
    if (universityResult.rows.length === 0 && !hasDummyData) {
        return {
            verified: false,
            error: 'University not found or inactive',
        };
    }

    // Use database university if available, otherwise use dummy data info
    let university: { name: string; domain: string | null; database_api_url: string | null } | null = null;

    if (universityResult.rows.length > 0) {
        university = universityResult.rows[0];
    } else if (hasDummyData) {
        // For dummy universities, extract domain from dummy data
        // Map university IDs to their domains
        const universityDomains: Record<string, string> = {
            '550e8400-e29b-41d4-a716-446655440000': 'unilag.edu.ng',
            '550e8400-e29b-41d4-a716-446655440001': 'ui.edu.ng',
            '550e8400-e29b-41d4-a716-446655440002': 'abu.edu.ng',
            '550e8400-e29b-41d4-a716-446655440003': 'unn.edu.ng',
            '550e8400-e29b-41d4-a716-446655440004': 'oauife.edu.ng',
        };

        const universityNames: Record<string, string> = {
            '550e8400-e29b-41d4-a716-446655440000': 'University of Lagos',
            '550e8400-e29b-41d4-a716-446655440001': 'University of Ibadan',
            '550e8400-e29b-41d4-a716-446655440002': 'Ahmadu Bello University',
            '550e8400-e29b-41d4-a716-446655440003': 'University of Nigeria, Nsukka',
            '550e8400-e29b-41d4-a716-446655440004': 'Obafemi Awolowo University',
        };

        university = {
            name: universityNames[universityId] || 'University',
            domain: universityDomains[universityId] || null,
            database_api_url: null,
        };
    }

    if (!university) {
        return {
            verified: false,
            error: 'University not found or inactive',
        };
    }

    // Validate email domain matches university domain (if specified)
    if (university.domain && emailDomain !== university.domain.toLowerCase()) {
        return {
            verified: false,
            error: `Email domain does not match ${university.name} domain (${university.domain})`,
        };
    }

    // Check if university has external API configured
    const apiEndpoint = university.database_api_url;

    // If we have dummy data, use it (for demo/testing)
    if (hasDummyData) {
        const student = dummyData.find(s => s.email.toLowerCase() === email.toLowerCase());

        if (student) {
            return {
                verified: true,
                studentData: {
                    email: student.email,
                    ...(student.name && { name: student.name }),
                    ...(student.matricNumber && { matricNumber: student.matricNumber }),
                },
            };
        }

        // If email not in dummy data but we have an API endpoint, try API
        if (apiEndpoint) {
            // API call would go here when external API is available
            // For now, return not verified
            return {
                verified: false,
                error: 'Email not found in university database. Please ensure you are using your official university email.',
            };
        }

        // No API endpoint and not in dummy data
        return {
            verified: false,
            error: 'Email not found in university database. Please ensure you are using your official university email.',
        };
    }

    // If university is in database but no dummy data, check for API endpoint
    if (apiEndpoint) {
        // TODO: When external API is available, call it here
        // This is where the actual API call would go:
        /*
        try {
            const response = await axios.post(
                apiEndpoint,
                { email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        // Add API key if needed
                    },
                    timeout: 10000,
                }
            );

            if (response.data && response.data.verified) {
                return {
                    verified: true,
                    studentData: {
                        email: response.data.email || email,
                        name: response.data.name,
                        matricNumber: response.data.matricNumber || response.data.registrationNumber,
                        department: response.data.department,
                        level: response.data.level,
                        academicYear: response.data.academicYear,
                    },
                };
            }
        } catch (error: any) {
            console.error('Student email verification error:', error.message);
            return {
                verified: false,
                error: error.response?.data?.message || error.message || 'Failed to verify student email',
            };
        }
        */

        // For now, return not verified if API endpoint exists but not implemented
        return {
            verified: false,
            error: 'Email not found in university database. Please ensure you are using your official university email.',
        };
    }

    // No external API configured and no dummy data
    return {
        verified: false,
        error: 'University verification not configured',
    };
}

