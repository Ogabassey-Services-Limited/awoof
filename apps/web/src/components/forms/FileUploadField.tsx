/**
 * Reusable File Upload Field Component
 * 
 * Single Responsibility: Only handles file upload UI and validation
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

interface FileUploadFieldProps {
    label: string;
    file: File | null;
    onChange: (file: File | null) => void;
    fieldName?: string; // Optional, used for accessibility
    accept?: string;
    maxSize?: number; // in bytes
    error?: string;
    required?: boolean;
}

export function FileUploadField({
    label,
    file,
    onChange,
    accept = 'image/*,.pdf',
    maxSize = 1 * 1024 * 1024, // 1MB default
    error,
    required = false,
}: FileUploadFieldProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Generate preview for image files using URL.createObjectURL (more reliable than FileReader)
    useEffect(() => {
        // Clear preview immediately if no file
        if (!file) {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            return;
        }

        // Only create preview for image files
        if (!file.type.startsWith('image/')) {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            return;
        }

        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Cleanup: revoke object URL when component unmounts or file changes
        return () => {
            URL.revokeObjectURL(objectUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;

        if (selectedFile && selectedFile.size > maxSize) {
            // Let parent handle the error
            return;
        }

        onChange(selectedFile);
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const isImage = file && file.type.startsWith('image/');

    return (
        <div>
            <Label>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="mt-2">
                <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                    {previewUrl ? (
                        // Show image preview
                        <div className="relative w-full h-full group">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                fill
                                className="object-cover"
                                unoptimized
                                onError={() => {
                                    // Fallback if image fails to load
                                    if (previewUrl) {
                                        URL.revokeObjectURL(previewUrl);
                                        setPreviewUrl(null);
                                    }
                                }}
                            />
                            {/* Overlay on hover - using group hover instead of individual hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center pointer-events-none">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center">
                                    <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs text-white">Click to change</span>
                                </div>
                            </div>
                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                                aria-label="Remove file"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        // Show upload placeholder
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 w-full">
                            <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                                {file ? file.name : 'Click to upload'}
                            </p>
                            {file && !isImage && (
                                <p className="text-xs text-gray-400">{file.type}</p>
                            )}
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleFileSelect}
                    />
                </label>
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

