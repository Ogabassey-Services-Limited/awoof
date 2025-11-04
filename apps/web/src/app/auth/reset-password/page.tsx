/**
 * Reset Password Page (OTP Verification)
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

const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<'verify' | 'reset'>('verify');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const verifyOTP = async (data: { email: string; otp: string }) => {
        try {
            setIsLoading(true);
            setError(null);
            await apiClient.post('/auth/verify-reset-otp', {
                email: data.email,
                otp: data.otp,
            });
            setEmail(data.email);
            setStep('reset');
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.response?.data?.error?.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (data: ResetPasswordFormData) => {
        try {
            setIsLoading(true);
            setError(null);
            await apiClient.post('/auth/reset-password', {
                email: data.email,
                otp: data.otp,
                password: data.password,
            });
            router.push('/auth/login?reset=success');
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.response?.data?.error?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'verify') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h1 className="text-2xl font-bold text-center mb-6">Verify OTP</h1>
                        <p className="text-center text-gray-600 mb-6">
                            Enter the 6-digit OTP sent to your email.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(verifyOTP)} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register('email')}
                                    aria-invalid={errors.email ? 'true' : 'false'}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="otp">OTP</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    {...register('otp')}
                                    aria-invalid={errors.otp ? 'true' : 'false'}
                                />
                                {errors.otp && (
                                    <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
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

                    <form onSubmit={handleSubmit(resetPassword)} className="space-y-4">
                        <input type="hidden" {...register('email')} value={email} />
                        <input type="hidden" {...register('otp')} value={watch('otp')} />

                        <div>
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="At least 8 characters"
                                {...register('password')}
                                aria-invalid={errors.password ? 'true' : 'false'}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                {...register('confirmPassword')}
                                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
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

