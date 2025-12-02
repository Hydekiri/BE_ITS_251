import { Controller, Post, Body, HttpCode, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../users/models/create-user.dto';
import { LoginDto } from '../models/login.dto';
import { RefreshDto } from '../models/refresh.dto';
import { LogoutDto } from '../models/logout.dto';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	// legacy register route kept for compatibility (can be removed later)
	@Post('register')
	async register(@Body() createUserDto: CreateUserDto) {
		return this.authService.register(createUserDto);
	}

	@Post('login')
	@HttpCode(201)
	async login(@Body() loginDto: LoginDto, @Req() req: Request) {
		const ip = req.ip || req.connection?.remoteAddress;
		const ua = req.headers['user-agent'] || '';
		// pass rememberMe through loginDto
		return this.authService.login(loginDto, ip as string, ua as string);
	}

	@Post('refresh')
	async refresh(@Body() dto: RefreshDto) {
		return this.authService.refresh(dto.refreshToken);
	}

	@Post('logout')
	async logout(@Body() dto: LogoutDto, @Req() req: Request) {
		const authHeader = req.headers['authorization'] as string | undefined;
		return this.authService.logout(dto.refreshToken, authHeader);
	}
}
