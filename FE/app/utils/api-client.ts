/**
 * API Client for making HTTP requests to backend
 * 
 * Features:
 * - Centralized HTTP client configuration
 * - Automatic JWT token attachment
 * - Token refresh on 401 errors
 * - Error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiClient {
    private static accessToken: string | null = null;
    private static refreshToken: string | null = null;

    /**
     * Set authentication tokens
     */
    static setTokens(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        // Store in localStorage for persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
        }
    }

    /**
     * Get stored tokens from localStorage
     */
    static loadTokens() {
        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('accessToken');
            this.refreshToken = localStorage.getItem('refreshToken');
        }
    }

    /**
     * Clear all tokens (logout)
     */
    static clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;

        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
        }
    }

    /**
     * Make an HTTP request with automatic token handling
     */
    static async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        // Ensure tokens are loaded
        if (!this.accessToken && typeof window !== 'undefined') {
            this.loadTokens();
        }

        const url = `${API_BASE_URL}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        // If body is FormData, let browser set Content-Type (with boundary)
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        // Attach access token if available
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Handle 401 Unauthorized - try to refresh token
            if (response.status === 401 && this.refreshToken) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry original request with new token
                    headers['Authorization'] = `Bearer ${this.accessToken}`;
                    const retryResponse = await fetch(url, { ...options, headers });
                    return this.handleResponse<T>(retryResponse);
                }
            }

            return this.handleResponse<T>(response);
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * Refresh the access token using refresh token
     */
    private static async refreshAccessToken(): Promise<boolean> {
        if (!this.refreshToken) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.data.accessToken;

                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', this.accessToken!);
                }

                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        // If refresh fails, clear tokens
        this.clearTokens();
        return false;
    }

    /**
     * Handle API response
     */
    private static async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: response.statusText,
            }));
            throw new Error(error.message || 'API request failed');
        }

        return response.json();
    }

    /**
     * Convenience methods for common HTTP methods
     */
    static get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    static post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    static postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: formData,
        });
    }

    static put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    static delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}
