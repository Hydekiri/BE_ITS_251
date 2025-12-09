import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, Patch, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../models/create-user.dto';
import { User } from '../models/user.entity';
// import { RegisterUserDto } from '../models/register-user.dto';
// import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto } from '../models/update-profile.dto';
import { ChangePasswordDto } from '../models/change-password.dto';
import { ForgotPasswordDto } from '../models/forgot-password.dto';
import { ResetPasswordDto } from '../models/reset-password.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

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

    // Deprecated: Use AuthController.register instead
    /*
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterUserDto) {
       // ... moved to AuthController or redundant ...
    }
    */

    @Get('profile/me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() userToken: any) {
        const userId = userToken.sub;
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

    // Keep legacy route but use guard if possible, or redirect? 
    // The original code had @Get('profile'), but typically that's /users/profile. 
    // The previous implementation read headers manually. 
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfileLegacy(@CurrentUser() userToken: any) {
        return this.getProfile(userToken);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@CurrentUser() userToken: any, @Body() dto: UpdateProfileDto) {
        const userId = userToken.sub;
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
    @UseGuards(JwtAuthGuard)
    async changePassword(@CurrentUser() userToken: any, @Body() dto: ChangePasswordDto) {
        const userId = userToken.sub;
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
