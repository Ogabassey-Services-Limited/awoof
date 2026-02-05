/**
 * Admin Dashboard
 */

'use client';

import { Users, ShoppingBag, Tag, BarChart3, GraduationCap } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard';
import type { User } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { primaryNavItems, secondaryNavItems } from '../adminNav';

export default function AdminDashboardPage() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <ProtectedRoute requiredRole="admin">
            <DashboardLayout
                navItems={primaryNavItems}
                secondaryNavItems={secondaryNavItems}
                pageTitle="Admin Dashboard"
                user={user as User}
                onLogout={handleLogout}
                logoutLabel="Logout"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Students</p>
                                    <p className="mt-2 text-3xl font-semibold text-slate-900">-</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Vendors</p>
                                    <p className="mt-2 text-3xl font-semibold text-slate-900">-</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <ShoppingBag className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Products</p>
                                    <p className="mt-2 text-3xl font-semibold text-slate-900">-</p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <Tag className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                                    <p className="mt-2 text-3xl font-semibold text-slate-900">-</p>
                                </div>
                                <div className="rounded-full bg-orange-100 p-3">
                                    <BarChart3 className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <Link href="/admin/categories">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Tag className="mr-2 h-4 w-4" />
                                        Manage Categories
                                    </Button>
                                </Link>
                                <Link href="/admin/universities">
                                    <Button variant="outline" className="w-full justify-start">
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        Manage Universities
                                    </Button>
                                </Link>
                                <Link href="/admin/students">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Students
                                    </Button>
                                </Link>
                                <Link href="/admin/vendors">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        Manage Vendors
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
                            <p className="text-sm text-slate-500">No recent activity</p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}


