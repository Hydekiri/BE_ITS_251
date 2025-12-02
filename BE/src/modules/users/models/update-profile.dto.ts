import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    profile?: any;
}
