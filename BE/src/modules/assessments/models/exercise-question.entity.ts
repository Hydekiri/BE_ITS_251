import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Exercise } from './exercise.entity';

@Entity({ name: 'exercise_questions' })
export class ExerciseQuestion {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Exercise, (e) => e.questions)
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column({ name: 'question_bank_id', nullable: true })
  questionBankId?: string;

  @Column({ name: 'sequence_order', nullable: true })
  sequenceOrder?: number;

  @Column({ name: 'question_text', type: 'text' })
  questionText: string;

  @Column({ name: 'explanation', type: 'text', nullable: true })
  explanation?: string;

  @Column({ name: 'question_type', default: 'multiple_choice' })
  questionType: string;

  @Column('json', { nullable: true })
  options?: any;

  @Column({ name: 'correct_answer', nullable: true })
  correctAnswer?: string;

  @Column({ name: 'points_possible', type: 'float', default: 1 })
  pointsPossible: number;
}

export default ExerciseQuestion;
