import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Req, Patch, Headers } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../models/create-user.dto';
import { User } from '../models/user.entity';
import { RegisterUserDto } from '../models/register-user.dto';
import * as bcrypt from 'bcryptjs';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { UpdateProfileDto } from '../models/update-profile.dto';
import { ChangePasswordDto } from '../models/change-password.dto';
import { ForgotPasswordDto } from '../models/forgot-password.dto';
import { ResetPasswordDto } from '../models/reset-password.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<User | { message: string }> {
        const user = await this.usersService.findOne(id);
        if (!user) return { message: 'User not found' };
        return user;
    }

    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterUserDto) {
        // password confirmation
        if (dto.password !== dto.passwordConfirm) {
            return { success: false, message: 'password and passwordConfirm do not match' };
        }

        // check email exists
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            return { success: false, message: 'Email already exists' };
        }

        // hash password
        const hashed = await bcrypt.hash(dto.password, 10);

        // create user
        const user = await this.usersService.create({
            username: dto.email.split('@')[0],
            fullName: dto.fullName,
            password: hashed,
            email: dto.email,
            phone: dto.phoneNumber,
            address: dto.classLevel,
        } as any);

        return {
            success: true,
            data: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: dto.role ?? 'student',
                createdAt: user.createdAt ?? new Date(),
            },
            message: 'Đăng ký thành công. Vui lòng kiểm tra email xác nhận.',
        };
    }

    // helper to extract user id from Authorization header
    private getUserIdFromAuth(authHeader?: string) {
        if (!authHeader) return null;
        if (!authHeader.startsWith('Bearer ')) return null;
        const token = authHeader.replace('Bearer ', '');
        try {
            const payload: any = jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret');
            return payload.sub as string;
        } catch (err) {
            return null;
        }
    }

    @Get('profile')
    async getProfile(@Headers('authorization') auth: string) {
        const userId = this.getUserIdFromAuth(auth);
        if (!userId) return { success: false, message: 'Unauthorized' };
        const user = await this.usersService.findOne(userId);
        if (!user) return { success: false, message: 'User not found' };
        // assemble profile // some fields might be null
        return {
            success: true,
            data: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: (user as any).avatarUrl ?? null,
                role: (user as any).role ?? 'student',
                status: (user as any).status ?? 'active',
                phoneNumber: user.phone,
                dateOfBirth: (user as any).dateOfBirth ?? null,
                gender: (user as any).gender ?? null,
                address: user.address,
                profile: (user as any).profile ?? {},
                createdAt: user.createdAt,
                updatedAt: (user as any).updatedAt ?? user.createdAt,
            },
        };
    }

    @Patch('profile')
    async updateProfile(@Headers('authorization') auth: string, @Body() dto: UpdateProfileDto) {
        const userId = this.getUserIdFromAuth(auth);
        if (!userId) return { success: false, message: 'Unauthorized' };
        const patch: any = {};
        if (dto.fullName) patch.fullName = dto.fullName;
        if (dto.phoneNumber) patch.phone = dto.phoneNumber;
        if (dto.avatarUrl) patch.avatarUrl = dto.avatarUrl;
        if (dto.address) patch.address = dto.address;
        if (dto.profile) patch.profile = dto.profile;
        const user = await this.usersService.updateProfile(userId, patch);
        return {
            success: true,
            data: {
                id: user.id,
                fullName: user.fullName,
                phoneNumber: user.phone,
                avatarUrl: (user as any).avatarUrl ?? null,
                updatedAt: (user as any).updatedAt ?? new Date(),
            },
            message: 'Cập nhật hồ sơ thành công',
        };
    }

    @Patch('password')
    async changePassword(@Headers('authorization') auth: string, @Body() dto: ChangePasswordDto) {
        const userId = this.getUserIdFromAuth(auth);
        if (!userId) return { success: false, message: 'Unauthorized' };
        if (dto.newPassword !== dto.confirmPassword) return { success: false, message: 'Passwords do not match' };
        await this.usersService.changePassword(userId, dto.currentPassword, dto.newPassword);
        return { success: true, message: 'Mật khẩu đã được thay đổi thành công' };
    }

    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        // always return success to avoid leaking existence
        const token = await this.usersService.createPasswordReset(dto.email);
        // TODO: send token via email in real app
        return { success: true, message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra trong vòng 24 giờ.' };
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        if (dto.newPassword !== dto.confirmPassword) return { success: false, message: 'Passwords do not match' };
        await this.usersService.resetPassword(dto.resetToken, dto.newPassword);
        return { success: true, message: 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập với mật khẩu mới.' };
    }
}
