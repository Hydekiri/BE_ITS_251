import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module'; 
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { AiTutorModule } from './modules/ai-tutor/ai-tutor.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig()),
    UsersModule,
    AuthModule,
    CoursesModule,
    AssessmentsModule,
    AiTutorModule,
  ],
})
export class AppModule {}
