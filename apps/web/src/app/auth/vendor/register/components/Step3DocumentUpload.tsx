/**
 * Step 3: Document Upload
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StepWrapper } from './StepWrapper';
import { FileUploadField } from '@/components/forms/FileUploadField';
import { useFileUpload } from '@/hooks/useFileUpload';
import Link from 'next/link';

interface Step3DocumentUploadProps {
    onNext: () => void;
    onPrevious: () => void;
    onSubmit: () => Promise<void>;
    onFilesChange: (files: { documentFront?: File; documentBack?: File; logoImage?: File; bannerImage?: File }) => void;
    existingFiles?: { documentFront?: File; documentBack?: File; logoImage?: File; bannerImage?: File };
    error?: string | null;
    isLoading?: boolean;
    progressIndicator?: React.ReactNode;
}

export function Step3DocumentUpload({
    onNext,
    onPrevious,
    onSubmit,
    onFilesChange,
    existingFiles,
    error,
    isLoading,
    progressIndicator,
}: Step3DocumentUploadProps) {
    const {
        setFile,
        validateAllFiles,
        getFile,
        getError,
        files,
    } = useFileUpload({
        maxSize: 5 * 1024 * 1024, // 5MB (matching backend limit)
    });
    const [logoError, setLogoError] = React.useState<string | null>(null);

    // Initialize local files state with existing files from parent on mount
    const initializedRef = React.useRef(false);
    React.useEffect(() => {
        if (!initializedRef.current && existingFiles) {
            if (existingFiles.documentFront) setFile('documentFront', existingFiles.documentFront);
            if (existingFiles.documentBack) setFile('documentBack', existingFiles.documentBack);
            if (existingFiles.logoImage) setFile('logoImage', existingFiles.logoImage);
            if (existingFiles.bannerImage) setFile('bannerImage', existingFiles.bannerImage);
            initializedRef.current = true;
        }
    }, [existingFiles, setFile]);

    // Track previous file references to avoid unnecessary updates
    const prevFilesRef = React.useRef<{
        documentFront?: File | null;
        documentBack?: File | null;
        logoImage?: File | null;
        bannerImage?: File | null;
    }>({});

    // Use ref for onFilesChange to avoid dependency issues
    const onFilesChangeRef = React.useRef(onFilesChange);
    React.useEffect(() => {
        onFilesChangeRef.current = onFilesChange;
    }, [onFilesChange]);

    // Sync files to parent whenever files state changes
    React.useEffect(() => {
        // Check if files actually changed by comparing File references
        const filesChanged =
            prevFilesRef.current.documentFront !== files.documentFront ||
            prevFilesRef.current.documentBack !== files.documentBack ||
            prevFilesRef.current.logoImage !== files.logoImage ||
            prevFilesRef.current.bannerImage !== files.bannerImage;

        if (!filesChanged) {
            return;
        }

        // Update ref with current file references
        prevFilesRef.current = {
            documentFront: files.documentFront,
            documentBack: files.documentBack,
            logoImage: files.logoImage,
            bannerImage: files.bannerImage,
        };

        // Only send the files that actually changed to avoid clearing others
        // Use a special marker to distinguish between "not provided" (undefined) and "cleared" (null)
        const changedFiles: { documentFront?: File | null; documentBack?: File | null; logoImage?: File | null; bannerImage?: File | null } = {};
        let hasChanges = false;

        if (prevFilesRef.current.documentFront !== files.documentFront) {
            changedFiles.documentFront = files.documentFront ?? null; // null means cleared, undefined means not provided
            hasChanges = true;
        }
        if (prevFilesRef.current.documentBack !== files.documentBack) {
            changedFiles.documentBack = files.documentBack ?? null;
            hasChanges = true;
        }
        if (prevFilesRef.current.logoImage !== files.logoImage) {
            changedFiles.logoImage = files.logoImage ?? null;
            hasChanges = true;
        }
        if (prevFilesRef.current.bannerImage !== files.bannerImage) {
            changedFiles.bannerImage = files.bannerImage ?? null;
            hasChanges = true;
        }

        // Only call onFilesChange if something actually changed
        // Convert null to undefined to match the expected type
        if (hasChanges) {
            onFilesChangeRef.current({
                documentFront: changedFiles.documentFront === null ? undefined : changedFiles.documentFront,
                documentBack: changedFiles.documentBack === null ? undefined : changedFiles.documentBack,
                logoImage: changedFiles.logoImage === null ? undefined : changedFiles.logoImage,
                bannerImage: changedFiles.bannerImage === null ? undefined : changedFiles.bannerImage,
            });
        }
    }, [files]);

    // Wrapper for setFile
    const handleFileChange = React.useCallback((fieldName: string, file: File | null) => {
        setFile(fieldName, file);
    }, [setFile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that logo is required
        const logoFile = getFile('logoImage');
        if (!logoFile) {
            setLogoError('Logo image is required');
            return;
        }
        setLogoError(null);

        // Validate all files
        const isValid = validateAllFiles();
        if (!isValid) {
            return;
        }

        try {
            await onSubmit();
            onNext();
        } catch {
            // Error is handled by parent component
        }
    };

    return (
        <StepWrapper
            title="Create An Account"
            subtitle="Please fill in your information below."
            progressIndicator={progressIndicator}
            error={error}
            footer={
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/auth/vendor/login" className="text-primary hover:underline font-medium">
                        Login
                    </Link>
                </p>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Document Upload */}
                <div>
                    <Label className="mb-2 block">Document Upload (Business Certificate or ID)</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <FileUploadField
                            label="Front"
                            file={getFile('documentFront')}
                            onChange={(file) => {
                                handleFileChange('documentFront', file);
                            }}
                            error={getError('documentFront') || undefined}
                            maxSize={5 * 1024 * 1024} // 5MB
                        />
                        <FileUploadField
                            label="Back"
                            file={getFile('documentBack')}
                            onChange={(file) => {
                                handleFileChange('documentBack', file);
                            }}
                            error={getError('documentBack') || undefined}
                            maxSize={5 * 1024 * 1024} // 5MB
                        />
                    </div>
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Max File size up to 5MB
                    </p>
                </div>

                {/* Logo Image - Required */}
                <div>
                    <Label className="mb-2 block">
                        Logo Image <span className="text-red-600">*</span>
                    </Label>
                    <FileUploadField
                        label="Logo Image"
                        file={getFile('logoImage')}
                        onChange={(file) => {
                            handleFileChange('logoImage', file);
                            if (file) {
                                setLogoError(null);
                            }
                        }}
                        accept="image/*"
                        error={getError('logoImage') || logoError || undefined}
                        maxSize={5 * 1024 * 1024} // 5MB
                        required
                    />
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Max File size up to 5MB. Logo is required.
                    </p>
                </div>

                {/* Banner Image */}
                <div>
                    <FileUploadField
                        label="Banner Image"
                        file={getFile('bannerImage')}
                        onChange={(file) => {
                            handleFileChange('bannerImage', file);
                        }}
                        accept="image/*"
                        error={getError('bannerImage') || undefined}
                        maxSize={5 * 1024 * 1024} // 5MB
                    />
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Max File size up to 5MB
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={onPrevious}
                        disabled={isLoading}
                    >
                        Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Continue'}
                    </Button>
                </div>
            </form>
        </StepWrapper>
    );
}

