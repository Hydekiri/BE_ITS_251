import { Controller, Post, Body, Req, Get, Query, Param } from '@nestjs/common';
import { AiTutorService } from './ai-tutor.service';
import { ChatRequestDto } from './dtos/chat-request.dto';
import { ConversationQueryDto } from './dtos/conversation-query.dto';
import { FeedbackDto } from './dtos/feedback.dto';
import { validateOrReject } from 'class-validator';

@Controller('ai-tutor')
export class AiTutorController {
  constructor(private readonly svc: AiTutorService) {}

  @Post('chat')
  async chat(@Body() body: ChatRequestDto, @Req() req: any) {
    await validateOrReject(body as any).catch((e) => { throw e; });

    const userId = req.user?.id ?? req.headers['x-user-id'] ?? null;

    const result = await this.svc.chat(body as any, userId);

    return { success: true, data: result };
  }

  @Get('conversations')
  async list(@Query() query: ConversationQueryDto, @Req() req: any) {
    const userId = req.user?.id ?? req.headers['x-user-id'] ?? null;
    const data = await this.svc.listConversations(query as any, userId);
    return { success: true, data };
  }

  @Post('interactions/:interactionId/feedback')
  async feedback(@Param('interactionId') interactionId: string, @Body() body: FeedbackDto, @Req() req: any) {
    await validateOrReject(body as any).catch((e) => { throw e; });
    const userId = req.user?.id ?? req.headers['x-user-id'] ?? null;
    const data = await this.svc.submitFeedback(interactionId, body as any, userId);
    return { success: true, data, message: 'Cảm ơn phản hồi của bạn' };
  }
}
