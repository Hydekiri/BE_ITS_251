import { IsEmail, IsNotEmpty, IsString, IsIn, IsOptional, IsDateString, Matches } from 'class-validator';

export class RegisterUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).*/, { message: 'Password too weak' })
    password: string;

    @IsNotEmpty()
    @IsString()
    passwordConfirm: string;

    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsOptional()
    @IsIn(['student', 'teacher', 'admin'])
    role?: string = 'student';

    @IsOptional()
    @IsString()
    classLevel?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @IsOptional()
    @IsIn(['male', 'female', 'other'])
    gender?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;
}
