/**
 * Student Profile Page
 */

'use client';

import { useState } from 'react';
import { Bell, FileText, Moon, Receipt, Headphones, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function StudentProfilePage() {
    const { user, logout } = useAuth();
    const [darkMode, setDarkMode] = useState(false);

    // Get user's first name initial
    const getInitials = () => {
        if (!user) return 'U';
        // Try to get first letter of first name from profile
        const profile = (user as { profile?: { name?: string } })?.profile;
        if (profile?.name) {
            return profile.name.split(' ')[0].charAt(0).toUpperCase();
        }
        // Fallback to email first letter
        if (user.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    // Get display name - try to get from profile or use email
    const getDisplayName = () => {
        if (!user) return 'User';
        // Try to get name from profile
        const profile = (user as { profile?: { name?: string } })?.profile;
        if (profile?.name) {
            return profile.name;
        }
        // Fallback to formatted email name
        if (user.email) {
            const emailName = user.email.split('@')[0];
            // Capitalize first letter of each word
            return emailName
                .split('.')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ') || emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
        return 'User';
    };

    const isVerified = user?.verificationStatus === 'verified';

    const handleSignOut = async () => {
        if (confirm('Are you sure you want to sign out?')) {
            await logout();
        }
    };

    return (
        <ProtectedRoute requiredRole="student">
            <div className="min-h-screen bg-gray-50">
                {/* Mobile View */}
                <div className="block md:hidden">
                    <div className="bg-white">
                        <div className="px-4 py-6">
                            <div className="flex items-center gap-4">
                                <Link href="/marketplace">
                                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                                </Link>
                                <h1 className="text-lg font-medium text-gray-700 flex-1 text-center">Profile</h1>
                                <div className="w-6"></div> {/* Spacer for centering */}
                            </div>
                        </div>

                        {/* User Profile Card */}
                        <div className="mx-4 mb-4 bg-gray-100 rounded-lg p-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-xl font-semibold text-gray-600">{getInitials()}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-lg font-semibold text-gray-900">{getDisplayName()}</h2>
                                        {isVerified && (
                                            <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{user?.email}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        {/* General Settings */}
                        <div className="space-y-1">
                            <Link
                                href="/student/profile/notifications"
                                className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Bell className="h-5 w-5 text-gray-600" />
                                    <span className="text-gray-900">Notifications</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </Link>

                            <Link
                                href="/student/profile/websites"
                                className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-gray-600" />
                                    <span className="text-gray-900">Websites Visited</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </Link>

                            <div className="flex items-center justify-between px-4 py-3 bg-white">
                                <div className="flex items-center gap-3">
                                    <Moon className="h-5 w-5 text-gray-600" />
                                    <span className="text-gray-900">Dark Mode</span>
                                </div>
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <Link
                                href="/student/profile/receipts"
                                className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Receipt className="h-5 w-5 text-gray-600" />
                                    <span className="text-gray-900">Receipt</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </Link>
                        </div>

                        {/* Support Section */}
                        <div className="mt-4 space-y-1">
                            <Link
                                href="/student/profile/support"
                                className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Headphones className="h-5 w-5 text-gray-600" />
                                    <span className="text-gray-900">Customer Support</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </Link>

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 flex items-center justify-center">
                                        <LogOut className="h-5 w-5 text-red-600" />
                                    </div>
                                    <span className="text-red-600">Sign Out</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Web View */}
                <div className="hidden md:block">
                    <div className="container mx-auto max-w-4xl px-4 py-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Link href="/marketplace">
                                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                    <span>Back to Marketplace</span>
                                </button>
                            </Link>
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Profile</h1>

                        {/* User Profile Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-2xl font-semibold text-gray-600">{getInitials()}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-semibold text-gray-900">{getDisplayName()}</h2>
                                        {isVerified && (
                                            <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{user?.email}</p>
                                </div>
                                <Link
                                    href="/student/profile/edit"
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </Link>
                            </div>
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <Link
                                href="/student/profile/notifications"
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Bell className="h-5 w-5 text-gray-600" />
                                        <span className="text-gray-900 font-medium">Notifications</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </Link>

                            <Link
                                href="/student/profile/websites"
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-gray-600" />
                                        <span className="text-gray-900 font-medium">Websites Visited</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </Link>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Moon className="h-5 w-5 text-gray-600" />
                                        <span className="text-gray-900 font-medium">Dark Mode</span>
                                    </div>
                                    <button
                                        onClick={() => setDarkMode(!darkMode)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            <Link
                                href="/student/profile/receipts"
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Receipt className="h-5 w-5 text-gray-600" />
                                        <span className="text-gray-900 font-medium">Receipt</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </Link>
                        </div>

                        {/* Support Section */}
                        <div className="space-y-4">
                            <Link
                                href="/student/profile/support"
                                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Headphones className="h-5 w-5 text-gray-600" />
                                        <span className="text-gray-900 font-medium">Customer Support</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </Link>

                            <button
                                onClick={handleSignOut}
                                className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <LogOut className="h-5 w-5 text-red-600" />
                                        <span className="text-red-600 font-medium">Sign Out</span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
