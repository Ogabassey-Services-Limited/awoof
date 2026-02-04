/**
 * University Select Component with Type-to-Search
 *
 * Fetches universities from GET /api/universities and filters by name or shortcode
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';

interface University {
    id: string;
    name: string;
    domain?: string;
    shortcode?: string;
    country?: string;
}

interface UniversitySelectProps {
    value?: string;
    onChange: (universityId: string | null, university: University | null) => void;
    error?: string;
    required?: boolean;
}

export function UniversitySelect({
    value,
    onChange,
    error,
    required = false,
}: UniversitySelectProps) {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchUniversities = useCallback(async () => {
        try {
            setLoading(true);
            setFetchError(null);
            const res = await apiClient.get('/universities');
            const raw = res.data?.data?.universities ?? res.data?.universities ?? [];
            const list = Array.isArray(raw)
                ? raw.map((u: Record<string, unknown>) => ({
                    id: String(u.id ?? ''),
                    name: String(u.name ?? ''),
                    domain: u.domain != null ? String(u.domain) : undefined,
                    shortcode: u.shortcode != null ? String(u.shortcode) : undefined,
                    country: u.country != null ? String(u.country) : undefined,
                }))
                : [];
            setUniversities(list);
        } catch (err: unknown) {
            setUniversities([]);
            const message =
                (err as { response?: { status?: number } })?.response?.status === 404
                    ? 'Universities API not found. Is the backend running?'
                    : 'Could not load universities. Check your connection and try again.';
            setFetchError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    useEffect(() => {
        if (searchTerm.length < 1) {
            setFilteredUniversities([]);
            setIsOpen(false);
            setShowNotFoundMessage(false);
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        const filtered = universities.filter(
            (uni) =>
                (uni.name ?? '').toLowerCase().includes(term) ||
                (uni.shortcode ?? '').toLowerCase().includes(term) ||
                (uni.domain ?? '').toLowerCase().includes(term)
        );

        setFilteredUniversities(filtered);
        setIsOpen(filtered.length > 0);
        setShowNotFoundMessage(filtered.length === 0 && searchTerm.length > 0);
    }, [searchTerm, universities]);

    useEffect(() => {
        if (value && selectedUniversity?.id !== value) {
            const university = universities.find((u) => u.id === value);
            if (university) {
                setSelectedUniversity(university);
                setSearchTerm(university.name);
            }
        } else if (!value) {
            setSelectedUniversity(null);
            setSearchTerm('');
        }
    }, [value, selectedUniversity, universities]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setShowNotFoundMessage(false);
                if (!selectedUniversity) {
                    setSearchTerm('');
                    onChange(null, null);
                } else {
                    setSearchTerm(selectedUniversity.name);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedUniversity, onChange]);

    const handleSelect = (university: University) => {
        setSelectedUniversity(university);
        setSearchTerm(university.name);
        setIsOpen(false);
        onChange(university.id, university);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setShowNotFoundMessage(false);
        if (selectedUniversity && newValue !== selectedUniversity.name) {
            setSelectedUniversity(null);
            onChange(null, null);
        }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (dropdownRef.current?.contains(e.relatedTarget as Node)) return;
        setTimeout(() => {
            if (!selectedUniversity && searchTerm) {
                setSearchTerm('');
                onChange(null, null);
                setShowNotFoundMessage(false);
            }
        }, 200);
    };

    const handleInputFocus = () => {
        if (searchTerm.length > 0 && filteredUniversities.length > 0) {
            setIsOpen(true);
        }
    };

    return (
        <div className="relative">
            <Label htmlFor="university" className="text-left block mb-2">
                University
                {required ? (
                    <span className="text-red-500 ml-1">*</span>
                ) : (
                    <span className="text-gray-400 ml-1 text-xs">(Optional)</span>
                )}
            </Label>
            <div className="relative">
                <Input
                    ref={inputRef}
                    id="university"
                    type="text"
                    placeholder={loading ? 'Loading universities...' : 'Type to search by name or shortcode...'}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="w-full"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    disabled={loading}
                />
                {isOpen && filteredUniversities.length > 0 && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                    >
                        {filteredUniversities.map((university) => (
                            <button
                                key={university.id}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelect(university);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                            >
                                <div className="font-medium">{university.name}</div>
                                {(university.shortcode || university.country) && (
                                    <div className="text-sm text-gray-500">
                                        {[university.shortcode, university.country].filter(Boolean).join(' • ')}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
                {showNotFoundMessage && !fetchError && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg p-4 text-sm text-slate-600">
                        University not covered on Awoof portal
                    </div>
                )}
            </div>
            {fetchError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-2">
                    {fetchError}
                    <button
                        type="button"
                        onClick={() => fetchUniversities()}
                        className="text-sm underline hover:no-underline"
                    >
                        Retry
                    </button>
                </p>
            )}
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">{error}</p>
            )}
        </div>
    );
}
