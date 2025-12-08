import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../interfaces/i-password-hasher.interface';

/**
 * SOLID Principles: Single Responsibility Principle (SRP), Dependency Inversion Principle (DIP)
 * 
 * SRP: This class has ONE responsibility - handle password hashing using bcrypt.
 *      It doesn't handle authentication, tokens, or sessions.
 * 
 * DIP: This is a concrete implementation of IPasswordHasher interface.
 *      It can be easily swapped with Argon2PasswordHasher or ScryptPasswordHasher
 *      without changing any code that depends on IPasswordHasher.
 * 
 * Example of extensibility: If we want to use argon2 instead, we create a new
 * Argon2PasswordHasher implementing IPasswordHasher and swap it in the module.
 */
@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
    private readonly SALT_ROUNDS = 10;

    async hash(plainPassword: string): Promise<string> {
        return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
    }

    async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}
