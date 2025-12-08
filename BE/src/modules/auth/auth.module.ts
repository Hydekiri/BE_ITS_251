import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { UserSession } from './models/user-session.entity';

// Import interfaces (for type checking)
import { IPasswordHasher } from './interfaces/i-password-hasher.interface';
import { ITokenGenerator } from './interfaces/i-token-generator.interface';
import { ISessionManager } from './interfaces/i-session-manager.interface';
import { IAuthenticationStrategy } from './interfaces/i-authentication-strategy.interface';

// Import concrete implementations
import { BcryptPasswordHasher } from './services/bcrypt-password-hasher.service';
import { JwtTokenGenerator } from './services/jwt-token-generator.service';
import { SessionManagerService } from './services/session-manager.service';
import { EmailPasswordAuthStrategy } from './strategies/email-password-auth.strategy';

/**
 * SOLID Principle: Dependency Inversion Principle (DIP) - Demonstrated via NestJS Dependency Injection
 * 
 * This module is configured to inject concrete implementations directly.
 * The services still follow all SOLID principles - the AuthService depends on specific service interfaces,
 * and we can swap implementations by changing the providers here.
 */

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([UserSession])],
	providers: [
		// Service implementations
		BcryptPasswordHasher,
		JwtTokenGenerator,
		SessionManagerService,
		EmailPasswordAuthStrategy,

		// Main auth service
		AuthService,
	],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule { }
