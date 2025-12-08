/**
 * Authentication Service
 * 
 * Frontend service following Single Responsibility Principle
 * Handles all authentication-related API calls and state management
 */

import { ApiClient } from '../utils/api-client';

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            username: string;
            fullName: string;
            role: string;
        };
    };
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    address?: string;
}

export class AuthService {
    /**
     * Login with email and password
     */
    static async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await ApiClient.post<LoginResponse>('/auth/login', credentials);

        // Store tokens and user data
        if (response.success && response.data) {
            ApiClient.setTokens(response.data.accessToken, response.data.refreshToken);
            this.setUserData(response.data.user);
        }

        return response;
    }

    /**
     * Register a new user
     */
    static async register(data: RegisterData): Promise<any> {
        return ApiClient.post('/auth/register', data);
    }

    /**
     * Logout - invalidate session
     */
    static async logout(): Promise<void> {
        const refreshToken = this.getRefreshToken();

        if (refreshToken) {
            try {
                await ApiClient.post('/auth/logout', { refreshToken });
            } catch (error) {
                console.error('Logout API error:', error);
            }
        }

        // Clear local data regardless of API result
        ApiClient.clearTokens();
        this.clearUserData();
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;

        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('userData');

        return !!(token && user);
    }

    /**
     * Get current user data
     */
    static getUserData(): any {
        if (typeof window === 'undefined') return null;

        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Get user role (student, teacher, admin)
     */
    static getUserRole(): string | null {
        const user = this.getUserData();
        return user?.role || null;
    }

    /**
     * Set user data in localStorage
     */
    private static setUserData(user: any): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('userData', JSON.stringify(user));
        }
    }

    /**
     * Clear user data from localStorage
     */
    private static clearUserData(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userData');
        }
    }

    /**
     * Get refresh token
     */
    private static getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('refreshToken');
    }
}
