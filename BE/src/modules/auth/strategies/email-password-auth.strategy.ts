import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import type { IAuthenticationStrategy, AuthCredentials, AuthResult } from '../interfaces/i-authentication-strategy.interface';
import { BcryptPasswordHasher } from '../services/bcrypt-password-hasher.service';

/**
 * SOLID Principles: Open/Closed Principle (OCP), Liskov Substitution Principle (LSP), Single Responsibility (SRP)
 * 
 * OCP: This is ONE authentication strategy. We can add OAuth2Strategy, LdapStrategy, SsoStrategy
 *      without modifying existing code. The system is OPEN for extension, CLOSED for modification.
 * 
 * LSP: This class can be substituted with any other IAuthenticationStrategy implementation.
 *      The AuthService doesn't need to know which specific strategy is being used.
 * 
 * SRP: This class has ONE responsibility - authenticate users via email/password.
 *      It delegates password verification to IPasswordHasher (following SRP and DIP).
 * 
 * Example future strategy: OAuth2GoogleStrategy implements IAuthenticationStrategy,
 * uses Google OAuth tokens for authentication. No changes to AuthService needed!
 */
@Injectable()
export class EmailPasswordAuthStrategy implements IAuthenticationStrategy {
    constructor(
        private readonly usersService: UsersService,
        private readonly passwordHasher: BcryptPasswordHasher,
    ) { }

    async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
        const { email, password } = credentials;

        if (!email || !password) {
            throw new UnauthorizedException('Email and password are required');
        }

        // Find user by email
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password using the injected password hasher (DIP)
        const isPasswordValid = await this.passwordHasher.verify(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            userId: user.id,
            user,
        };
    }

    getStrategyName(): string {
        return 'email-password';
    }
}
