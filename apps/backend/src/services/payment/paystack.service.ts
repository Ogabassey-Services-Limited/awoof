/**
 * Paystack Service
 * 
 * Handles Paystack payment validation and verification
 * Follows Single Responsibility Principle - only handles Paystack operations
 */

import axios from 'axios';
import { config } from '../../config/env.js';
import { BadRequestError } from '../../common/errors/AppError.js';

/**
 * Verify a Paystack payment reference
 */
export async function verifyPaystackPayment(
    paymentReference: string
): Promise<{
    verified: boolean;
    amount?: number;
    status?: string;
    customer?: {
        email: string;
        name?: string;
    };
    metadata?: Record<string, unknown>;
    error?: string;
}> {
    if (!config.paystack.secretKey) {
        throw new BadRequestError('Paystack secret key not configured');
    }

    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${paymentReference}`,
            {
                headers: {
                    Authorization: `Bearer ${config.paystack.secretKey}`,
                },
            }
        );

        const data = response.data.data;

        if (!data || data.status !== 'success') {
            return {
                verified: false,
                error: 'Payment not successful',
            };
        }

        return {
            verified: true,
            amount: data.amount / 100, // Paystack returns amount in kobo, convert to naira
            status: data.status,
            customer: {
                email: data.customer?.email || '',
                name: data.customer?.first_name || data.customer?.last_name || undefined,
            },
            metadata: data.metadata || {},
        };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                return {
                    verified: false,
                    error: 'Payment reference not found',
                };
            }
            return {
                verified: false,
                error: error.response?.data?.message || 'Failed to verify payment',
            };
        }
        return {
            verified: false,
            error: 'Unknown error verifying payment',
        };
    }
}

/**
 * Check if a payment reference has already been used
 */
export async function checkDuplicatePayment(
    _paymentReference: string
): Promise<boolean> {
    // This will be checked in the database by the controller
    // This function is here for potential future use (e.g., caching)
    return false;
}

