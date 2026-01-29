/**
 * Email Service
 * 
 * Handles email sending using Brevo (formerly Sendinblue)
 * Follows Single Responsibility Principle - only handles email operations
 */

// @ts-ignore - sib-api-v3-sdk doesn't have TypeScript definitions
import SibApiV3Sdk from 'sib-api-v3-sdk';
import { appLogger } from '../../common/logger.js';

/**
 * Configure Brevo API client
 */
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];

if (!process.env.BREVO_API_KEY) {
    appLogger.warn('BREVO_API_KEY is not defined. Email functionality will be limited.');
} else {
    apiKey.apiKey = process.env.BREVO_API_KEY;
}

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send email with retry logic
 */
export const sendEmail = async (
    to: string,
    subject: string,
    html: string,
    retries: number = 3
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    if (!process.env.BREVO_API_KEY) {
        appLogger.error('BREVO_API_KEY is not configured');
        return { success: false, error: 'Email service not configured' };
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

            sendSmtpEmail.subject = subject;
            sendSmtpEmail.htmlContent = html;
            sendSmtpEmail.sender = {
                name: process.env.BREVO_FROM_NAME || 'Awoof',
                email: process.env.EMAIL_FROM || 'noreply@awoof.com',
            };
            sendSmtpEmail.to = [{ email: to }];

            const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
            return { success: true, messageId: result.messageId };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            appLogger.error(`Email sending failed (attempt ${attempt}/${retries}):`, message);

            if (attempt === retries) {
                return { success: false, error: message };
            }

            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    return { success: false, error: 'Max retries exceeded' };
};

/**
 * Send OTP email for password reset
 */
export const sendPasswordResetOTP = async (
    email: string,
    otp: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const subject = 'Reset your Awoof password';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1D4ED8; padding: 20px; text-align: center;">
                <h1 style="color: #FFFFFF; margin: 0;">Awoof</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <h2 style="color: #1D4ED8;">Reset Your Password</h2>
                <p>You requested to reset your password. Please use the OTP code below:</p>
                <div style="background-color: #1D4ED8; color: #FFFFFF; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
                    ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div style="background-color: #1D4ED8; padding: 20px; text-align: center; color: #FFFFFF;">
                <p style="margin: 0;">© 2025 Awoof. All rights reserved.</p>
            </div>
        </div>
    `;

    return await sendEmail(email, subject, html);
};

/**
 * Send email verification OTP for vendor and student registration
 */
export const sendEmailVerificationOTP = async (
    email: string,
    otp: string,
    name?: string,
    role: 'vendor' | 'student' = 'vendor'
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const isStudent = role === 'student';
    const subject = isStudent
        ? 'Verify your email - Awoof Student Registration'
        : 'Verify your email - Awoof Vendor Registration';

    const greeting = name ? `Hello ${name},` : 'Hello,';
    const registrationText = isStudent
        ? 'Thank you for registering as a student on Awoof.'
        : 'Thank you for registering as a vendor on Awoof.';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1D4ED8; padding: 20px; text-align: center;">
                <h1 style="color: #FFFFFF; margin: 0;">Awoof</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
                <h2 style="color: #1D4ED8;">Verify Your Email Address</h2>
                <p>${greeting}</p>
                <p>${registrationText} Please verify your email address using the OTP code below:</p>
                <div style="background-color: #1D4ED8; color: #FFFFFF; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
                    ${otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't create an account with Awoof, please ignore this email.</p>
            </div>
            <div style="background-color: #1D4ED8; padding: 20px; text-align: center; color: #FFFFFF;">
                <p style="margin: 0;">© 2025 Awoof. All rights reserved.</p>
            </div>
        </div>
    `;

    return await sendEmail(email, subject, html);
};

