/**
 * Student Reset Password Page (OTP Verification)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

// Helper function to mask email
function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
        return `${localPart[0]}***@${domain}`;
    }
    const visibleChars = Math.min(2, Math.floor(localPart.length / 3));
    const masked = localPart.substring(0, visibleChars) + '***' + localPart.substring(localPart.length - 1);
    return `${masked}@${domain}`;
}

export default function StudentResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState<'verify' | 'reset'>('verify');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [verifiedOTP, setVerifiedOTP] = useState<string>('');

    const {
        setValue,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    // Get email from query params
    useEffect(() => {
        const emailFromQuery = searchParams.get('email');
        if (emailFromQuery) {
            const decodedEmail = decodeURIComponent(emailFromQuery);
            setEmail(decodedEmail);
            setValue('email', decodedEmail, { shouldValidate: true });
        }
    }, [searchParams, setValue]);

    const verifyOTP = async (data: { email: string; otp: string }) => {
        try {
            setIsLoading(true);
            setError(null);
            // Use email from state if data.email is empty (from hidden input)
            const emailToUse = email || data.email;

            if (!emailToUse) {
                setError('Email is required');
                setIsLoading(false);
                return;
            }

            if (!data.otp || data.otp.length !== 6) {
                setError('Please enter a valid 6-digit OTP');
                setIsLoading(false);
                return;
            }

            await apiClient.post('/auth/verify-reset-otp', {
                email: emailToUse,
                otp: data.otp,
            });
            setEmail(emailToUse);
            setVerifiedOTP(data.otp);
            setStep('reset');
        } catch (err: unknown) {
            console.error('Error in verifyOTP:', err);
            const error = err as { response?: { data?: { error?: { message?: string } } } };
            setError(error.response?.data?.error?.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Get form data manually
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const otp = formData.get('otp') as string;
        const formEmail = formData.get('email') as string;

        // Use email from state if available, otherwise from form
        const emailToUse = email || formEmail;

        if (!emailToUse) {
            setError('Email is required');
            return;
        }

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        // Call verifyOTP directly
        verifyOTP({ email: emailToUse, otp });
    };

    const resetPassword = async (data: ResetPasswordFormData) => {
        try {
            setIsLoading(true);
            setError(null);

            // Use stored email and OTP from verification step
            const emailToUse = email || data.email;
            const otpToUse = verifiedOTP || data.otp;

            if (!emailToUse || !otpToUse) {
                setError('Email and OTP are required');
                setIsLoading(false);
                return;
            }

            await apiClient.post('/auth/reset-password', {
                email: emailToUse,
                otp: otpToUse,
                newPassword: data.password,
            });
            router.push('/auth/student/login?reset=success');
        } catch (err: unknown) {
            console.error('Error in resetPassword:', err);
            const error = err as { response?: { data?: { error?: { message?: string } } } };
            setError(error.response?.data?.error?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Get form data manually
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (!password || password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        // Call resetPassword directly
        resetPassword({
            email: email || '',
            otp: verifiedOTP || '',
            password,
            confirmPassword,
        });
    };

    if (step === 'verify') {
        return (
            <div className="min-h-screen flex bg-white">
                <div className="flex-2 flex items-center justify-center px-8 lg:px-16">
                    <div className="w-full max-w-md">
                        <h1 className="text-2xl font-bold mb-2 text-left">Verify OTP</h1>
                        <p className="text-gray-600 mb-8 text-left">
                            {email ? (
                                <>
                                    Enter the 6-digit OTP sent to <span className="font-medium">{maskEmail(email)}</span>.
                                </>
                            ) : (
                                'Enter the 6-digit OTP sent to your email.'
                            )}
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-5">
                            {email && <input type="hidden" name="email" value={email} />}

                            {!email && (
                                <div>
                                    <Label htmlFor="email" className="text-left block mb-2">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        aria-invalid={errors.email ? 'true' : 'false'}
                                        className="w-full"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600 text-left">{errors.email.message}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <Label htmlFor="otp" className="text-left block mb-2">OTP</Label>
                                <Input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    aria-invalid={errors.otp ? 'true' : 'false'}
                                    className="w-full"
                                />
                                {errors.otp && (
                                    <p className="mt-1 text-sm text-red-600 text-left">{errors.otp.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                        </form>
                    </div>
                </div>
                <div className="hidden lg:block flex-3 bg-cover bg-center bg-no-repeat min-h-screen" style={{ backgroundImage: 'url(/images/auth.png)' }}>
                    <div className="h-full flex items-center justify-end p-8">
                        <div className="text-black text-right">
                            <h2 className="text-3xl font-bold mb-4">Awoof</h2>
                            <p className="text-lg">Connect with students</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white">
            <div className="flex-2 flex items-center justify-center px-8 lg:px-16">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-2 text-left">Reset Password</h1>
                    <p className="text-gray-600 mb-8 text-left">Enter your new password below.</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleResetFormSubmit} className="space-y-5">
                        <input type="hidden" name="email" value={email} />
                        <input type="hidden" name="otp" value={verifiedOTP} />

                        <div>
                            <Label htmlFor="password" className="text-left block mb-2">New Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="At least 8 characters"
                                aria-invalid={errors.password ? 'true' : 'false'}
                                className="w-full"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600 text-left">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword" className="text-left block mb-2">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                                className="w-full"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 text-left">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                </div>
            </div>
            <div className="hidden lg:block flex-3 bg-cover bg-center bg-no-repeat min-h-screen" style={{ backgroundImage: 'url(/images/auth.png)' }}>
                <div className="h-full flex items-center justify-end p-8">
                    <div className="text-black text-right">
                        <h2 className="text-3xl font-bold mb-4">Awoof</h2>
                        <p className="text-lg">Connect with students</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
