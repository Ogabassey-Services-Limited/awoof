/**
 * Vendor Dashboard
 */

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VendorDashboardPage() {
    const { user, refreshUser } = useAuth();
    const searchParams = useSearchParams();

    // Refresh user data if coming from verification
    useEffect(() => {
        const verified = searchParams.get('verified');
        if (verified === 'true') {
            refreshUser();
            // Clean up the query param from URL
            if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', '/vendor/dashboard');
            }
        }
    }, [searchParams, refreshUser]);

    const isVerified = user?.verificationStatus === 'verified';

    return (
        <ProtectedRoute requiredRole="vendor">
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto py-8 px-4">
                    <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>

                    {/* Email Verification Banner */}
                    {!isVerified && (
                        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                            <div className="flex items-start">
                                <div className="shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Email Verification Required
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>
                                            Your email address has not been verified yet. Please verify your email to access all features.
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <Link href={`/auth/vendor/verify-email?email=${encodeURIComponent(user?.email || '')}`}>
                                            <Button variant="outline" size="sm" className="bg-white">
                                                Verify Email Now
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-600">Welcome, {user?.email}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Email Status: <span className={`font-semibold ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                                {isVerified ? 'Verified ✓' : 'Unverified ⚠'}
                            </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Your vendor dashboard is ready. More features coming soon!</p>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

