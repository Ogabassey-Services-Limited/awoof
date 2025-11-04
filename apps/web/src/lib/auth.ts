/**
 * Authentication Utilities
 * 
 * Token management and auth helpers
 */

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface User {
    id: string;
    email: string;
    role: 'student' | 'vendor' | 'admin';
    verificationStatus?: 'unverified' | 'verified' | 'expired';
}

/**
 * Store tokens in localStorage
 */
export function storeTokens(tokens: TokenPair): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
    }
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('refreshToken');
    }
    return null;
}

/**
 * Clear tokens (logout)
 */
export function clearTokens(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getAccessToken();
}

/**
 * Get user role
 */
export function getUserRole(): User['role'] | null {
    const token = getAccessToken();
    if (!token) return null;

    try {
        // Decode JWT token (basic decode, no verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || null;
    } catch {
        return null;
    }
}

/**
 * Decode user from token
 */
export function getUserFromToken(): User | null {
    const token = getAccessToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            id: payload.userId || payload.id,
            email: payload.email,
            role: payload.role,
            verificationStatus: payload.verificationStatus,
        };
    } catch {
        return null;
    }
}

