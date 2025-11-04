/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'student' | 'vendor' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/auth/login');
                return;
            }

            if (requiredRole && user?.role !== requiredRole) {
                router.push('/');
                return;
            }
        }
    }, [isAuthenticated, isLoading, user, requiredRole, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return null;
    }

    return <>{children}</>;
}

