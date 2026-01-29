/**
 * Vendor Dashboard
 */

'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, CreditCard, LayoutDashboard, LifeBuoy, Puzzle, Settings, ShoppingBag, Tag } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard';
import type { User } from '@/lib/auth';

const iconProps = { className: 'h-5 w-5', strokeWidth: 1.5, fill: 'currentColor' as const };

const primaryNavItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/vendor/dashboard', icon: <LayoutDashboard {...iconProps} /> },
    { id: 'manage-deals', label: 'Manage Deals', href: '/vendor/deals', icon: <Tag {...iconProps} /> },
    { id: 'orders', label: 'Orders', href: '/vendor/orders', icon: <ShoppingBag {...iconProps} /> },
    { id: 'analytics', label: 'Analytics', href: '/vendor/analytics', icon: <BarChart3 {...iconProps} /> },
    { id: 'payment', label: 'Payment', href: '/vendor/payment', icon: <CreditCard {...iconProps} /> },
    { id: 'integration', label: 'Integration', href: '/vendor/integration', icon: <Puzzle {...iconProps} /> },
];

const secondaryNavItems = [
    { id: 'support', label: 'Support', href: '/vendor/support', icon: <LifeBuoy {...iconProps} /> },
    { id: 'settings', label: 'Settings', href: '/vendor/settings', icon: <Settings {...iconProps} /> },
];

function VendorDashboardContent() {
    const { user, refreshUser, logout } = useAuth();
    const searchParams = useSearchParams();

    useEffect(() => {
        const verified = searchParams.get('verified');
        if (verified === 'true') {
            refreshUser();
            if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', '/vendor/dashboard');
            }
        }
    }, [searchParams, refreshUser]);

    const isVerified = user?.verificationStatus === 'verified';
    type VendorProfile = { companyName?: string | null; name?: string | null };
    const extendedUser = user as (User & { profile?: VendorProfile }) | null;
    const companyName = extendedUser?.profile?.companyName ?? null;
    const displayName = companyName ?? extendedUser?.profile?.name ?? extendedUser?.email ?? 'Vendor';

    return (
        <ProtectedRoute requiredRole="vendor">
            <DashboardLayout
                navItems={primaryNavItems}
                secondaryNavItems={secondaryNavItems}
                pageTitle="Dashboard"
                subtitle="Overview of your performance"
                onLogout={logout}
                logoutLabel="Log out"
                user={{
                    name: displayName,
                    email: user?.email ?? null,
                    roleLabel: 'Vendor',
                    secondaryText: companyName ?? undefined,
                    profileHref: '/vendor/settings/profile',
                    avatarUrl: null,
                }}
            >
                {!isVerified && (
                    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-amber-800">Email verification required</p>
                                <p className="mt-1 text-sm text-amber-700">
                                    Verify your email to unlock deals management, payouts, and analytics features.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
                                asChild
                                size="sm"
                            >
                                <Link href={`/auth/vendor/verify-email?email=${encodeURIComponent(user?.email || '')}`}>
                                    Verify email
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                <section className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Total Discount Given</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900">5</p>
                        <p className="mt-2 text-xs text-emerald-500">+12% vs last week</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Total Redemption</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900">20</p>
                        <p className="mt-2 text-xs text-emerald-500">+8% vs last week</p>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Total Views</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900">23</p>
                        <p className="mt-2 text-xs text-emerald-500">+18% vs last week</p>
                    </div>
                </section>

                <section className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-600">Redemption over time</p>
                            <Button variant="ghost" size="sm" className="text-sm text-slate-500">
                                This week
                            </Button>
                        </div>
                        <div className="flex h-56 items-end justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-xs text-slate-500">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                                <div key={day} className="flex h-full w-full flex-col items-center justify-end gap-2">
                                    <div
                                        className="w-full rounded-t-lg bg-blue-500 transition-all"
                                        style={{ height: `${[30, 18, 80, 12, 8][index]}%` }}
                                    ></div>
                                    <span>{day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="text-sm font-semibold text-slate-600">Top schools</p>
                        <div className="mt-6 flex flex-col gap-4">
                            {[
                                { school: 'Unilag', value: '45%' },
                                { school: 'Uniben', value: '25%' },
                                { school: 'Lasu', value: '18%' },
                                { school: 'Yabatech', value: '12%' },
                            ].map((item) => (
                                <div key={item.school} className="flex items-center justify-between text-sm text-slate-500">
                                    <span>{item.school}</span>
                                    <span className="font-semibold text-slate-700">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-600">Recent activity</p>
                        <Button variant="ghost" size="sm" className="text-sm text-blue-600">
                            View all
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm text-slate-600">
                            <thead>
                                <tr className="text-xs uppercase text-slate-400">
                                    <th className="px-4 py-3 font-medium">Student name</th>
                                    <th className="px-4 py-3 font-medium">Deal redeemed</th>
                                    <th className="px-4 py-3 font-medium">Date/Time</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'John Adeyemi', deal: '20% Off Sneakers at Adidas', date: 'Aug 20, 2025 – 14:32', status: 'Used' },
                                    { name: 'John Adeyemi', deal: '20% Off Sneakers at Adidas', date: 'Aug 19, 2025 – 16:18', status: 'Claimed' },
                                    { name: 'John Adeyemi', deal: '20% Off Sneakers at Adidas', date: 'Aug 19, 2025 – 08:45', status: 'Expired' },
                                ].map((row) => (
                                    <tr key={`${row.name}-${row.date}`} className="border-t border-slate-100">
                                        <td className="px-4 py-4">{row.name}</td>
                                        <td className="px-4 py-4">{row.deal}</td>
                                        <td className="px-4 py-4 text-sm text-slate-500">{row.date}</td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={
                                                    row.status === 'Used'
                                                        ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700'
                                                        : row.status === 'Claimed'
                                                            ? 'rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700'
                                                            : 'rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700'
                                                }
                                            >
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

export default function VendorDashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <VendorDashboardContent />
        </Suspense>
    );
}

