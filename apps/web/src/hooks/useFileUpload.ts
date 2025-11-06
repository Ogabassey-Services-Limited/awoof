/**
 * Custom Hook for File Upload Management
 * 
 * Single Responsibility: Only handles file validation and state
 */

import { useState, useCallback } from 'react';

export interface FileUploadOptions {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
}

export function useFileUpload(options: FileUploadOptions = {}) {
    const { maxSize = 1 * 1024 * 1024, allowedTypes = [] } = options;
    const [files, setFiles] = useState<Record<string, File | null>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateFile = useCallback(
        (file: File | null): string | null => {
            if (!file) return null;

            if (file.size > maxSize) {
                return `Max file size is ${(maxSize / (1024 * 1024)).toFixed(0)}MB`;
            }

            if (allowedTypes.length > 0) {
                const fileType = file.type;
                const isValidType = allowedTypes.some((type) => fileType.includes(type));
                if (!isValidType) {
                    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
                }
            }

            return null;
        },
        [maxSize, allowedTypes]
    );

    const setFile = useCallback(
        (fieldName: string, file: File | null) => {
            const error = validateFile(file);

            setFiles((prev) => {
                const updated = { ...prev, [fieldName]: file };
                return updated;
            });
            setErrors((prev) => {
                const newErrors = { ...prev };
                if (error) {
                    newErrors[fieldName] = error;
                } else {
                    delete newErrors[fieldName];
                }
                return newErrors;
            });

            return error === null;
        },
        [validateFile]
    );

    const validateAllFiles = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        Object.entries(files).forEach(([fieldName, file]) => {
            if (file) {
                const error = validateFile(file);
                if (error) {
                    newErrors[fieldName] = error;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [files, validateFile]);

    const clearFiles = useCallback(() => {
        setFiles({});
        setErrors({});
    }, []);

    const getFile = useCallback(
        (fieldName: string) => files[fieldName] || null,
        [files]
    );

    const getError = useCallback(
        (fieldName: string) => errors[fieldName] || null,
        [errors]
    );

    return {
        files,
        errors,
        setFile,
        validateAllFiles,
        clearFiles,
        getFile,
        getError,
    };
}

