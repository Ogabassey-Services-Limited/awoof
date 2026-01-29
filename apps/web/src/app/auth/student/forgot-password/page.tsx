/**
 * Student Forgot Password Page
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function StudentForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setIsLoading(true);
            setError(null);
            await apiClient.post('/auth/forgot-password', { email: data.email, role: 'student' });
            setEmail(data.email);
            setSuccess(true);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: { message?: string } } } };
            setError(error.response?.data?.error?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex bg-white">
                <div className="flex-2 flex items-center justify-center px-8 lg:px-16">
                    <div className="w-full max-w-md">
                        <div className="text-left">
                            <div className="mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
                            <p className="text-gray-600 mb-6">
                                We&apos;ve sent a password reset OTP to your email address.
                            </p>
                            <Link href={`/auth/student/reset-password?email=${encodeURIComponent(email)}`}>
                                <Button className="w-full">Enter OTP</Button>
                            </Link>
                        </div>
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
                    <h1 className="text-2xl font-bold mb-2 text-left">Forgot Password</h1>
                    <p className="text-gray-600 mb-8 text-left">
                        Enter your email address and we&apos;ll send you an OTP to reset your password.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <Label htmlFor="email" className="text-left block mb-2">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                {...register('email')}
                                aria-invalid={errors.email ? 'true' : 'false'}
                                className="w-full"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 text-left">{errors.email.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Remember your password?{' '}
                        <Link href="/auth/student/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
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
