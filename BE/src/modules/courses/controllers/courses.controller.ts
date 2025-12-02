import { Controller, Get, Query, Param, Post, Body, Req, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { CoursesService } from '../services/courses.service';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { EnrollDto } from '../dtos/enroll.dto';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Controller('courses')
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  @Get()
  async list(@Query() query: any) {
    return this.service.list(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateCourseDto, @Headers('authorization') auth: string) {
    // require teacher role - simple check: token contains role
    const userId = this.getUserIdFromAuth(auth);
    const userRole = this.getUserRoleFromAuth(auth);
    if (!userId || userRole !== 'teacher') return { success: false, message: 'Forbidden' };
    const teacherName = undefined;
    return this.service.create(dto, userId, teacherName);
  }

  @Post(':id/enroll')
  @HttpCode(HttpStatus.CREATED)
  async enroll(@Param('id') id: string, @Body() dto: EnrollDto, @Headers('authorization') auth: string) {
    const userId = this.getUserIdFromAuth(auth);
    if (!userId) return { success: false, message: 'Unauthorized' };
    return this.service.enroll(id, userId, dto.enrollmentNotes);
  }

  @Get(':courseId/modules/:moduleId/lessons')
  async listLessons(@Param('courseId') c: string, @Param('moduleId') m: string, @Query('page') page = '1', @Query('limit') limit = '10') {
    return this.service.listLessons(c, m, Number(page), Number(limit));
  }

  private getUserIdFromAuth(auth?: string) {
    if (!auth || !auth.startsWith('Bearer ')) return null;
    try {
      const payload: any = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'change_this_secret');
      return payload.sub as string;
    } catch (err) {
      return null;
    }
  }

  private getUserRoleFromAuth(auth?: string) {
    if (!auth || !auth.startsWith('Bearer ')) return null;
    try {
      const payload: any = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'change_this_secret');
      return payload.role as string;
    } catch (err) {
      return null;
    }
  }
}
