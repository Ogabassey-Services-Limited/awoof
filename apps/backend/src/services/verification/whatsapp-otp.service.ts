/**
 * WhatsApp OTP Service
 * 
 * Handles WhatsApp OTP generation and sending
 * Follows the Single Responsibility Principle - only handles WhatsApp OTP
 */

import { redis } from '../../config/redis.js';
import { generateOTP } from '../auth/otp.service.js';
import axios from 'axios';
import { config } from '../../config/env.js';

/**
 * WhatsApp OTP expiry time (5 minutes)
 */
export const WHATSAPP_OTP_EXPIRY_MINUTES = 5;

/**
 * Calculate WhatsApp OTP expiry date (shorter than email OTP)
 */
export function getWhatsAppOTPExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + WHATSAPP_OTP_EXPIRY_MINUTES);
    return expiresAt;
}

/**
 * Store OTP in Redis for quick lookup
 */
export async function storeOTPInRedis(phoneNumber: string, otp: string): Promise<void> {
    const redisClient = redis.getClient();
    if (redis.isConnected()) {
        try {
            const key = `whatsapp_otp:${phoneNumber}`;
            await redisClient.setex(key, WHATSAPP_OTP_EXPIRY_MINUTES * 60, otp);
        } catch (error) {
            console.error('Error storing OTP in Redis:', error);
            throw error;
        }
    } else {
        console.error(`Redis is not connected. OTP for ${phoneNumber} was not stored.`);
    }
}

/**
 * Verify OTP from Redis
 */
export async function verifyOTPFromRedis(phoneNumber: string, otp: string): Promise<boolean> {
    const redisClient = redis.getClient();
    if (redis.isConnected()) {
        try {
            const key = `whatsapp_otp:${phoneNumber}`;
            const storedOTP = await redisClient.get(key);

            // Verify OTP matches (consider atomicity and replay attack prevention)
            if (storedOTP && storedOTP === otp) {
                // Delete OTP after successful verification (prevents replay attacks)
                await redisClient.del(key);
                return true;
            }
        } catch (error) {
            console.error('Error verifying OTP from Redis:', error);
            return false;
        }
    }
    return false;
}

/**
 * Send WhatsApp OTP
 * Integrates with WhatsApp Business API service
 */
export async function sendWhatsAppOTP(
    phoneNumber: string,
    otp?: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
    // Generate OTP if not provided - explicitly define OTP length
    const otpCode = otp || generateOTP(6);

    // Store in Redis
    await storeOTPInRedis(phoneNumber, otpCode);

    // Check if WhatsApp API is configured
    if (!config.whatsapp.apiKey || !config.whatsapp.apiUrl) {
        console.warn(`WhatsApp API not configured. OTP for ${phoneNumber} is ${otpCode} (stored for testing).`);
        // Still return success since OTP is stored in Redis and can be retrieved
        return {
            success: true,
            error: 'WhatsApp service not configured, OTP stored for testing',
        };
    }

    try {
        // Format phone number (ensure it starts with country code)
        // Remove all non-digit characters before formatting
        const formattedPhone = phoneNumber.startsWith('+')
            ? phoneNumber
            : `+${phoneNumber.replace(/[^0-9]/g, '')}`;

        // Send via WhatsApp API
        const response = await axios.post(
            `${config.whatsapp.apiUrl}/send`,
            {
                to: formattedPhone,
                message: `Your Awoof verification code is: ${otpCode}\n\nThis code expires in ${WHATSAPP_OTP_EXPIRY_MINUTES} minutes.`,
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.whatsapp.apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10 second timeout
            }
        );

        return {
            success: true,
            messageId: response.data.messageId || response.data.id,
        };
    } catch (error: any) {
        console.error('Failed to send WhatsApp OTP:', error.message);
        return {
            success: false,
            error: error.message || 'Failed to send WhatsApp OTP',
        };
    }
}

