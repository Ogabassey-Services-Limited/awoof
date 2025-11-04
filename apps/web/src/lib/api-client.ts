/**
 * API Client
 * 
 * Centralized HTTP client with interceptors for authentication
 */

import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Get API URL from environment or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Create axios instance
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage (client-side only)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - Handle token refresh and errors
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized) - token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/api/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;

                    // Store new tokens
                    localStorage.setItem('accessToken', accessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;

