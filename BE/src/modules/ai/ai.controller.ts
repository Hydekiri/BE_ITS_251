import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
    BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiTags('AI')
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('generate-quiz')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Generate quiz questions from uploaded file' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                title: { type: 'string' },
                topic: { type: 'string' },
                difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
                questionCount: { type: 'integer', minimum: 1, maximum: 50 },
                timeLimit: { type: 'integer' },
                language: { type: 'string' }
            },
        },
    })
    async generateQuiz(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        // Convert string numbers from form-data to actual numbers
        const params = {
            title: body.title || 'Untitled Assessment',
            topic: body.topic,
            difficulty: body.difficulty || 'Medium',
            questionCount: parseInt(body.questionCount) || 10,
            timeLimit: parseInt(body.timeLimit) || 15,
            language: body.language || 'Vietnamese'
        };

        const questions = await this.aiService.generateQuestionsFromFile(file, params);

        return {
            success: true,
            data: {
                ...params,
                questions
            }
        };
    }
}
