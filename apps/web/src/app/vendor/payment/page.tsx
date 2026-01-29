/**
 * Vendor Payment Settings Page
 * 
 * Payment configuration and history for vendors
 */

'use client';

import { useState, useEffect } from 'react';
import { BarChart3, CreditCard, LayoutDashboard, LifeBuoy, Puzzle, Settings, ShoppingBag, Tag, TrendingUp, DollarSign, Wallet, Link2, Key, Copy, Check } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/dashboard';
import type { User } from '@/lib/auth';
import apiClient from '@/lib/api-client';
import { formatCurrency } from '@/lib/format';

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

interface PaymentSettings {
    commissionRate: number;
    paystackSubaccountCode: string | null;
    paymentMethod: 'awoof' | 'vendor_website' | null;
    payoutSettings: {
        bankName: string | null;
        accountNumber: string | null;
        accountName: string | null;
        bankCode: string | null;
    };
}

interface PaymentStatistics {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    totalCommission: number;
    totalEarnings: number;
}

interface PaymentHistoryItem {
    id: string;
    amount: number;
    commission: number;
    earnings: number;
    status: string;
    paystackReference: string | null;
    productName: string;
    createdAt: string;
}

interface CommissionBreakdown {
    status: string;
    count: number;
    totalAmount: number;
    totalCommission: number;
    totalEarnings: number;
}

interface MonthlySummary {
    month: string;
    count: number;
    revenue: number;
    commission: number;
    earnings: number;
}

