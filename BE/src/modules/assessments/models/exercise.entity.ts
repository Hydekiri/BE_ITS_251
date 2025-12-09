import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ExerciseQuestion } from './exercise-question.entity';

@Entity({ name: 'exercises' })
export class Exercise {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'course_id', nullable: true })
  courseId?: string;

  @Column({ name: 'student_id', nullable: true })
  studentId?: string;

  @Column({ name: 'module_id', nullable: true })
  moduleId?: string;

  @Column({ name: 'difficulty_level', nullable: true })
  difficultyLevel?: string;

  @Column({ name: 'num_questions', type: 'int', default: 0 })
  numQuestions: number;

  @Column({ name: 'time_limit_minutes', type: 'int', nullable: true })
  timeLimit?: number; // minutes

  @Column({ default: 'assigned' })
  status: string;

  @Column({ name: 'generated_by', nullable: true })
  generatedBy?: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => ExerciseQuestion, (q) => q.exercise, { cascade: true })
  questions?: ExerciseQuestion[];
}

export default Exercise;
