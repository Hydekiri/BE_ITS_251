import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { CreateUserDto } from '../../users/models/create-user.dto';
import { LoginDto } from '../models/login.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../models/user-session.entity';

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
		private readonly usersService: UsersService,
		@InjectRepository(UserSession)
		private readonly sessionRepo: Repository<UserSession>,
	) {}

	private getJwtSecret(): string {
		return process.env.JWT_SECRET || 'change_this_secret';
	}

	async register(createUserDto: CreateUserDto) {
		const existing = await this.usersService.findByEmail(createUserDto.email);
		if (existing) {
			throw new ConflictException('Email already in use');
		}

		try {
			const hashed = await bcrypt.hash(createUserDto.password, 10);
			const user = await this.usersService.create({ ...createUserDto, password: hashed });

			// remove password before returning
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...safeUser } = user as any;
			return safeUser;
		} catch (err: any) {
			// Log and rethrow a clearer error for devs
			// eslint-disable-next-line no-console
			console.error('Register error:', err?.message ?? err);
			throw new InternalServerErrorException('Failed to create user: ' + (err?.message ?? 'unknown'));
		}
	}

	async login(loginDto: LoginDto, ip?: string, userAgent?: string): Promise<LoginResult> {
		const user = await this.usersService.findByEmail(loginDto.email);
		if (!user) throw new UnauthorizedException('Invalid credentials');

		const matched = await bcrypt.compare(loginDto.password, user.password);
		if (!matched) throw new UnauthorizedException('Invalid credentials');

		const expiresIn = 3600; // seconds
		const payload = { sub: user.id, username: user.username, email: user.email };
		const accessToken = jwt.sign(payload, this.getJwtSecret(), { expiresIn: `${expiresIn}s` });

		// create refresh token (longer expiry)
		// If user checked rememberMe, make refresh token longer (30 days), otherwise 7 days
		const refreshExpiresSec = loginDto?.rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600;
		const refreshToken = jwt.sign({ sub: user.id }, this.getJwtSecret(), { expiresIn: `${refreshExpiresSec}s` });

		// save session
		const expiresAt = new Date(Date.now() + refreshExpiresSec * 1000);
		const session = this.sessionRepo.create({
			userId: user.id,
			refreshToken,
			expiresAt,
			ipAddress: ip,
			userAgent,
			isActive: true,
		});
		await this.sessionRepo.save(session);

		// sanitize user
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
		if (!refreshToken) throw new BadRequestException('refreshToken required');
		// find session
		const session = await this.sessionRepo.findOneBy({ refreshToken });
		if (!session || !session.isActive) throw new UnauthorizedException('Invalid refresh token');
		if (session.expiresAt.getTime() < Date.now()) {
			session.isActive = false;
			await this.sessionRepo.save(session);
			throw new UnauthorizedException('Refresh token expired');
		}

		// verify token signature
		try {
			const payload: any = jwt.verify(refreshToken, this.getJwtSecret());
			const user = await this.usersService.findOne(payload.sub);
			if (!user) throw new UnauthorizedException('Invalid token subject');

			const expiresIn = 3600;
			const accessToken = jwt.sign({ sub: user.id, username: user.username, email: user.email }, this.getJwtSecret(), { expiresIn: `${expiresIn}s` });
			return { success: true, data: { accessToken, expiresIn } };
		} catch (err) {
			throw new UnauthorizedException('Invalid refresh token');
		}
	}

	async logout(refreshToken: string, authHeader?: string) {
		if (!refreshToken) throw new BadRequestException('refreshToken required');
		const session = await this.sessionRepo.findOneBy({ refreshToken });
		if (!session || !session.isActive) return { success: true, message: 'Already logged out' };

		// optional: verify access token belongs to same user
		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.replace('Bearer ', '');
			try {
				const payload: any = jwt.verify(token, this.getJwtSecret());
				if (payload.sub !== session.userId) {
					// ignore mismatch but still invalidate
				}
			} catch (err) {
				// ignore
			}
		}

		session.isActive = false;
		await this.sessionRepo.save(session);
		return { success: true, message: 'Đăng xuất thành công' };
	}
}
