import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, ChevronDown, Menu, X } from 'lucide-react';
import type { DashboardUserSummary } from './types';

interface DashboardTopbarProps {
    actions?: ReactNode;
    user?: DashboardUserSummary;
    onToggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

export function DashboardTopbar({
    actions,
    user,
    onToggleSidebar,
    isSidebarOpen,
}: DashboardTopbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isMenuOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const profileName = user?.name ?? user?.email ?? 'User';
    const profileSecondary = user?.secondaryText ?? user?.roleLabel ?? user?.email ?? '';

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
                    aria-label="Toggle navigation"
                >
                    {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            <div className="flex items-center gap-4">
                {actions && <div className="hidden md:block">{actions}</div>}

                <button
                    type="button"
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 inline-flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                    </span>
                </button>

                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="flex items-center gap-3  bg-white px-2 py-1.5 text-left transition-colors hover:bg-slate-100"
                    >
                        {user?.avatarUrl ? (
                            <Image
                                src={user.avatarUrl}
                                alt={profileName}
                                className="h-10 w-10 rounded-full object-cover"
                                width={40}
                                height={40}
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                {profileName?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <div className="text-left">
                                <p className="text-sm font-semibold text-slate-900">{profileName}</p>
                                {profileSecondary && <p className="text-xs text-slate-500">{profileSecondary}</p>}
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                        </div>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                            <div className="mb-3 border-b border-slate-100 pb-3">
                                <p className="text-sm font-semibold text-slate-900">{profileName}</p>
                                {profileSecondary && <p className="mt-1 text-xs text-slate-500">{profileSecondary}</p>}
                            </div>
                            <nav className="space-y-2">
                                <Link
                                    href={user?.profileHref ?? '#'}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                >
                                    View profile
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

