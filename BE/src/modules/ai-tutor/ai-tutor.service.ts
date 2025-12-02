import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AiService } from '../ai/ai.service';
import { AiInteraction } from './models/ai-interaction.entity';
import { AiTutorResponse } from './models/ai-tutor-response.entity';

@Injectable()
export class AiTutorService {
  private readonly logger = new Logger(AiTutorService.name);

  constructor(
    private readonly ai: AiService,
    @InjectRepository(AiInteraction)
    private readonly interactionsRepo: Repository<AiInteraction>,
    @InjectRepository(AiTutorResponse)
    private readonly responsesRepo: Repository<AiTutorResponse>,
  ) {}

  async chat(payload: any, userId?: string) {
    const interactionId = `interact-${uuidv4()}`;

    const interaction = this.interactionsRepo.create({
      id: interactionId,
      userId: userId ?? null,
      question: payload.question,
      contextType: payload.contextType,
      contextId: payload.contextId,
      topic: payload.topic ?? null,
    } as AiInteraction);

    await this.interactionsRepo.save(interaction);

    // Build a simple prompt from history + question
    const history = Array.isArray(payload.conversationHistory)
      ? payload.conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n') + '\n'
      : '';

    const prompt = `You are an educational tutor. Use clear step-by-step explanations.\n${history}\nStudent: ${payload.question}`;

    // Call AiService (stub or real Gemini wrapper)
    let responseText = '';
    let modelUsed = process.env.GEMINI_API_KEY ? 'gemini-1.5-pro' : 'local-stub';
    let tokensUsed = 0;

    try {
      const out = await this.ai.generateSummary(prompt);
      responseText = out ?? 'Xin lỗi, tôi không trả lời được lúc này.';
    } catch (err) {
      this.logger.warn('AI call failed', err as any);
      responseText = 'Xin lỗi, có lỗi khi gọi AI.';
    }

    const respId = `resp-${uuidv4()}`;
    const resp = this.responsesRepo.create({
      id: respId,
      interactionId,
      response: responseText,
      modelUsed,
      tokensUsed,
    } as AiTutorResponse);

    await this.responsesRepo.save(resp);

    // Attach response to interaction for return
    interaction.responses = [resp];

    return {
      interactionId,
      question: interaction.question,
      response: responseText,
      contextType: interaction.contextType,
      contextId: interaction.contextId,
      modelUsed,
      tokensUsed,
      createdAt: resp.createdAt ?? new Date(),
    };
  }

  async listConversations(query: any, userId?: string) {
    const page = parseInt(query.page ?? '1', 10) || 1;
    const limit = parseInt(query.limit ?? '20', 10) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.contextType) where.contextType = query.contextType;
    if (query.contextId) where.contextId = query.contextId;
    if (userId) where.userId = userId;

    const [items, total] = await this.interactionsRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['responses'],
    });

    return {
      conversations: items.map((i) => ({
        id: i.id,
        question: i.question,
        response: i.responses && i.responses.length ? i.responses[0].response : null,
        contextType: i.contextType,
        topic: i.topic,
        isHelpful: i.isHelpful ?? null,
        rating: i.rating ?? null,
        createdAt: i.createdAt,
      })),
      pagination: { currentPage: page, totalPages: Math.ceil(total / limit) || 1, totalItems: total },
    };
  }

  async submitFeedback(interactionId: string, feedback: any, userId?: string) {
    const interaction = await this.interactionsRepo.findOne({ where: { id: interactionId } });
    if (!interaction) throw new Error('Interaction not found');

    // In a real app verify userId owns the interaction or has permission
    interaction.isHelpful = typeof feedback.isHelpful === 'boolean' ? feedback.isHelpful : interaction.isHelpful;
    interaction.rating = typeof feedback.rating === 'number' ? feedback.rating : interaction.rating;
    interaction.comment = typeof feedback.comment === 'string' ? feedback.comment : interaction.comment;

    await this.interactionsRepo.save(interaction);

    return {
      interactionId: interaction.id,
      isHelpful: interaction.isHelpful,
      rating: interaction.rating,
      comment: interaction.comment,
      updatedAt: interaction.updatedAt,
    };
  }
}

export default AiTutorService;
