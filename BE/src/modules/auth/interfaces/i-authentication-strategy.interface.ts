/**
 * SOLID Principles: Open/Closed Principle (OCP), Liskov Substitution Principle (LSP)
 * 
 * OCP: This abstract interface allows the system to be OPEN for extension (adding new auth strategies)
 *      but CLOSED for modification (existing code doesn't need to change).
 *      Examples of future strategies: OAuth, LDAP, SSO, biometric authentication.
 * 
 * LSP: All implementations of IAuthenticationStrategy can be substituted for one another.
 *      The AuthService can work with any strategy without knowing the specific implementation.
 */

export interface AuthCredentials {
    email?: string;
    password?: string;
    oauthToken?: string;
    [key: string]: any; // Allow extensibility for future auth methods
}

export interface AuthResult {
    userId: string;
    user: any;
}

export interface IAuthenticationStrategy {
    /**
     * Authenticate a user with the given credentials
     * @param credentials - The authentication credentials
     * @returns Promise resolving to the authenticated user data
     * @throws UnauthorizedException if authentication fails
     */
    authenticate(credentials: AuthCredentials): Promise<AuthResult>;

    /**
     * Get the name of this authentication strategy
     * @returns The strategy name (e.g., 'email-password', 'oauth-google')
     */
    getStrategyName(): string;
}
