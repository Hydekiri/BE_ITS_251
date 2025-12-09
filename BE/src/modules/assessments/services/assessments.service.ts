import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../models/exercise.entity';
import { ExerciseQuestion } from '../models/exercise-question.entity';
import { ExerciseSubmission } from '../models/exercise-submission.entity';
import { SubmissionAnswer } from '../models/submission-answer.entity';
import { GenerateExerciseDto } from '../dtos/generate-exercise.dto';
import { v4 as uuidv4 } from 'uuid';
import { AiService } from '../../ai/ai.service';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(Exercise) private readonly exerciseRepo: Repository<Exercise>,
    @InjectRepository(ExerciseQuestion) private readonly questionRepo: Repository<ExerciseQuestion>,
    @InjectRepository(ExerciseSubmission) private readonly submissionRepo: Repository<ExerciseSubmission>,
    @InjectRepository(SubmissionAnswer) private readonly answerRepo: Repository<SubmissionAnswer>,
    private readonly ai: AiService,
  ) {}

  async list(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const qb = this.exerciseRepo.createQueryBuilder('e');
    if (query.status) qb.andWhere('e.status = :status', { status: query.status });
    if (query.courseId) qb.andWhere('e.courseId = :courseId', { courseId: query.courseId });
    if (query.search) qb.andWhere('e.title ILIKE :s', { s: `%${query.search}%` });
    const sortBy = query.sortBy || 'createdAt';
    const order = (query.order || 'desc').toUpperCase();
    qb.orderBy(`e."${sortBy}"`, order as 'ASC' | 'DESC');

    const totalItems = await qb.getCount();
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const items = await qb.skip((page - 1) * limit).take(limit).getMany();
    // map to minimal response fields
    const exercises = items.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      courseId: e.courseId,
      moduleId: e.moduleId,
      difficultyLevel: e.difficultyLevel,
      numQuestions: e.numQuestions,
      timeLimit: e.timeLimit,
      status: e.status,
      dueDate: null,
      assignedAt: e.createdAt,
      generatedBy: e.generatedBy,
      isStarted: false,
      progressPercentage: 0,
    }));
    return { success: true, data: { exercises, pagination: { currentPage: page, totalPages, totalItems } } };
  }

  async generate(dto: GenerateExerciseDto) {
    // basic validation
    if (!dto.courseId || !dto.topic || !dto.numQuestions) throw new Error('Missing parameters');

    // call AiService (simple use of generateSummary to get text); in real app call Gemini and parse JSON
    const prompt = dto.prompt || `Generate ${dto.numQuestions} questions about ${dto.topic}: ${dto.subtopic || ''}`;
    const aiResult = await this.ai.generateSummary(prompt);

    // create exercise and simple questions based on aiResult (stub parsing)
    const exerciseId = 'exercise-' + uuidv4();
    const ex = this.exerciseRepo.create({ id: exerciseId, title: `${dto.topic} (AI Generated)`, description: dto.subtopic, courseId: dto.courseId, moduleId: dto.moduleId, difficultyLevel: dto.difficultyLevel, numQuestions: dto.numQuestions, timeLimit: dto.timeLimit, status: 'assigned', generatedBy: 'ai_generator' });
    const saved = await this.exerciseRepo.save(ex);

    const questions: ExerciseQuestion[] = [];
    for (let i = 0; i < dto.numQuestions; i++) {
      const qid = 'q-' + uuidv4();
      const partial: Partial<ExerciseQuestion> = {
        id: qid,
        exercise: saved,
        sequenceOrder: i + 1,
        questionText: `AI generated question ${i + 1}: ${aiResult.slice(0, 80)}`,
        questionType: dto.questionTypes && dto.questionTypes[i] ? dto.questionTypes[i] : 'short_answer',
        options: dto.questionTypes && dto.questionTypes[i] === 'multiple_choice' ? { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' } : undefined,
        correctAnswer: dto.questionTypes && dto.questionTypes[i] === 'multiple_choice' ? 'A' : undefined,
        pointsPossible: 1,
      };
      const q = this.questionRepo.create(partial) as ExerciseQuestion;
      questions.push(q);
    }
    await this.questionRepo.save(questions);

    return {
      success: true,
      data: {
        exerciseId: saved.id,
        title: saved.title,
        numQuestions: saved.numQuestions,
        questions: questions.map((q) => ({ id: q.id, questionText: q.questionText, questionType: q.questionType, options: q.options, correctAnswer: q.correctAnswer })),
        status: saved.status,
        createdAt: saved.createdAt,
      },
      message: 'Bài tập đã được tạo thành công',
    };
  }

  async findOne(exerciseId: string) {
    const course = await this.exerciseRepo.findOne({ where: { id: exerciseId }, relations: ['questions'] });
    if (!course) return { success: false, message: 'Not found' };
    return { success: true, data: { id: course.id, title: course.title, description: course.description, numQuestions: course.numQuestions, timeLimit: course.timeLimit, status: course.status, dueDate: null, questions: course.questions?.map((q) => ({ id: q.id, sequenceOrder: q.sequenceOrder, questionText: q.questionText, questionType: q.questionType, pointsPossible: q.pointsPossible, options: q.options })) } };
  }

  async submitExercise(exerciseId: string, studentId: string, payload: any) {
    // create submission
    const sid = 'sub-' + uuidv4();
    const submission = this.submissionRepo.create({ id: sid, exerciseId, studentId });
    const savedSub = await this.submissionRepo.save(submission);

    let totalPoints = 0;
    let pointsPossible = 0;
    const answersOut: Array<{ questionId: string; isCorrect: boolean; pointsEarned: number; feedback: string; correctAnswer?: string }> = [];

    // load questions
    const questions = await this.questionRepo.find({ where: { exercise: { id: exerciseId } as any } });
    const qMap = new Map(questions.map((q) => [q.id, q]));

    for (const a of payload.answers || []) {
      const q = qMap.get(a.questionId);
      if (!q) continue;
      pointsPossible += q.pointsPossible || 1;
      let earned = 0;
      let feedback = '';
      if (q.questionType === 'multiple_choice') {
        if (a.selectedOption && q.correctAnswer && a.selectedOption === q.correctAnswer) {
          earned = q.pointsPossible || 1;
          feedback = '✓ Chính xác!';
        } else {
          earned = 0;
          feedback = '✗ Sai.';
        }
      } else {
        // naive auto-grading: if non-empty answer -> full points, else zero
        if (a.answerText && a.answerText.trim().length > 0) {
          earned = q.pointsPossible || 1;
          feedback = '✓ Tự luận đã nộp (điểm tạm)';
        } else {
          earned = 0;
          feedback = '✗ Trống.';
        }
      }

      totalPoints += earned;

      const ansEntity = this.answerRepo.create({ id: 'ans-' + uuidv4(), submission: savedSub, questionId: a.questionId, answerType: a.answerType, selectedOption: a.selectedOption, answerText: a.answerText, pointsEarned: earned, feedback }) as SubmissionAnswer;
      await this.answerRepo.save(ansEntity);
      answersOut.push({ questionId: a.questionId, isCorrect: earned > 0, pointsEarned: earned, feedback, correctAnswer: q.correctAnswer });
    }

    savedSub.totalPoints = totalPoints;
    savedSub.pointsPossible = pointsPossible;
    await this.submissionRepo.save(savedSub);

    const summary = { totalCorrect: answersOut.filter((x) => x.isCorrect).length, totalWrong: answersOut.filter((x) => !x.isCorrect).length, correctPercentage: pointsPossible ? Math.round((totalPoints / pointsPossible) * 100) : 0, averageTimePerQuestion: payload.totalTimeSpentSeconds ? Math.round((payload.totalTimeSpentSeconds || 0) / Math.max(1, (payload.answers || []).length)) : null };

    return { success: true, data: { exerciseId, submittedAt: savedSub.submittedAt, totalPoints, pointsPossible, scorePercentage: summary.correctPercentage, grade: summary.correctPercentage >= 85 ? 'A' : summary.correctPercentage >= 70 ? 'B' : 'C', answers: answersOut, summary }, message: 'Bài tập đã được chấm. Điểm tạm tính.' };
  }

  // Exams: start & submit - simple implementations that reuse exercises structures
  async startExam(examId: string) {
    // for simplicity create a session-like response with one generated question set
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 90 * 60 * 1000);
    // here we would fetch exam definition; for now return stub
    return { success: true, data: { examId, title: 'Exam ' + examId, totalQuestions: 30, totalPoints: 100, timeLimit: 90, startedAt: startedAt.toISOString(), expiresAt: expiresAt.toISOString(), shuffleQuestions: true, shuffleOptions: true, questions: [] } };
  }

  async submitExam(examId: string, studentId: string, payload: any) {
    // reuse submitExercise logic in simplified form
    return this.submitExercise(examId, studentId, payload);
  }
}

export default AssessmentsService;
