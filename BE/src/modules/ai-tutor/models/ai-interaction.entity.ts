import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AiTutorResponse } from './ai-tutor-response.entity';

@Entity({ name: 'ai_interactions' })
export class AiInteraction {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  userId?: string;

  @Column()
  question: string;

  @Column()
  contextType: string;

  @Column()
  contextId: string;

  @Column({ nullable: true })
  topic?: string;

  @Column({ type: 'boolean', nullable: true })
  isHelpful?: boolean | null;

  @Column({ type: 'int', nullable: true })
  rating?: number | null;

  @Column({ type: 'text', nullable: true })
  comment?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AiTutorResponse, (r) => r.interaction, { cascade: true })
  responses?: AiTutorResponse[];
}

export default AiInteraction;
