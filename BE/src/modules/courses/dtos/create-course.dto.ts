import { IsNotEmpty, IsOptional, IsString, IsArray, IsInt } from 'class-validator';

export class CreateCourseDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    subjectId?: string;

    @IsOptional()
    @IsString()
    classLevel?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    thumbnailUrl?: string;

    @IsOptional()
    @IsInt()
    estimatedDurationHours?: number;

    @IsOptional()
    @IsInt()
    maxStudents?: number;
}
