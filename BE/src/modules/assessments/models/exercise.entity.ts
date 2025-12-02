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

  @Column({ nullable: true })
  courseId?: string;

  @Column({ nullable: true })
  moduleId?: string;

  @Column({ nullable: true })
  difficultyLevel?: string;

  @Column({ type: 'int', default: 0 })
  numQuestions: number;

  @Column({ type: 'int', nullable: true })
  timeLimit?: number; // minutes

  @Column({ default: 'assigned' })
  status: string;

  @Column({ nullable: true })
  generatedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ExerciseQuestion, (q) => q.exercise, { cascade: true })
  questions?: ExerciseQuestion[];
}

export default Exercise;
