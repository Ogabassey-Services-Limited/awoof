/**
 * Custom Hook for Vendor Registration Business Logic
 * 
 * Single Responsibility: Only handles vendor registration business logic
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api-client';

export interface Step1Data {
    companyName: string;
    companyEmail: string;
    fullName: string;
    phoneNumber: string;
}

export interface Step2Data {
    businessCategory: string;
    businessWebsite?: string;
    password: string;
    confirmPassword: string;
}

export interface VendorRegistrationData {
    step1: Step1Data | null;
    step2: Step2Data | null;
    files: {
        documentFront?: File;
        documentBack?: File;
        logoImage?: File;
        bannerImage?: File;
    };
}

export function useVendorRegistration() {
    const { register: registerUser } = useAuth();
    const [registrationData, setRegistrationData] = useState<VendorRegistrationData>({
        step1: null,
        step2: null,
        files: {},
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const saveStep1Data = (data: Step1Data) => {
        setRegistrationData((prev) => ({
            ...prev,
            step1: data,
        }));
    };

    const saveStep2Data = (data: Step2Data) => {
        setRegistrationData((prev) => ({
            ...prev,
            step2: data,
        }));
    };

    const saveFiles = useCallback((files: { documentFront?: File | null; documentBack?: File | null; logoImage?: File | null; bannerImage?: File | null }) => {
        setRegistrationData((prev) => {
            // Merge new files with existing files - only update fields that are provided
            // This prevents clearing other files when one is selected
            // undefined = don't update, null/undefined = clear (remove), File = set
            const mergedFiles = {
                ...prev.files,
            };

            // Update only the fields that are explicitly provided
            if (files.documentFront !== undefined) {
                mergedFiles.documentFront = files.documentFront || undefined;
            }
            if (files.documentBack !== undefined) {
                mergedFiles.documentBack = files.documentBack || undefined;
            }
            if (files.logoImage !== undefined) {
                mergedFiles.logoImage = files.logoImage || undefined;
            }
            if (files.bannerImage !== undefined) {
                mergedFiles.bannerImage = files.bannerImage || undefined;
            }

            // Check if anything actually changed
            const filesChanged =
                prev.files.documentFront !== mergedFiles.documentFront ||
                prev.files.documentBack !== mergedFiles.documentBack ||
                prev.files.logoImage !== mergedFiles.logoImage ||
                prev.files.bannerImage !== mergedFiles.bannerImage;

            if (!filesChanged) {
                return prev;
            }

            return { ...prev, files: mergedFiles };
        });
    }, []);

    const submitRegistration = async () => {
        if (!registrationData.step1 || !registrationData.step2) {
            throw new Error('Missing registration data');
        }

        try {
            setIsLoading(true);
            setError(null);

            // Step 1: Register user account
            await registerUser(
                registrationData.step1.companyEmail,
                registrationData.step2.password,
                registrationData.step1.fullName,
                'vendor'
            );

            // Step 2: Complete vendor registration with company details
            await apiClient.post('/vendors/complete-registration', {
                companyName: registrationData.step1.companyName,
                phoneNumber: registrationData.step1.phoneNumber,
                businessCategory: registrationData.step2.businessCategory,
                businessWebsite: registrationData.step2.businessWebsite || '',
            });

            // Step 3: Upload files if any
            const filesToUpload = Object.entries(registrationData.files).filter(([, file]) => file !== undefined);
            if (filesToUpload.length > 0) {
                const formData = new FormData();
                filesToUpload.forEach(([fieldName, file]) => {
                    if (file) {
                        formData.append(fieldName, file);
                    }
                });

                await apiClient.post('/vendors/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            // Redirect to email verification page (vendor email verification is required)
            if (typeof window !== 'undefined') {
                window.location.href = `/auth/vendor/verify-email?email=${encodeURIComponent(registrationData.step1.companyEmail)}`;
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: { message?: string } } } };
            const errorMessage = error.response?.data?.error?.message || 'Failed to complete registration. Please try again.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        registrationData,
        error,
        isLoading,
        saveStep1Data,
        saveStep2Data,
        saveFiles,
        submitRegistration,
        clearError,
    };
}

