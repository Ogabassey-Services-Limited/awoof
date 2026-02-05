'use client';

import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
    title: string;
    description: string;
    className?: string;
}

export function InfoTooltip({ title, description, className = '' }: InfoTooltipProps) {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!visible) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setVisible(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [visible]);

    return (
        <div className={`relative inline-flex ${className}`} ref={ref}>
            <button
                type="button"
                aria-label="More info"
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                onClick={() => setVisible((v) => !v)}
                className="rounded-full p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
                <Info className="h-4 w-4" strokeWidth={2} />
            </button>
            {visible && (
                <div
                    className="absolute bottom-full left-1/2 z-50 mb-1 w-72 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-lg"
                    onMouseEnter={() => setVisible(true)}
                    onMouseLeave={() => setVisible(false)}
                >
                    <p className="text-sm font-medium text-slate-900">{title}</p>
                    <p className="mt-1 text-xs text-slate-600">{description}</p>
                </div>
            )}
        </div>
    );
}
