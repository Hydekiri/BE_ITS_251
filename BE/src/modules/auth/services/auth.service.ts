import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { CreateUserDto } from '../../users/models/create-user.dto';
import { LoginDto } from '../models/login.dto';
import { BcryptPasswordHasher } from './bcrypt-password-hasher.service';
import { JwtTokenGenerator } from './jwt-token-generator.service';
import { SessionManagerService } from './session-manager.service';
import { EmailPasswordAuthStrategy } from '../strategies/email-password-auth.strategy';

/**
 * ALL 5 SOLID PRINCIPLES DEMONSTRATED IN THIS CLASS
 * 
 * 1. Single Responsibility Principle (SRP):
 *    - This service ONLY orchestrates the authentication flow
 *    - It delegates specific tasks to specialized services:
 *      * Password hashing → BcryptPasswordHasher
 *      * Token generation → JwtTokenGenerator
 *      * Session management → SessionManagerService
 *      * User authentication → EmailPasswordAuthStrategy
 * 
 * 2. Open/Closed Principle (OCP):
 *    - This class is OPEN for extension via authentication strategies
 *    - We can add new auth methods (OAuth, LDAP) by creating new strategy classes
 *    - This class is CLOSED for modification - no changes needed for new auth methods
 * 
 * 3. Liskov Substitution Principle (LSP):
 *    - Any authentication strategy can be substituted
 *    - Any password hasher can be substituted
 *    - The code works correctly with any valid implementation
 * 
 * 4. Interface Segregation Principle (ISP):
 *    - Each service has a focused interface with only needed methods
 *    - No forced dependencies on irrelevant methods
 * 
 * 5. Dependency Inversion Principle (DIP):
 *    - This HIGH-LEVEL module depends on service abstractions
 *    - Dependencies are INJECTED, making the code testable and flexible
 *    - Easy to swap implementations in auth.module.ts
 */

type LoginResult = {
	success: boolean;
	data: {
		accessToken: string;
		refreshToken: string;
		expiresIn: number;
		user: any;
	};
};

@Injectable()
export class AuthService {
	constructor(
		// Dependencies injected via NestJS DI container
		private readonly usersService: UsersService,
		private readonly passwordHasher: BcryptPasswordHasher,
		private readonly tokenGenerator: JwtTokenGenerator,
		private readonly sessionManager: SessionManagerService,
		private readonly authStrategy: EmailPasswordAuthStrategy,
	) { }

	async register(createUserDto: CreateUserDto) {
		const existing = await this.usersService.findByEmail(createUserDto.email);
		if (existing) {
			throw new ConflictException('Email already in use');
		}

		try {
			// SRP: Delegate password hashing to dedicated service
			const hashedPassword = await this.passwordHasher.hash(createUserDto.password);
			const user = await this.usersService.create({
				...createUserDto,
				password: hashedPassword,
			});

			// Remove password before returning
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...safeUser } = user as any;
			return safeUser;
		} catch (err: any) {
			// eslint-disable-next-line no-console
			console.error('Register error:', err?.message ?? err);
			throw new BadRequestException('Failed to create user: ' + (err?.message ?? 'unknown'));
		}
	}

	async login(loginDto: LoginDto, ip?: string, userAgent?: string): Promise<LoginResult> {
		// OCP & LSP: Use strategy pattern for authentication
		const authResult = await this.authStrategy.authenticate({
			email: loginDto.email,
			password: loginDto.password,
		});

		const { userId, user } = authResult;

		// SRP: Delegate token generation to dedicated service
		const expiresIn = 3600; // 1 hour for access token
		const refreshExpiresSec = loginDto?.rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600;

		const accessToken = this.tokenGenerator.generateAccessToken(
			{
				sub: userId,
				email: user.email,
				username: user.username,
				role: user.role,
			},
			expiresIn,
		);

		const refreshToken = this.tokenGenerator.generateRefreshToken(userId, refreshExpiresSec);

		// SRP: Delegate session management to dedicated service
		await this.sessionManager.createSession({
			userId,
			refreshToken,
			expiresAt: new Date(Date.now() + refreshExpiresSec * 1000),
			ipAddress: ip,
			userAgent,
		});

		// Sanitize user data
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...safeUser } = user as any;

		return {
			success: true,
			data: {
				accessToken,
				refreshToken,
				expiresIn,
				user: safeUser,
			},
		};
	}

	async refresh(refreshToken: string) {
		if (!refreshToken) {
			throw new BadRequestException('refreshToken required');
		}

		// SRP: Use session manager to find session
		const session = await this.sessionManager.findActiveSession(refreshToken);
		if (!session) {
			throw new UnauthorizedException('Invalid refresh token');
		}

		if (session.expiresAt.getTime() < Date.now()) {
			await this.sessionManager.invalidateSession(refreshToken);
			throw new UnauthorizedException('Refresh token expired');
		}

		// SRP: Use token generator to verify and create new token
		const payload = this.tokenGenerator.verifyToken(refreshToken);
		if (!payload) {
			throw new UnauthorizedException('Invalid refresh token');
		}

		const user = await this.usersService.findOne(payload.sub);
		if (!user) {
			throw new UnauthorizedException('Invalid token subject');
		}

		const expiresIn = 3600;
		const accessToken = this.tokenGenerator.generateAccessToken(
			{
				sub: user.id,
				username: user.username,
				email: user.email,
				role: (user as any).role,
			},
			expiresIn,
		);

		return { success: true, data: { accessToken, expiresIn } };
	}

	async logout(refreshToken: string, authHeader?: string) {
		if (!refreshToken) {
			throw new BadRequestException('refreshToken required');
		}

		// SRP: Delegate session invalidation to session manager
		const invalidated = await this.sessionManager.invalidateSession(refreshToken);

		if (!invalidated) {
			return { success: true, message: 'Already logged out' };
		}

		return { success: true, message: 'Đăng xuất thành công' };
	}
}
