import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Exercise } from './exercise.entity';

@Entity({ name: 'exercise_questions' })
export class ExerciseQuestion {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Exercise, (e) => e.questions)
  exercise: Exercise;

  @Column({ nullable: true })
  sequenceOrder?: number;

  @Column('text')
  questionText: string;

  @Column({ default: 'multiple_choice' })
  questionType: string;

  @Column('json', { nullable: true })
  options?: any;

  @Column({ nullable: true })
  correctAnswer?: string;

  @Column({ type: 'float', default: 1 })
  pointsPossible: number;
}

export default ExerciseQuestion;
