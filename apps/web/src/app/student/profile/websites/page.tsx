/**
 * Websites Visited Page
 */

'use client';

import { useState, useEffect } from 'react';
import { FileText, ChevronLeft, ExternalLink, Calendar } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';

interface WebsiteVisit {
    id: string;
    productName: string;
    vendorName: string;
    url: string;
    visitedAt: string;
    category?: string;
}

export default function WebsitesVisitedPage() {
    const { user } = useAuth();
    const [visits, setVisits] = useState<WebsiteVisit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/students/website-visits');
            if (response?.data?.data?.visits) {
                const formattedVisits: WebsiteVisit[] = response.data.data.visits.map((visit: {
                    id: string;
                    url: string;
                    productName: string | null;
                    vendorName: string | null;
                    categoryName: string | null;
                    visitedAt: string;
                }) => ({
                    id: visit.id,
                    productName: visit.productName || 'Product',
                    vendorName: visit.vendorName || 'Vendor',
                    url: visit.url,
                    visitedAt: visit.visitedAt,
                    category: visit.categoryName || undefined,
                }));
                setVisits(formattedVisits);
            }
        } catch (error) {
            console.error('Error fetching visits:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <ProtectedRoute requiredRole="student">
            <div className="min-h-screen bg-gray-50">
                {/* Mobile View */}
                <div className="block md:hidden">
                    <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
                        <div className="flex items-center gap-4 px-4 py-4">
                            <Link href="/student/profile">
                                <ChevronLeft className="h-6 w-6 text-gray-600" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-600" />
                                <h1 className="text-lg font-semibold text-gray-900">Websites Visited</h1>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-4">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Loading...</p>
                            </div>
                        ) : visits.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No websites visited yet</p>
                                <Link href="/marketplace">
                                    <Button className="mt-4">Browse Marketplace</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {visits.map((visit) => (
                                    <div key={visit.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">{visit.productName}</h3>
                                                <p className="text-sm text-gray-600">{visit.vendorName}</p>
                                                {visit.category && (
                                                    <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                                        {visit.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(visit.visitedAt)}</span>
                                            </div>
                                            <a
                                                href={visit.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                <span>Visit</span>
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Web View */}
                <div className="hidden md:block">
                    <div className="container mx-auto max-w-4xl px-4 py-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Link href="/student/profile">
                                <Button variant="ghost" size="sm">
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-gray-600" />
                                <h1 className="text-2xl font-semibold text-gray-900">Websites Visited</h1>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <p className="text-gray-500">Loading...</p>
                            </div>
                        ) : visits.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">No websites visited yet</p>
                                <Link href="/marketplace">
                                    <Button>Browse Marketplace</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="divide-y divide-gray-200">
                                    {visits.map((visit) => (
                                        <div key={visit.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">{visit.productName}</h3>
                                                        {visit.category && (
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                {visit.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 mb-3">{visit.vendorName}</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{formatDate(visit.visitedAt)}</span>
                                                    </div>
                                                </div>
                                                <a
                                                    href={visit.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    <span>Visit</span>
                                                    <ExternalLink className="h-5 w-5" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
