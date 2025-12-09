import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { AiInteraction } from './ai-interaction.entity';

@Entity({ name: 'ai_tutor_responses' })
export class AiTutorResponse {
  @PrimaryColumn()
  id: string;

  @Column({ insert: false, update: false })
  interactionId: string;

  @ManyToOne(() => AiInteraction, (i) => i.responses)
  interaction: AiInteraction;

  @Column('text')
  response: string;

  @Column({ nullable: true })
  modelUsed?: string;

  @Column({ type: 'int', nullable: true })
  tokensUsed?: number;

  @CreateDateColumn()
  createdAt: Date;
}

export default AiTutorResponse;
