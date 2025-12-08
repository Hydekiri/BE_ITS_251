/**
 * SOLID Principles: Interface Segregation Principle (ISP), Dependency Inversion Principle (DIP)
 * 
 * ISP: This interface defines ONLY token generation/verification operations.
 *      It doesn't include unrelated concerns like password hashing or session management.
 * 
 * DIP: AuthService depends on this abstraction, not on the JWT library directly.
 *      We can switch to different token mechanisms (OAuth, custom tokens) by creating new implementations.
 */

export interface TokenPayload {
    sub: string; // user id
    email: string;
    username: string;
    role?: string;
}

export interface ITokenGenerator {
    /**
     * Generate an access token
     * @param payload - The data to encode in the token
     * @param expiresInSeconds - Token expiration time in seconds
     * @returns The generated token string
     */
    generateAccessToken(payload: TokenPayload, expiresInSeconds: number): string;

    /**
     * Generate a refresh token
     * @param userId - The user ID to encode
     * @param expiresInSeconds - Token expiration time in seconds
     * @returns The generated refresh token string
     */
    generateRefreshToken(userId: string, expiresInSeconds: number): string;

    /**
     * Verify and decode a token
     * @param token - The token to verify
     * @returns The decoded payload or null if invalid
     */
    verifyToken(token: string): any | null;
}
