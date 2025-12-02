import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentsController } from './controllers/assessments.controller';
import { AssessmentsService } from './services/assessments.service';
import { Exercise } from './models/exercise.entity';
import { ExerciseQuestion } from './models/exercise-question.entity';
import { ExerciseSubmission } from './models/exercise-submission.entity';
import { SubmissionAnswer } from './models/submission-answer.entity';
import { AiService } from '../ai/ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, ExerciseQuestion, ExerciseSubmission, SubmissionAnswer])],
  controllers: [AssessmentsController],
  providers: [AssessmentsService, AiService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}
