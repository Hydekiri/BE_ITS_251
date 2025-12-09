import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ITokenGenerator, TokenPayload } from '../interfaces/i-token-generator.interface';

/**
 * SOLID Principles: Single Responsibility Principle (SRP), Dependency Inversion Principle (DIP)
 * 
 * SRP: This class has ONE responsibility - generate and verify JWT tokens.
 *      It doesn't handle authentication logic, password hashing, or session management.
 * 
 * DIP: This is a concrete implementation of ITokenGenerator interface.
 *      We could create OAuth2TokenGenerator, PassportTokenGenerator, etc.
 *      and swap them without changing dependent code.
 * 
 * Configuration is injected through environment variables, following DIP.
 */
@Injectable()
export class JwtTokenGenerator implements ITokenGenerator {
    private readonly jwtSecret: string;

    constructor() {
        // In a production app, inject this via ConfigService (also following DIP)
        this.jwtSecret = process.env.JWT_SECRET || 'change_this_secret';
    }

    generateAccessToken(payload: TokenPayload, expiresInSeconds: number): string {
        return jwt.sign(payload, this.jwtSecret, { expiresIn: `${expiresInSeconds}s` });
    }

    generateRefreshToken(userId: string, expiresInSeconds: number): string {
        return jwt.sign({ sub: userId }, this.jwtSecret, { expiresIn: `${expiresInSeconds}s` });
    }

    verifyToken(token: string): any | null {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            return null;
        }
    }
}
