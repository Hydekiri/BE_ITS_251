import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Course } from '../models/course.entity';
import { ModuleEntity } from '../models/module.entity';
import { Lesson } from '../models/lesson.entity';
import { Enrollment } from '../models/enrollment.entity';
import { CreateCourseDto } from '../dtos/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(ModuleEntity)
    private readonly moduleRepo: Repository<ModuleEntity>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
  ) {}

  async list(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const qb: SelectQueryBuilder<Course> = this.courseRepo.createQueryBuilder('c');
    if (query.subject) qb.andWhere('c.subject = :subject', { subject: query.subject });
    if (query.status) qb.andWhere('c.status = :status', { status: query.status });
    if (query.classLevel) qb.andWhere('c.classLevel = :classLevel', { classLevel: query.classLevel });
    if (query.search) qb.andWhere('c.title ILIKE :s', { s: `%${query.search}%` });
    const sortBy = query.sortBy || 'createdAt';
    const order = (query.order || 'desc').toUpperCase();
    qb.orderBy(`c."${sortBy}"`, order as 'ASC' | 'DESC');

    const totalItems = await qb.getCount();
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const items = await qb.skip((page - 1) * limit).take(limit).getMany();
    return {
      success: true,
      data: {
        courses: items,
        pagination: { currentPage: page, totalPages, totalItems, limit },
      },
    };
  }

  async findOne(courseId: string) {
    const course = await this.courseRepo.findOne({ where: { id: courseId }, relations: ['modules', 'modules.lessons'] });
    return { success: true, data: course };
  }

  async create(dto: CreateCourseDto, teacherId: string, teacherName?: string) {
    const c = this.courseRepo.create({
      title: dto.title,
      description: dto.description,
      subject: dto.subjectId,
      teacherId,
      teacherName,
      classLevel: dto.classLevel,
      status: dto.status || 'draft',
      thumbnailUrl: dto.thumbnailUrl,
      estimatedDurationHours: dto.estimatedDurationHours,
      enrollmentCount: 0,
    });
    const saved = await this.courseRepo.save(c);
    return { success: true, data: saved, message: 'Khóa học đã được tạo thành công' };
  }

  async enroll(courseId: string, studentId: string, notes?: string) {
    const enroll = this.enrollRepo.create({ courseId, studentId, enrollmentStatus: 'active', progressPercentage: 0 });
    const saved = await this.enrollRepo.save(enroll);
    // increment course enrollmentCount
    await this.courseRepo.increment({ id: courseId }, 'enrollmentCount', 1);
    return {
      success: true,
      data: {
        enrollmentId: saved.id,
        courseId,
        studentId,
        enrollmentStatus: saved.enrollmentStatus,
        enrolledAt: saved.enrolledAt,
        progressPercentage: saved.progressPercentage,
      },
      message: 'Đã đăng ký khóa học thành công',
    };
  }

  async listLessons(courseId: string, moduleId: string, page = 1, limit = 10) {
    const qb = this.lessonRepo.createQueryBuilder('l').where('l.module_id = :moduleId', { moduleId });
    const totalItems = await qb.getCount();
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const items = await qb.skip((page - 1) * limit).take(limit).getMany();
    return {
      success: true,
      data: {
        moduleId,
        moduleName: undefined,
        lessons: items,
        pagination: { currentPage: page, totalPages, totalItems },
      },
    };
  }
}
