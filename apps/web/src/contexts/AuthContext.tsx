/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, storeTokens, clearTokens, getUserFromToken, isAuthenticated as checkAuth } from '@/lib/auth';
import apiClient from '@/lib/api-client';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, role: 'student' | 'vendor') => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Initialize auth state on mount
     */
    useEffect(() => {
        const initAuth = async () => {
            if (checkAuth()) {
                // Try to get user from token
                const userFromToken = getUserFromToken();
                if (userFromToken) {
                    // Try to fetch current user from API
                    try {
                        const response = await apiClient.get('/auth/me');
                        setUser(response.data.data);
                    } catch {
                        // If API call fails, use token data
                        setUser(userFromToken);
                    }
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    /**
     * Login
     */
    const login = async (email: string, password: string) => {
        const response = await apiClient.post('/auth/login', { email, password });
        const { tokens, user: userData } = response.data.data;

        storeTokens(tokens);
        setUser(userData);
    };

    /**
     * Register
     */
    const register = async (email: string, password: string, name: string, role: 'student' | 'vendor') => {
        const response = await apiClient.post('/auth/register', {
            email,
            password,
            name,
            role,
        });
        const { tokens, user: userData } = response.data.data;

        storeTokens(tokens);
        setUser(userData);
    };

    /**
     * Logout
     */
    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch {
            // Ignore errors on logout
        } finally {
            clearTokens();
            setUser(null);
        }
    };

    /**
     * Refresh user data
     */
    const refreshUser = async () => {
        if (checkAuth()) {
            try {
                const response = await apiClient.get('/auth/me');
                setUser(response.data.data);
            } catch {
                // If refresh fails, clear auth
                clearTokens();
                setUser(null);
            }
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

