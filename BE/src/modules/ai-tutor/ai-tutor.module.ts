import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiTutorController } from './ai-tutor.controller';
import { AiTutorService } from './ai-tutor.service';
import { AiInteraction } from './models/ai-interaction.entity';
import { AiTutorResponse } from './models/ai-tutor-response.entity';
import { AiService } from '../ai/ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiInteraction, AiTutorResponse])],
  providers: [AiTutorService, AiService],
  controllers: [AiTutorController],
  exports: [AiTutorService],
})
export class AiTutorModule {}
