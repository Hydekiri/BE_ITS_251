/**
 * SOLID Principles: Interface Segregation Principle (ISP), Dependency Inversion Principle (DIP)
 * 
 * ISP: This interface defines ONLY password hashing operations, keeping it focused and minimal.
 *      Clients that need password hashing don't need to depend on unrelated authentication operations.
 * 
 * DIP: High-level modules (like AuthService) depend on this abstraction rather than concrete implementations.
 *      This allows swapping between different hashing algorithms (bcrypt, argon2, scrypt) without changing dependent code.
 */

export interface IPasswordHasher {
    /**
     * Hash a plain text password
     * @param plainPassword - The plain text password to hash
     * @returns Promise resolving to the hashed password
     */
    hash(plainPassword: string): Promise<string>;

    /**
     * Verify a plain text password against a hash
     * @param plainPassword - The plain text password to verify
     * @param hashedPassword - The hashed password to compare against
     * @returns Promise resolving to true if passwords match, false otherwise
     */
    verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
