import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './services/courses.service';
import { CoursesController } from './controllers/courses.controller';
import { Course } from './models/course.entity';
import { ModuleEntity } from './models/module.entity';
import { Lesson } from './models/lesson.entity';
import { Enrollment } from './models/enrollment.entity';
import { AiService } from '../ai/ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, ModuleEntity, Lesson, Enrollment])],
  providers: [CoursesService, AiService],
  controllers: [CoursesController],
  exports: [CoursesService],
})
export class CoursesModule {}
