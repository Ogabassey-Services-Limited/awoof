/**
 * Reset Password Page (Multi-Step)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Schema for the first step: OTP and Email verification
const verifyOTPSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

// Schema for the second step: Password reset
const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// Zod-inferred types
type VerifyOTPFormData = z.infer<typeof verifyOTPSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<'verify' | 'reset'>('verify');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // State to hold verified email and OTP for the final step
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    // Form hook for the OTP verification step
    const verifyForm = useForm<VerifyOTPFormData>({
        resolver: zodResolver(verifyOTPSchema),
    });

    // Form hook for the password reset step
    const resetForm = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    // Destructure form methods for clarity
    const { handleSubmit: handleVerifySubmit, formState: { errors: verifyErrors } } = verifyForm;
    const { handleSubmit: handleResetSubmit, formState: { errors: resetErrors } } = resetForm;

    // Handler for the first step (verifying OTP)
    const verifyOTP = async (data: VerifyOTPFormData) => {
        try {
            setIsLoading(true);
            setError(null);
            await apiClient.post('/auth/verify-reset-otp', {
                email: data.email,
                otp: data.otp,
            });
            // On success, store email and OTP in state and move to the next step
            setEmail(data.email);
            setOtp(data.otp);
            setStep('reset');
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.response?.data?.error?.message || 'Invalid OTP or email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for the second step (resetting password)
    const resetPassword = async (data: ResetPasswordFormData) => {
        try {
            setIsLoading(true);
            setError(null);
            await apiClient.post('/auth/reset-password', {
                email: email, // Use email from state
                otp: otp,     // Use OTP from state
                password: data.password,
            });
            router.push('/auth/login?reset=success');
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.response?.data?.error?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Render the OTP verification form
    if (step === 'verify') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h1 className="text-2xl font-bold text-center mb-6">Verify OTP</h1>
                        <p className="text-center text-gray-600 mb-6">
                            Enter your email and the 6-digit OTP we sent you.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleVerifySubmit(verifyOTP)} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...verifyForm.register('email')}
                                    aria-invalid={verifyErrors.email ? 'true' : 'false'}
                                />
                                {verifyErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{verifyErrors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="otp">OTP</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    {...verifyForm.register('otp')}
                                    aria-invalid={verifyErrors.otp ? 'true' : 'false'}
                                />
                                {verifyErrors.otp && (
                                    <p className="mt-1 text-sm text-red-600">{verifyErrors.otp.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Render the password reset form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleResetSubmit(resetPassword)} className="space-y-4">
                        <div>
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="At least 8 characters"
                                {...resetForm.register('password')}
                                aria-invalid={resetErrors.password ? 'true' : 'false'}
                            />
                            {resetErrors.password && (
                                <p className="mt-1 text-sm text-red-600">{resetErrors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                {...resetForm.register('confirmPassword')}
                                aria-invalid={resetErrors.confirmPassword ? 'true' : 'false'}
                            />
                            {resetErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{resetErrors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
