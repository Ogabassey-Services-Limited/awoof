/**
 * Student Signup OTP Service
 *
 * Stores and verifies OTP in Redis for student registration (one-time use, keyed by email)
 */

import { redis } from '../../config/redis.js';
import { generateOTP, OTP_EXPIRY_MINUTES } from '../auth/otp.service.js';

const OTP_PREFIX = 'student_signup_otp:';
const OTP_TTL_SECONDS = OTP_EXPIRY_MINUTES * 60;

/**
 * Store OTP for student signup (one-time use)
 */
export async function storeStudentSignupOTP(email: string): Promise<string> {
    const otp = generateOTP(6);
    const key = `${OTP_PREFIX}${email.toLowerCase()}`;

    if (redis.isConnected()) {
        const client = redis.getClient();
        await client.setex(key, OTP_TTL_SECONDS, otp);
    }

    return otp;
}

/**
 * Verify OTP for student signup and delete on success (one-time use)
 */
export async function verifyStudentSignupOTP(
    email: string,
    otp: string
): Promise<boolean> {
    const key = `${OTP_PREFIX}${email.toLowerCase()}`;

    if (!redis.isConnected()) {
        return false;
    }

    const client = redis.getClient();
    const stored = await client.get(key);

    if (!stored || stored !== otp) {
        return false;
    }

    await client.del(key);
    return true;
}
