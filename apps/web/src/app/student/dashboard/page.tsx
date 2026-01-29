/**
 * Student Dashboard
 * 
 * Redirects to marketplace - this page is no longer used
 */

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

function StudentDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();

    // Redirect to marketplace
    useEffect(() => {
        const verified = searchParams.get('verified');
        if (verified === 'true') {
            refreshUser();
            router.replace('/marketplace?verified=true');
        } else {
            router.replace('/marketplace');
        }
    }, [router, searchParams, refreshUser]);

    return (
        <ProtectedRoute requiredRole="student">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Redirecting to marketplace...</p>
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default function StudentDashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <StudentDashboardContent />
        </Suspense>
    );
}

