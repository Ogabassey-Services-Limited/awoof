/**
 * Student Register Page
 */

'use client';

import { useState } from 'react';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UniversitySelect } from '@/components/forms/UniversitySelect';
import apiClient from '@/lib/api-client';
import { storeTokens } from '@/lib/auth';
import Link from 'next/link';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    university: z.string().uuid('Invalid university ID'),
    matricNumber: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function StudentRegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [emailVerificationStatus, setEmailVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const email = watch('email');
    const university = watch('university');

    // Verify email when both email and university are provided
    const verifyEmailWithUniversity = async (emailToVerify: string, universityId: string) => {
        if (!emailToVerify || !universityId) {
            setEmailVerificationStatus('idle');
            return;
        }

        try {
            setEmailVerificationStatus('verifying');
            setError(null);

            await apiClient.post('/auth/verify-student-email', {
                email: emailToVerify,
                universityId: universityId,
            });

            setEmailVerificationStatus('verified');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
            setEmailVerificationStatus('failed');
            setError(error.response?.data?.error?.message || error.message || 'Email verification failed.');
        }
    };

    // Watch for changes in email and university to trigger verification
    React.useEffect(() => {
        if (email && university && z.string().uuid().safeParse(university).success) {
            // Debounce verification to avoid too many API calls
            const timeoutId = setTimeout(() => {
                verifyEmailWithUniversity(email, university);
            }, 1000);

            return () => clearTimeout(timeoutId);
        } else {
            setEmailVerificationStatus('idle');
        }
    }, [email, university]);

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setIsLoading(true);
            setError(null);

            // Verify email one more time before registration
            if (data.university) {
                try {
                    await apiClient.post('/auth/verify-student-email', {
                        email: data.email,
                        universityId: data.university,
                    });
                } catch (verifyErr: unknown) {
                    const verifyError = verifyErr as { response?: { data?: { error?: { message?: string } } }; message?: string };
                    throw new Error(verifyError.response?.data?.error?.message || verifyError.message || 'Email verification failed');
                }
            }

            // Prepare registration data
            const registrationData: {
                email: string;
                password: string;
                name: string;
                role: 'student';
                university: string;
                matricNumber?: string;
            } = {
                email: data.email,
                password: data.password,
                name: data.name,
                role: 'student',
                university: data.university,
            };

            // Include matricNumber if provided
            if (data.matricNumber && data.matricNumber.trim() !== '') {
                registrationData.matricNumber = data.matricNumber;
            }

            // Call register API
            const response = await apiClient.post('/auth/register', registrationData);
            const { tokens } = response.data.data;

            // Store tokens
            storeTokens(tokens);

            // Redirect to email verification page (student email verification is required)
            if (typeof window !== 'undefined') {
                window.location.href = `/auth/student/verify-email?email=${encodeURIComponent(data.email)}`;
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
            setError(error.response?.data?.error?.message || error.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            <div className="flex-2 flex items-center justify-center px-8 lg:px-16">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-2 text-left">Create Student Account</h1>
                    <p className="text-gray-600 mb-8 text-left">Join Awoof and get exclusive student discounts.</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <Label htmlFor="name" className="text-left block mb-2">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                {...register('name')}
                                aria-invalid={errors.name ? 'true' : 'false'}
                                className="w-full"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600 text-left">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-left block mb-2">Student Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@university.edu.ng"
                                {...register('email')}
                                aria-invalid={errors.email ? 'true' : 'false'}
                                className="w-full"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 text-left">{errors.email.message}</p>
                            )}
                            {emailVerificationStatus === 'verifying' && (
                                <p className="mt-1 text-sm text-blue-600 text-left">Verifying email...</p>
                            )}
                            {emailVerificationStatus === 'verified' && (
                                <p className="mt-1 text-sm text-green-600 text-left">✓ Email verified</p>
                            )}
                            {emailVerificationStatus === 'failed' && (
                                <p className="mt-1 text-sm text-red-600 text-left">Email not found in university database</p>
                            )}
                        </div>

                        <Controller
                            name="university"
                            control={control}
                            render={({ field }) => {
                                // Ensure field value is always a valid UUID or empty string
                                const fieldValue = field.value && z.string().uuid().safeParse(field.value).success
                                    ? field.value
                                    : '';

                                return (
                                    <UniversitySelect
                                        value={fieldValue}
                                        onChange={(universityId, university) => {
                                            // Only set UUID if valid, otherwise set to empty string
                                            if (universityId && z.string().uuid().safeParse(universityId).success) {
                                                field.onChange(universityId);
                                                // Reset email verification status when university changes
                                                setEmailVerificationStatus('idle');
                                            } else {
                                                field.onChange('');
                                                setEmailVerificationStatus('idle');
                                            }
                                        }}
                                        error={errors.university?.message}
                                        required={true}
                                    />
                                );
                            }}
                        />

                        <div>
                            <Label htmlFor="matricNumber" className="text-left block mb-2">
                                Matric Number
                                <span className="text-gray-400 ml-1 text-xs">(Optional - can be added later)</span>
                            </Label>
                            <Input
                                id="matricNumber"
                                type="text"
                                placeholder="Enter your matric number"
                                {...register('matricNumber')}
                                aria-invalid={errors.matricNumber ? 'true' : 'false'}
                                className="w-full"
                            />
                            {errors.matricNumber && (
                                <p className="mt-1 text-sm text-red-600 text-left">{errors.matricNumber.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-left block mb-2">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="At least 8 characters"
                                {...register('password')}
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
                                type="password"
                                placeholder="Re-enter your password"
                                {...register('confirmPassword')}
                                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                                className="w-full"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 text-left">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
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
