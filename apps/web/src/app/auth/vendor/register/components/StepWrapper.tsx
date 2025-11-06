/**
 * Step Wrapper Component
 * 
 * Provides consistent layout for each step
 */

'use client';

import React from 'react';

interface StepWrapperProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    error?: string | null;
    footer?: React.ReactNode;
    progressIndicator?: React.ReactNode;
}

export function StepWrapper({ title, subtitle, children, error, footer, progressIndicator }: StepWrapperProps) {
    return (
        <>
            {title && <h1 className="text-2xl font-bold mb-2 text-left">{title}</h1>}
            {subtitle && <p className="text-gray-600 mb-6 text-left">{subtitle}</p>}

            {progressIndicator && <div className="mb-6">{progressIndicator}</div>}

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}

            {children}

            {footer}
        </>
    );
}

