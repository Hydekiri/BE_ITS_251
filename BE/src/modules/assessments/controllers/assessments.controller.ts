import { Controller, Get, Post, Body, Query, Param, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { AssessmentsService } from '../services/assessments.service';
import GenerateExerciseDto from '../dtos/generate-exercise.dto';
import SubmitExerciseDto from '../dtos/submit-exercise.dto';

@Controller()
export class AssessmentsController {
  constructor(private readonly service: AssessmentsService) {}

  @Get('exercises')
  async list(@Query() query: any) {
    return this.service.list(query);
  }

  @Post('exercises/generate')
  async generate(@Body() dto: GenerateExerciseDto) {
    return this.service.generate(dto);
  }

  @Get('exercises/:id')
  async getOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('exercises/:id/submit')
  @HttpCode(HttpStatus.OK)
  async submit(@Param('id') id: string, @Body() dto: SubmitExerciseDto, @Headers('authorization') auth: string) {
    // extract studentId from token if provided
    let studentId: string | null = null;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        // simple decode without verification
        const payload = JSON.parse(Buffer.from(auth.replace('Bearer ', '').split('.')[1] || '', 'base64').toString() || '{}');
        studentId = payload.sub;
      } catch (err) {
        studentId = null;
      }
    }
    studentId = studentId || 'student-' + Date.now();
    return this.service.submitExercise(id, studentId, dto as any);
  }

  @Post('exams/:id/start')
  async startExam(@Param('id') id: string) {
    return this.service.startExam(id);
  }

  @Post('exams/:id/submit')
  async submitExam(@Param('id') id: string, @Body() dto: SubmitExerciseDto, @Headers('authorization') auth: string) {
    let studentId: string | null = null;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const payload = JSON.parse(Buffer.from(auth.replace('Bearer ', '').split('.')[1] || '', 'base64').toString() || '{}');
        studentId = payload.sub;
      } catch (err) {
        studentId = null;
      }
    }
    studentId = studentId || 'student-' + Date.now();
    return this.service.submitExam(id, studentId, dto as any);
  }
}

export default AssessmentsController;
