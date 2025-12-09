import { Controller, Post, Body, HttpCode, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../users/models/create-user.dto';
import { LoginDto } from '../models/login.dto';
import { RefreshDto } from '../models/refresh.dto';
import { LogoutDto } from '../models/logout.dto';
import type { Request } from 'express';

/**
 * Authentication Controller
 * Handles HTTP endpoints for user authentication
 * 
 * Endpoints:
 * - POST /auth/register - Register new user
 * - POST /auth/login - Login with email/password
 * - POST /auth/refresh - Refresh access token
 * - POST /auth/logout - Logout and invalidate session
 */
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	async register(@Body() createUserDto: CreateUserDto) {
		return this.authService.register(createUserDto);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() loginDto: LoginDto, @Req() req: Request) {
		const ip = req.ip || req.connection?.remoteAddress;
		const ua = req.headers['user-agent'] || '';
		const result = await this.authService.login(loginDto, ip as string, ua as string);

		// Return success response with user role for frontend routing
		return {
			success: true,
			data: {
				...result.data,
				user: {
					...result.data.user,
					role: result.data.user.role || 'student', // Ensure role is always present
				},
			},
		};
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	async refresh(@Body() dto: RefreshDto) {
		return this.authService.refresh(dto.refreshToken);
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	async logout(@Body() dto: LogoutDto, @Req() req: Request) {
		const authHeader = req.headers['authorization'] as string | undefined;
		return this.authService.logout(dto.refreshToken, authHeader);
	}
}
