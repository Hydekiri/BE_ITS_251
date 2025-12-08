/**
 * SOLID Principles: Interface Segregation Principle (ISP), Single Responsibility Principle (SRP)
 * 
 * ISP: This interface defines ONLY session management operations.
 *      Clients that need session management don't need to depend on token generation or password hashing.
 * 
 * SRP: Session management is a distinct responsibility separated from authentication logic.
 */

import { UserSession } from '../models/user-session.entity';

export interface CreateSessionDto {
    userId: string;
    refreshToken: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
}

export interface ISessionManager {
    /**
     * Create a new user session
     * @param sessionData - The session data to create
     * @returns Promise resolving to the created session
     */
    createSession(sessionData: CreateSessionDto): Promise<UserSession>;

    /**
     * Find an active session by refresh token
     * @param refreshToken - The refresh token to search for
     * @returns Promise resolving to the session or null if not found
     */
    findActiveSession(refreshToken: string): Promise<UserSession | null>;

    /**
     * Invalidate a session (logout)
     * @param refreshToken - The refresh token of the session to invalidate
     * @returns Promise resolving to true if successful
     */
    invalidateSession(refreshToken: string): Promise<boolean>;

    /**
     * Clean up expired sessions
     * @returns Promise resolving to the number of sessions deleted
     */
    cleanupExpiredSessions(): Promise<number>;
}
