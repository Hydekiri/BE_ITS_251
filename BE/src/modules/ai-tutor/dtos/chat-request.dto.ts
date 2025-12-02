import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ConversationMessage {
  @IsString()
  role: 'user' | 'assistant' | 'system';

  @IsString()
  content: string;
}

export class ChatRequestDto {
  @IsString()
  question: string;

  @IsString()
  contextType: string;

  @IsString()
  contextId: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessage)
  conversationHistory?: ConversationMessage[];
}
