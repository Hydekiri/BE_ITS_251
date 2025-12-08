'use client';

/**
 * Authentication Context
 * 
 * Provides global authentication state and methods to the entire application
 * Uses React Context API for state management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, LoginCredentials } from '../services/auth.service';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        setIsLoading(true);
        const isAuth = AuthService.isAuthenticated();

        if (isAuth) {
            const userData = AuthService.getUserData();
            setUser(userData);
        } else {
            setUser(null);
        }

        setIsLoading(false);
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await AuthService.login(credentials);

            if (response.success && response.data.user) {
                setUser(response.data.user);

                // Redirect based on role
                const role = response.data.user.role;
                if (role === 'teacher') {
                    router.push('/home'); // or teacher-specific dashboard
                } else {
                    router.push('/home'); // student dashboard
                }
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AuthService.logout();
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Clear local state even if API fails
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
