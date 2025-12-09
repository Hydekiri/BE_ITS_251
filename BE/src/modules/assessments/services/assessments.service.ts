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
  ) { }

  async list(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const qb = this.exerciseRepo.createQueryBuilder('e');
    if (query.status) qb.andWhere('e.status = :status', { status: query.status });
    if (query.courseId) qb.andWhere('e.course_id = :courseId', { courseId: query.courseId });
    if (query.search) qb.andWhere('e.title ILIKE :s', { s: `%${query.search}%` });
    const sortBy = query.sortBy || 'created_at';
    const order = (query.order || 'desc').toUpperCase();
    qb.orderBy(`e.${sortBy}`, order as 'ASC' | 'DESC');

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

  async generate(dto: GenerateExerciseDto, studentId?: string | null) {
    // basic validation
    if (!dto.topic || !dto.numQuestions) throw new Error('Missing parameters');

    // ensure there is a course id; if not, create a lightweight course and subject to attach to
    let courseIdToUse = dto.courseId;
    if (!courseIdToUse) {
      // ensure subject exists
      const subjects = await this.exerciseRepo.manager.query('SELECT id FROM subjects LIMIT 1');
      let subjectId: string;
      if (!subjects || subjects.length === 0) {
        const res = await this.exerciseRepo.manager.query("INSERT INTO subjects (name, description, created_at) VALUES ($1,$2,NOW()) RETURNING id", ['General', 'Auto-created subject']);
        subjectId = res[0].id;
      } else {
        subjectId = subjects[0].id;
      }

      // pick a teacher (prefer 'teacher' email), else fallback to any user
      const teacherRes = await this.exerciseRepo.manager.query("SELECT id FROM users WHERE email ILIKE '%teacher%' LIMIT 1");
      let teacherId: string | null = null;
      if (teacherRes && teacherRes.length > 0) teacherId = teacherRes[0].id;
      else {
        const anyUser = await this.exerciseRepo.manager.query('SELECT id FROM users LIMIT 1');
        teacherId = anyUser && anyUser[0] ? anyUser[0].id : null;
      }

      const courseInsertRes = await this.exerciseRepo.manager.query("INSERT INTO courses (id, title, description, subject_id, teacher_id, class_level, status, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'draft', NOW(), NOW()) RETURNING id", [dto.topic || 'General', dto.subtopic || dto.topic || 'AI generated course', subjectId, teacherId, 'General']);
      courseIdToUse = courseInsertRes[0].id;
    }

    // call AiService (simple use of generateSummary to get text); in real app call Gemini and parse JSON
    const prompt = dto.prompt || `Generate ${dto.numQuestions} questions about ${dto.topic}: ${dto.subtopic || ''}`;
    const aiResult = await this.ai.generateSummary(prompt);

    // create exercise and simple questions based on aiResult (stub parsing)
    const exerciseId = 'exercise-' + uuidv4();
    const ex = this.exerciseRepo.create({ id: exerciseId, title: `${dto.topic} (AI Generated)`, description: dto.subtopic, courseId: courseIdToUse, moduleId: dto.moduleId, difficultyLevel: dto.difficultyLevel, numQuestions: dto.numQuestions, timeLimit: dto.timeLimit, status: 'assigned', generatedBy: 'ai_generator', studentId: studentId || undefined } as any);
    const saved = await this.exerciseRepo.save(ex) as any;

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
    return { success: true, data: { id: course.id, title: course.title, description: course.description, numQuestions: course.numQuestions, timeLimit: course.timeLimit, status: course.status, dueDate: null, questions: course.questions?.map((q) => ({ id: q.id, sequenceOrder: q.sequenceOrder, questionText: q.questionText, questionType: q.questionType, pointsPossible: q.pointsPossible, options: q.options, explanation: q.explanation, correctAnswer: q.correctAnswer })) } };
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

      const ansEntity = this.answerRepo.create({ id: 'ans-' + uuidv4(), submission: savedSub, questionId: a.questionId, answerType: a.answerType, selectedOption: a.selectedOption, answerText: a.answerText, pointsEarned: earned, feedback });
      await this.answerRepo.save(ansEntity);
      answersOut.push({ questionId: a.questionId, isCorrect: earned > 0, pointsEarned: earned, feedback, correctAnswer: q.correctAnswer });
    }

    savedSub.totalPoints = totalPoints;
    savedSub.pointsPossible = pointsPossible;
    await this.submissionRepo.save(savedSub);

    const summary = { totalCorrect: answersOut.filter((x) => x.isCorrect).length, totalWrong: answersOut.filter((x) => !x.isCorrect).length, correctPercentage: pointsPossible ? Math.round((totalPoints / pointsPossible) * 100) : 0, averageTimePerQuestion: payload.totalTimeSpentSeconds ? Math.round((payload.totalTimeSpentSeconds || 0) / Math.max(1, (payload.answers || []).length)) : null };

    return { success: true, data: { exerciseId, submittedAt: savedSub.submittedAt, totalPoints, pointsPossible, scorePercentage: summary.correctPercentage, grade: summary.correctPercentage >= 85 ? 'A' : summary.correctPercentage >= 70 ? 'B' : 'C', answers: answersOut, summary }, message: 'Bài tập đã được chấm. Điểm tạm tính.' };
  }

  async saveProgress(exerciseId: string, studentId: string, payload: any) {
    // create a draft submission to persist progress
    const sid = 'sub-' + uuidv4();
    const submission = this.submissionRepo.create({ id: sid, exerciseId, studentId });
    const savedSub = await this.submissionRepo.save(submission);

    const answersOut: Array<any> = [];
    for (const a of payload.answers || []) {
      const ansEntity = this.answerRepo.create({ id: 'ans-' + uuidv4(), submission: savedSub, questionId: a.questionId, answerType: a.answerType, selectedOption: a.selectedOption, answerText: a.answerText, pointsEarned: 0, feedback: 'Saved progress' });
      await this.answerRepo.save(ansEntity);
      answersOut.push({ questionId: a.questionId, selectedOption: a.selectedOption, answerText: a.answerText });
    }

    // Optionally store timeLeft or other metadata in description field of submission? For now return saved data
    return { success: true, data: { submissionId: savedSub.id, exerciseId, savedAt: savedSub.submittedAt, answers: answersOut }, message: 'Progress saved' };
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

  // Save AI-generated quiz to database
  async saveGeneratedQuiz(data: { title: string; topic: string; difficulty: string; timeLimit: number; questions: any[]; studentId?: string | null }) {
    // Use existing course instead of creating new one
    let courseIdToUse: string;

    // Try to find existing course
    const existingCourse = await this.exerciseRepo.manager.query('SELECT id FROM courses LIMIT 1');

    if (existingCourse && existingCourse.length > 0) {
      courseIdToUse = existingCourse[0].id;
    } else {
      // No course exists, create minimal one
      const subjects = await this.exerciseRepo.manager.query('SELECT id FROM subjects LIMIT 1');
      let subjectId: string;

      if (!subjects || subjects.length === 0) {
        const res = await this.exerciseRepo.manager.query("INSERT INTO subjects (name, description, created_at) VALUES ($1,$2,NOW()) RETURNING id", ['General', 'Auto-created subject']);
        subjectId = res[0].id;
      } else {
        subjectId = subjects[0].id;
      }

      const teacherRes = await this.exerciseRepo.manager.query("SELECT id FROM users WHERE role = 'teacher' LIMIT 1");
      let teacherId: string;

      if (teacherRes && teacherRes.length > 0) {
        teacherId = teacherRes[0].id;
      } else {
        // No teacher, use any user
        const anyUser = await this.exerciseRepo.manager.query('SELECT id FROM users LIMIT 1');
        if (!anyUser || anyUser.length === 0) {
          throw new Error('No users found in database. Please create at least one user.');
        }
        teacherId = anyUser[0].id;
      }

      const courseInsertRes = await this.exerciseRepo.manager.query(
        "INSERT INTO courses (id, title, description, subject_id, teacher_id, class_level, status, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'draft', NOW(), NOW()) RETURNING id",
        [data.topic || 'General', 'AI generated course', subjectId, teacherId, 'General']
      );
      courseIdToUse = courseInsertRes[0].id;
    }

    // Validate studentId if provided
    let validStudentId: string | null = null;
    if (data.studentId) {
      const studentExists = await this.exerciseRepo.manager.query('SELECT id FROM users WHERE id = $1 LIMIT 1', [data.studentId]);
      if (studentExists && studentExists.length > 0) {
        validStudentId = data.studentId;
      }
    }

    // Create exercise
    const exerciseId = uuidv4();
    const ex = this.exerciseRepo.create({
      id: exerciseId,
      title: data.title,
      description: data.topic,
      courseId: courseIdToUse,
      difficultyLevel: data.difficulty,
      numQuestions: data.questions.length,
      timeLimit: data.timeLimit,
      status: 'in_progress',
      generatedBy: 'ai_file_generator',
      studentId: validStudentId
    } as any);
    const saved = (await this.exerciseRepo.save(ex)) as unknown as Exercise;

    // Save questions
    const questions: ExerciseQuestion[] = [];
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      const qid = uuidv4();

      // Transform options from AI format to DB format
      const optionsMap: any = {};
      const correctAnswerId: string | undefined = q.options?.find((opt: any) => opt.isCorrect)?.id;
      q.options?.forEach((opt: any) => {
        optionsMap[opt.id] = opt.text;
      });

      const partial: Partial<ExerciseQuestion> = {
        id: qid,
        exercise: saved,
        sequenceOrder: i + 1,
        questionText: q.text,
        questionType: 'multiple_choice',
        options: optionsMap,
        correctAnswer: correctAnswerId,
        explanation: q.explanation,
        pointsPossible: 1,
      };
      const questionEntity = this.questionRepo.create(partial) as ExerciseQuestion;
      questions.push(questionEntity);
    }
    const savedQuestions = await this.questionRepo.save(questions);

    return {
      exerciseId: saved.id,
      title: saved.title,
      description: saved.description,
      difficultyLevel: saved.difficultyLevel,
      createdAt: saved.createdAt,
      status: saved.status
    };
  }

  // Delete exercise and its questions
  async deleteExercise(exerciseId: string) {
    const exercise = await this.exerciseRepo.findOne({ where: { id: exerciseId } });
    if (!exercise) {
      return { success: false, message: 'Exercise not found' };
    }

    // Delete will cascade to exercise_questions due to ON DELETE CASCADE
    await this.exerciseRepo.remove(exercise);

    return { success: true, message: 'Exercise deleted successfully' };
  }
}

export default AssessmentsService;
