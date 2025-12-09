import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { SubmissionAnswer } from './submission-answer.entity';

@Entity({ name: 'exercise_submissions' })
export class ExerciseSubmission {
  @PrimaryColumn()
  id: string;

  @Column()
  exerciseId: string;

  @Column()
  studentId: string;

  @OneToMany(() => SubmissionAnswer, (a) => a.submission, { cascade: true })
  answers?: SubmissionAnswer[];

  @Column({ type: 'float', nullable: true })
  totalPoints?: number;

  @Column({ type: 'float', nullable: true })
  pointsPossible?: number;

  @CreateDateColumn()
  submittedAt: Date;
}

export default ExerciseSubmission;
