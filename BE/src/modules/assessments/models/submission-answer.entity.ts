import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { ExerciseSubmission } from './exercise-submission.entity';

@Entity({ name: 'submission_answers' })
export class SubmissionAnswer {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => ExerciseSubmission, (s) => s.answers)
  submission: ExerciseSubmission;

  @Column()
  questionId: string;

  @Column({ nullable: true })
  answerType?: string;

  @Column('text', { nullable: true })
  answerText?: string;

  @Column({ nullable: true })
  selectedOption?: string;

  @Column({ type: 'float', nullable: true })
  pointsEarned?: number;

  @Column('text', { nullable: true })
  feedback?: string;
}

export default SubmissionAnswer;
