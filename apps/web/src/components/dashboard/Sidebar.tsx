import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import type { DashboardNavItem } from './types';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
    navItems: DashboardNavItem[];
    secondaryNavItems?: DashboardNavItem[];
    isCollapsed?: boolean;
    onNavigate?: () => void;
    onLogout?: () => void;
    logoutLabel?: string;
}

export function DashboardSidebar({
    navItems,
    secondaryNavItems,
    isCollapsed = false,
    onNavigate,
    onLogout,
    logoutLabel,
}: DashboardSidebarProps) {
    const pathname = usePathname();

    const renderItems = (items: DashboardNavItem[], variant: 'primary' | 'secondary') =>
        items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
                <Link
                    key={item.id}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                        'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                        variant === 'primary'
                            ? 'text-white/80 hover:bg-white/10 hover:text-white'
                            : 'text-white/60 hover:bg-white/5 hover:text-white',
                        isActive && 'bg-white text-blue-600 shadow-sm'
                    )}
                >
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    {!isCollapsed && (
                        <>
                            <span>{item.label}</span>
                            {item.badge && <span className="ml-auto text-xs font-semibold">{item.badge}</span>}
                        </>
                    )}
                </Link>
            );
        });

    const hasGeneralSection = (secondaryNavItems && secondaryNavItems.length > 0) || onLogout;

    return (
        <aside
            className={cn(
                'flex h-full flex-col justify-between bg-blue-600 px-3 py-6 text-white transition-all duration-300',
                isCollapsed ? 'w-20' : 'w-64'
            )}
        >
            <div className="space-y-8">
                <div className={cn('px-4 text-xl font-bold tracking-tight', isCollapsed && 'text-center text-lg')}>
                    {isCollapsed ? 'A' : 'Awoof'}
                </div>

                <nav className="space-y-1">{renderItems(navItems, 'primary')}</nav>
            </div>

            {hasGeneralSection && (
                <div className="space-y-3">
                    <div className={cn('px-4 text-xs uppercase tracking-wide text-white/40', isCollapsed && 'text-center')}>
                        General
                    </div>
                    {secondaryNavItems && secondaryNavItems.length > 0 && (
                        <nav className="space-y-1">{renderItems(secondaryNavItems, 'secondary')}</nav>
                    )}
                    {onLogout && (
                        <button
                            type="button"
                            onClick={onLogout}
                            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <LogOut className="h-5 w-5" />
                            {!isCollapsed && <span>{logoutLabel ?? 'Log out'}</span>}
                        </button>
                    )}
                </div>
            )}
        </aside>
    );
}

