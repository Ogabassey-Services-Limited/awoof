/**
 * University Select Component with Type-to-Search
 * 
 * Provides autocomplete functionality for selecting universities
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface University {
    id: string;
    name: string;
    domain?: string;
    country?: string;
}

// Dummy array of Nigerian universities
// Using UUID format to match backend validation
const NIGERIAN_UNIVERSITIES: University[] = [
    { id: '550e8400-e29b-41d4-a716-446655440000', name: 'University of Lagos', domain: 'unilag.edu.ng', country: 'Nigeria' },
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'University of Ibadan', domain: 'ui.edu.ng', country: 'Nigeria' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Ahmadu Bello University', domain: 'abu.edu.ng', country: 'Nigeria' },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'University of Nigeria, Nsukka', domain: 'unn.edu.ng', country: 'Nigeria' },
    { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Obafemi Awolowo University', domain: 'oauife.edu.ng', country: 'Nigeria' },
];

interface UniversitySelectProps {
    value?: string; // University ID
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showNotFoundMessage, setShowNotFoundMessage] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter universities based on search term
    useEffect(() => {
        if (searchTerm.length < 1) {
            setFilteredUniversities([]);
            setIsOpen(false);
            setShowNotFoundMessage(false);
            return;
        }

        const filtered = NIGERIAN_UNIVERSITIES.filter((uni) =>
            uni.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredUniversities(filtered);
        setIsOpen(filtered.length > 0);
        setShowNotFoundMessage(filtered.length === 0 && searchTerm.length > 0);
    }, [searchTerm]);

    // Load selected university when value changes
    useEffect(() => {
        if (value && selectedUniversity?.id !== value) {
            const university = NIGERIAN_UNIVERSITIES.find((u) => u.id === value);
            if (university) {
                setSelectedUniversity(university);
                setSearchTerm(university.name);
            }
        } else if (!value) {
            setSelectedUniversity(null);
            setSearchTerm('');
        }
    }, [value, selectedUniversity]);

    // Close dropdown when clicking outside and clear if no valid selection
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
                // Clear input if no valid selection was made
                if (!selectedUniversity) {
                    setSearchTerm('');
                    onChange(null, null);
                } else {
                    // Reset to selected university name
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
        setShowNotFoundMessage(false); // Hide not found message when typing
        // Clear selection if user is typing something different
        if (selectedUniversity && newValue !== selectedUniversity.name) {
            setSelectedUniversity(null);
            onChange(null, null);
        }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Don't clear if clicking on dropdown
        if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
            return;
        }

        // If no valid selection, clear the input after a short delay
        // This allows time for the dropdown click to register
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
                    <span className="text-gray-400 ml-1 text-xs">(Optional - can be added later)</span>
                )}
            </Label>
            <div className="relative">
                <Input
                    ref={inputRef}
                    id="university"
                    type="text"
                    placeholder="Type to search for your university..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="w-full"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
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
                                    e.preventDefault(); // Prevent input blur
                                    handleSelect(university);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                            >
                                <div className="font-medium">{university.name}</div>
                                {university.country && (
                                    <div className="text-sm text-gray-500">{university.country}</div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
                {showNotFoundMessage && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-red-200 rounded-md shadow-lg p-4 text-sm text-red-600">
                        University not covered on awoof portal
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

