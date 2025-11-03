/**
 * OTP Service
 * 
 * Handles OTP generation and validation
 * Follows Single Responsibility Principle - only handles OTP operations
 */

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) {
        return true;
    }
    return new Date() > expiresAt;
}

/**
 * OTP expiry time (10 minutes)
 */
export const OTP_EXPIRY_MINUTES = 10;

/**
 * Calculate OTP expiry date
 */
export function getOTPExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);
    return expiresAt;
}