export default function VendorPaymentPage() {
    const { user, logout } = useAuth();
    const [settings, setSettings] = useState<PaymentSettings | null>(null);
    const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
    const [commissionBreakdown, setCommissionBreakdown] = useState<CommissionBreakdown[]>([]);
    const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'integration' | 'payout' | 'history'>('overview');
    const [copiedText, setCopiedText] = useState<string | null>(null);

    // Payout form state
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [bankCode, setBankCode] = useState('');

    // Payment integration state
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [paystackSubaccountCode, setPaystackSubaccountCode] = useState('');
    const [isGeneratingApiKey, setIsGeneratingApiKey] = useState(false);
    const [isUpdatingPaymentMethod, setIsUpdatingPaymentMethod] = useState(false);
    const [isUpdatingSubaccount, setIsUpdatingSubaccount] = useState(false);

    type VendorProfile = { companyName?: string | null; name?: string | null };
    const extendedUser = user as (User & { profile?: VendorProfile }) | null;
    const companyName = extendedUser?.profile?.companyName ?? null;
    const displayName = companyName ?? extendedUser?.profile?.name ?? extendedUser?.email ?? 'Vendor';

    useEffect(() => {
        fetchPaymentData();
    }, []);

    const fetchPaymentData = async () => {
        try {
            setIsLoading(true);
            const [settingsRes, historyRes, commissionRes] = await Promise.all([
                apiClient.get('/vendors/payment/settings'),
                apiClient.get('/vendors/payment/history?limit=10'),
                apiClient.get('/vendors/payment/commission-summary').catch(() => null),
            ]);

            const settingsData = settingsRes.data.data;
            setSettings(settingsData.settings);
            setStatistics(settingsData.statistics);

            // Set payout form values if they exist
            if (settingsData.settings.payoutSettings) {
                setBankName(settingsData.settings.payoutSettings.bankName || '');
                setAccountNumber(settingsData.settings.payoutSettings.accountNumber || '');
                setAccountName(settingsData.settings.payoutSettings.accountName || '');
                setBankCode(settingsData.settings.payoutSettings.bankCode || '');
            }

            // Set payment integration values
            setPaystackSubaccountCode(settingsData.settings.paystackSubaccountCode || '');

            // Fetch API key info if exists
            try {
                const apiKeyRes = await apiClient.get('/vendors/payment/api-key');
                if (apiKeyRes.data.data.hasApiKey) {
                    // Don't show the actual key, just indicate it exists
                    setApiKey('***hidden***');
                }
            } catch {
                // API key doesn't exist yet, that's fine
            }

            setPaymentHistory(historyRes.data.data.payments || []);

            // Set commission breakdown and monthly summary if available
            if (commissionRes?.data?.data) {
                setCommissionBreakdown(commissionRes.data.data.breakdown || []);
                setMonthlySummary(commissionRes.data.data.monthlySummary || []);
            }
        } catch (err: unknown) {
            console.error('Error fetching payment data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePayoutSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await apiClient.put('/vendors/payment/payout-settings', {
                bankName,
                accountNumber,
                accountName,
                bankCode,
            });
            alert('Payout settings updated successfully');
            await fetchPaymentData();
        } catch (error: unknown) {
            console.error('Error updating payout settings:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            alert(errorMessage || 'Failed to update payout settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePaymentMethodChange = async (method: 'awoof' | 'vendor_website') => {
        try {
            setIsUpdatingPaymentMethod(true);
            await apiClient.put('/vendors/payment/integration', {
                paymentMethod: method,
            });
            await fetchPaymentData();
            alert('Payment method updated successfully');
        } catch (error: unknown) {
            console.error('Error updating payment method:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            alert(errorMessage || 'Failed to update payment method');
        } finally {
            setIsUpdatingPaymentMethod(false);
        }
    };

    const handleUpdatePaystackSubaccount = async () => {
        if (!paystackSubaccountCode.trim()) {
            alert('Please enter a Paystack subaccount code');
            return;
        }

        try {
            setIsUpdatingSubaccount(true);
            await apiClient.put('/vendors/payment/paystack-subaccount', {
                paystackSubaccountCode: paystackSubaccountCode.trim(),
            });
            await fetchPaymentData();
            alert('Paystack subaccount updated successfully');
        } catch (error: unknown) {
            console.error('Error updating Paystack subaccount:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            alert(errorMessage || 'Failed to update Paystack subaccount');
        } finally {
            setIsUpdatingSubaccount(false);
        }
    };

    const handleGenerateApiKey = async () => {
        if (!confirm('Generating a new API key will revoke your existing key. Continue?')) {
            return;
        }

        try {
            setIsGeneratingApiKey(true);
            const response = await apiClient.post('/vendors/payment/api-key');
            const newApiKey = response.data.data.apiKey;
            setApiKey(newApiKey);
            alert('API key generated successfully! Make sure to copy it now - it will not be shown again.');
        } catch (error: unknown) {
            console.error('Error generating API key:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            alert(errorMessage || 'Failed to generate API key');
        } finally {
            setIsGeneratingApiKey(false);
        }
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(label);
            setTimeout(() => setCopiedText(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    // Get API base URL for webhook/API examples
    const apiBaseUrl = typeof window !== 'undefined'
        ? window.location.origin.replace('3000', '5001')
        : 'https://api.awoof.com';

    if (isLoading) {
        return (
            <ProtectedRoute requiredRole="vendor">
                <DashboardLayout
                    navItems={primaryNavItems}
                    secondaryNavItems={secondaryNavItems}
                    pageTitle="Payment Settings"
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
                    <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-sm">
                        <p className="text-slate-500">Loading payment settings...</p>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole="vendor">
            <DashboardLayout
                navItems={primaryNavItems}
                secondaryNavItems={secondaryNavItems}
                pageTitle="Payment Settings"
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
                <div className="space-y-6">
                    {/* Tabs */}
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('integration')}
                                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'integration'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                            >
                                Payment Integration
                            </button>
                            <button
                                onClick={() => setActiveTab('payout')}
                                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'payout'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                            >
                                Payout Settings
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'history'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                            >
                                Payment History
                            </button>
                        </nav>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && statistics && (
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                                {formatCurrency(statistics.totalRevenue)}
                                            </p>
                                        </div>
                                        <div className="rounded-full bg-blue-100 p-3">
                                            <DollarSign className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">Total Earnings</p>
                                            <p className="mt-2 text-2xl font-bold text-green-600">
                                                {formatCurrency(statistics.totalEarnings)}
                                            </p>
                                        </div>
                                        <div className="rounded-full bg-green-100 p-3">
                                            <Wallet className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">Total Commission</p>
                                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                                {formatCurrency(statistics.totalCommission)}
                                            </p>
                                        </div>
                                        <div className="rounded-full bg-slate-100 p-3">
                                            <TrendingUp className="h-6 w-6 text-slate-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">Completed Orders</p>
                                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                                {statistics.completedOrders}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                of {statistics.totalOrders} total
                                            </p>
                                        </div>
                                        <div className="rounded-full bg-purple-100 p-3">
                                            <ShoppingBag className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Commission Rate & Payment Method */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {settings && (
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <h2 className="mb-4 text-lg font-semibold text-slate-900">Commission Rate</h2>
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl font-bold text-slate-900">
                                                {settings.commissionRate.toFixed(2)}%
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                Applied to all transactions
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {settings && (
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                        <h2 className="mb-4 text-lg font-semibold text-slate-900">Payment Method</h2>
                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-semibold text-slate-900">
                                                {settings.paymentMethod === 'vendor_website'
                                                    ? 'Vendor Website'
                                                    : settings.paymentMethod === 'awoof'
                                                        ? 'Awoof Platform'
                                                        : 'Awoof Platform'}
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                {settings.paymentMethod === 'vendor_website'
                                                    ? 'Payments processed on your website'
                                                    : 'Payments processed on Awoof'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Commission Breakdown */}
                            {commissionBreakdown.length > 0 && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Commission Breakdown</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                        Orders
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                        Revenue
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                        Commission
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                        Earnings
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 bg-white">
                                                {commissionBreakdown.map((item) => (
                                                    <tr key={item.status}>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.status === 'completed'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : item.status === 'pending'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                    }`}
                                                            >
                                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                                                            {item.count}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                                                            {formatCurrency(item.totalAmount)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                                            {formatCurrency(item.totalCommission)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                                                            {formatCurrency(item.totalEarnings)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Monthly Summary */}
                            {monthlySummary.length > 0 && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Monthly Summary (Last 6 Months)</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                        Month
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                        Orders
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                        Revenue
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                        Commission
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                        Earnings
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 bg-white">
                                                {monthlySummary.map((item) => (
                                                    <tr key={item.month}>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                                                            {new Date(item.month).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                                                            {item.count}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                                                            {formatCurrency(item.revenue)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                                                            {formatCurrency(item.commission)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                                                            {formatCurrency(item.earnings)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment Integration Tab */}
                    {activeTab === 'integration' && (
                        <div className="space-y-6">
                            {/* Payment Method Selection */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-lg font-semibold text-slate-900">Payment Method</h2>
                                <p className="mb-6 text-sm text-slate-600">
                                    Choose how you want to process payments. This determines how transactions are tracked and commissions are collected.
                                </p>

                                <div className="space-y-4">
                                    <label className="flex cursor-pointer items-start gap-4 rounded-lg border-2 border-slate-200 p-4 hover:border-blue-300">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="awoof"
                                            checked={settings?.paymentMethod === 'awoof' || settings?.paymentMethod === null}
                                            onChange={() => handlePaymentMethodChange('awoof')}
                                            disabled={isUpdatingPaymentMethod}
                                            className="mt-1 h-4 w-4 text-blue-600"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900">Awoof Platform</div>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Students purchase directly on Awoof marketplace. Payments are automatically processed and tracked.
                                            </p>
                                        </div>
                                    </label>

                                    <label className="flex cursor-pointer items-start gap-4 rounded-lg border-2 border-slate-200 p-4 hover:border-blue-300">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="vendor_website"
                                            checked={settings?.paymentMethod === 'vendor_website'}
                                            onChange={() => handlePaymentMethodChange('vendor_website')}
                                            disabled={isUpdatingPaymentMethod}
                                            className="mt-1 h-4 w-4 text-blue-600"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900">Vendor Website</div>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Process payments on your website using the Awoof verification widget. Requires integration setup.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Paystack Subaccount Configuration */}
                            {settings?.paymentMethod === 'vendor_website' && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Paystack Split Payment</h2>
                                    <p className="mb-6 text-sm text-slate-600">
                                        Configure Paystack subaccount for automatic commission splitting. When customers pay on your website, Paystack automatically splits the payment between you and Awoof.
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="paystackSubaccount">Paystack Subaccount Code</Label>
                                            <div className="mt-2 flex gap-2">
                                                <Input
                                                    id="paystackSubaccount"
                                                    value={paystackSubaccountCode}
                                                    onChange={(e) => setPaystackSubaccountCode(e.target.value)}
                                                    placeholder="Enter Paystack subaccount code"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleUpdatePaystackSubaccount}
                                                    disabled={isUpdatingSubaccount}
                                                >
                                                    {isUpdatingSubaccount ? 'Updating...' : 'Configure'}
                                                </Button>
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500">
                                                Contact support to set up your Paystack subaccount with Awoof commission rate.
                                            </p>
                                        </div>

                                        {settings?.paystackSubaccountCode && (
                                            <div className="rounded-lg bg-green-50 p-4">
                                                <div className="flex items-center gap-2">
                                                    <Check className="h-5 w-5 text-green-600" />
                                                    <span className="text-sm font-medium text-green-900">
                                                        Paystack subaccount configured
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-green-700">
                                                    Payments will be automatically split. Commission will be deducted automatically.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Webhook URL */}
                            {settings?.paymentMethod === 'vendor_website' && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Webhook URL</h2>
                                    <p className="mb-4 text-sm text-slate-600">
                                        Configure this webhook URL in your Paystack dashboard to automatically track payments.
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>Webhook URL</Label>
                                            <div className="mt-2 flex gap-2">
                                                <Input
                                                    value={`${apiBaseUrl}/api/webhooks/paystack/vendor-payment`}
                                                    readOnly
                                                    className="flex-1 font-mono text-sm"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => copyToClipboard(
                                                        `${apiBaseUrl}/api/webhooks/paystack/vendor-payment`,
                                                        'webhook'
                                                    )}
                                                >
                                                    {copiedText === 'webhook' ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-blue-50 p-4">
                                            <h3 className="text-sm font-semibold text-blue-900">Setup Instructions:</h3>
                                            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-blue-800">
                                                <li>Log in to your Paystack Dashboard</li>
                                                <li>Go to Settings → Webhooks</li>
                                                <li>Add the webhook URL above</li>
                                                <li>Select events: <code className="rounded bg-blue-100 px-1">charge.success</code></li>
                                                <li>Save the webhook configuration</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Transaction Reporting API */}
                            {settings?.paymentMethod === 'vendor_website' && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Transaction Reporting API</h2>
                                    <p className="mb-4 text-sm text-slate-600">
                                        If you&apos;re not using Paystack, use this API to report transactions after successful payments.
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>API Endpoint</Label>
                                            <div className="mt-2 flex gap-2">
                                                <Input
                                                    value={`${apiBaseUrl}/api/vendors/transactions/report`}
                                                    readOnly
                                                    className="flex-1 font-mono text-sm"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => copyToClipboard(
                                                        `${apiBaseUrl}/api/vendors/transactions/report`,
                                                        'api-endpoint'
                                                    )}
                                                >
                                                    {copiedText === 'api-endpoint' ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>API Key</Label>
                                            <div className="mt-2 flex gap-2">
                                                <Input
                                                    value={apiKey || 'No API key generated yet'}
                                                    readOnly
                                                    placeholder="Generate API key"
                                                    className="flex-1 font-mono text-sm"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleGenerateApiKey}
                                                    disabled={isGeneratingApiKey}
                                                >
                                                    <Key className="mr-2 h-4 w-4" />
                                                    {isGeneratingApiKey ? 'Generating...' : 'Generate'}
                                                </Button>
                                                {apiKey && apiKey !== '***hidden***' && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(apiKey, 'api-key')}
                                                        className="ml-2"
                                                    >
                                                        {copiedText === 'api-key' ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="mt-2 text-xs text-slate-500">
                                                Keep your API key secure. Use it to authenticate transaction reports.
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-slate-50 p-4">
                                            <h3 className="mb-2 text-sm font-semibold text-slate-900">Example API Call:</h3>
                                            <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                                                {`fetch('${apiBaseUrl}/api/vendors/transactions/report', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    verificationToken: 'token_from_widget',
    paymentReference: 'paystack_ref_123',
    amount: 15000,
    productId: 'product-uuid',
    paymentGateway: 'paystack'
  })
})`}
                                            </pre>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => copyToClipboard(
                                                    `fetch('${apiBaseUrl}/api/vendors/transactions/report', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    verificationToken: 'token_from_widget',
    paymentReference: 'paystack_ref_123',
    amount: 15000,
    productId: 'product-uuid',
    paymentGateway: 'paystack'
  })
})`,
                                                    'api-example'
                                                )}
                                            >
                                                {copiedText === 'api-example' ? (
                                                    <>
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Copy Example
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Integration Instructions */}
                            {settings?.paymentMethod === 'vendor_website' && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Integration Instructions</h2>

                                    <div className="space-y-4">
                                        <div className="rounded-lg border border-slate-200 p-4">
                                            <h3 className="font-semibold text-slate-900">Step 1: Add Awoof Widget</h3>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Add the Awoof verification widget to your website:
                                            </p>
                                            <div className="mt-2 flex gap-2">
                                                <Input
                                                    value='<script src="https://widget.awoof.com/awoof.js"></script>'
                                                    readOnly
                                                    className="flex-1 font-mono text-xs"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(
                                                        '<script src="https://widget.awoof.com/awoof.js"></script>',
                                                        'widget-script'
                                                    )}
                                                >
                                                    {copiedText === 'widget-script' ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 p-4">
                                            <h3 className="font-semibold text-slate-900">Step 2: Verify Student</h3>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Call the widget to verify student before applying discount:
                                            </p>
                                            <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
                                                {`Awoof.verify({
  onSuccess: (token) => {
    // Apply student discount
    // Process payment
    // Report transaction to Awoof
  }
})`}
                                            </pre>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 p-4">
                                            <h3 className="font-semibold text-slate-900">Step 3: Report Transaction</h3>
                                            <p className="mt-1 text-sm text-slate-600">
                                                After successful payment, report the transaction to Awoof using the API above.
                                            </p>
                                        </div>

                                        <div className="rounded-lg bg-blue-50 p-4">
                                            <div className="flex items-start gap-2">
                                                <Link2 className="mt-0.5 h-5 w-5 text-blue-600" />
                                                <div>
                                                    <h3 className="font-semibold text-blue-900">Need Help?</h3>
                                                    <p className="mt-1 text-sm text-blue-800">
                                                        Check out our{' '}
                                                        <a href="/docs/integration" className="underline hover:text-blue-900">
                                                            integration documentation
                                                        </a>{' '}
                                                        or contact support for assistance.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payout Settings Tab */}
                    {activeTab === 'payout' && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-lg font-semibold text-slate-900">Payout Settings</h2>
                            <form onSubmit={handleSavePayoutSettings} className="space-y-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="bankName">Bank Name</Label>
                                        <Input
                                            id="bankName"
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            placeholder="Enter bank name"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="accountNumber">Account Number</Label>
                                        <Input
                                            id="accountNumber"
                                            type="text"
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            placeholder="Enter account number"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="accountName">Account Name</Label>
                                        <Input
                                            id="accountName"
                                            value={accountName}
                                            onChange={(e) => setAccountName(e.target.value)}
                                            placeholder="Enter account name"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="bankCode">Bank Code</Label>
                                        <Input
                                            id="bankCode"
                                            value={bankCode}
                                            onChange={(e) => setBankCode(e.target.value)}
                                            placeholder="Enter bank code"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Settings'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Payment History Tab */}
                    {activeTab === 'history' && (
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                Commission
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                Earnings
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {paymentHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                                                    No payment history yet
                                                </td>
                                            </tr>
                                        ) : (
                                            paymentHistory.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                        {payment.productName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                        {formatCurrency(payment.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                        {formatCurrency(payment.commission)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                        {formatCurrency(payment.earnings)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${payment.status === 'completed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : payment.status === 'pending'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}
                                                        >
                                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                        {formatDate(payment.createdAt)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

