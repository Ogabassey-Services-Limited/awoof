import type { ReactNode } from 'react';

export interface DashboardNavItem {
    id: string;
    label: string;
    href: string;
    icon?: ReactNode;
    badge?: ReactNode;
}

export interface DashboardUserSummary {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    roleLabel?: string | null;
    secondaryText?: string | null;
    profileHref?: string | null;
}

export interface DashboardLayoutProps {
    navItems: DashboardNavItem[];
    secondaryNavItems?: DashboardNavItem[];
    pageTitle?: string;
    subtitle?: string;
    user?: DashboardUserSummary;
    topbarActions?: ReactNode;
    children: ReactNode;
    onLogout?: () => void;
    logoutLabel?: string;
}

