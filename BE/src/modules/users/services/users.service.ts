import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';
import { CreateUserDto } from '../models/create-user.dto';
import { PasswordResetToken } from '../models/password-reset.entity';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PasswordResetToken)
        private readonly resetRepo: Repository<PasswordResetToken>,
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(id: string): Promise<User | null> {
        return this.userRepository.findOneBy({ id });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({ email });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create({
        username: createUserDto.username,
        fullName: createUserDto.fullName ?? createUserDto.username,
        password: createUserDto.password,
        email: createUserDto.email,
        phone: createUserDto.phone,
        address: createUserDto.address,
        });
        return this.userRepository.save(user);
    }

    async updateProfile(userId: string, patch: Partial<User>): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new BadRequestException('User not found');
        Object.assign(user, patch);
        return this.userRepository.save(user);
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new BadRequestException('User not found');
        const matched = await bcrypt.compare(currentPassword, user.password);
        if (!matched) throw new UnauthorizedException('Current password is incorrect');
        user.password = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);
        return true;
    }

    async createPasswordReset(email: string) {
        const user = await this.findByEmail(email);
        if (!user) return null; // do not reveal
        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours
        const rec = this.resetRepo.create({ userId: user.id, token, expiresAt });
        await this.resetRepo.save(rec);
        return token;
    }

    async resetPassword(token: string, newPassword: string) {
        const rec = await this.resetRepo.findOneBy({ token });
        if (!rec) throw new BadRequestException('Invalid or expired token');
        if (rec.expiresAt.getTime() < Date.now()) {
            await this.resetRepo.delete({ id: rec.id });
            throw new BadRequestException('Token expired');
        }
        const user = await this.findOne(rec.userId);
        if (!user) throw new BadRequestException('User not found');
        user.password = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);
        await this.resetRepo.delete({ id: rec.id });
        return true;
    }
}
