/**
 * Magic link verification page
 *
 * Handles the callback when a student clicks the magic link in their verification email.
 * Backend sends users to: /verify/email?token=...
 * This page calls GET /api/verification/email/verify?token=... (no user-controlled branch on backend).
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { storeTokens } from '@/lib/auth';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('Invalid link. No verification token provided.');
            return;
        }

        let cancelled = false;

        async function verify() {
            setStatus('verifying');
            setErrorMessage('');
            try {
                const response = await apiClient.get('/verification/email/verify', {
                    params: { token },
                });
                if (cancelled) return;

                const data = response.data?.data;
                if (data?.verified && data?.tokens) {
                    storeTokens(data.tokens);
                    setStatus('success');
                    router.replace('/marketplace?verified=true');
                } else {
                    setStatus('error');
                    setErrorMessage('Verification succeeded but invalid response. Try logging in.');
                }
            } catch (err: unknown) {
                if (cancelled) return;
                const msg =
                    (err as { response?: { data?: { error?: { message?: string }; message?: string } } })?.response
                        ?.data?.error?.message ||
                    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                    'Invalid or expired link. Please request a new verification email.';
                setStatus('error');
                setErrorMessage(msg);
            }
        }

        verify();
        return () => {
            cancelled = true;
        };
    }, [token, router]);

    if (status === 'verifying' || status === 'idle') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
                    <p className="text-gray-600">Verifying your email...</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <p className="text-green-600 font-medium">Email verified. Redirecting to marketplace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Verification failed</h1>
                <p className="text-gray-600 mb-6">{errorMessage}</p>
                <Link
                    href="/auth/student/login"
                    className="inline-block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90"
                >
                    Go to login
                </Link>
                <p className="mt-4 text-center text-sm text-gray-500">
                    Need to verify again?{' '}
                    <Link href="/auth/student/register" className="text-primary hover:underline">
                        Start verification
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
