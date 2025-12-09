import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
    BadRequestException,
    Headers
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { AssessmentsService } from '../assessments/services/assessments.service';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiTags('AI')
@Controller('ai')
export class AiController {
    constructor(
        private readonly aiService: AiService,
        private readonly assessmentsService: AssessmentsService
    ) { }

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
        @Body() body: any,
        @Headers('authorization') auth: string
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

        // Extract studentId from JWT if authenticated
        let studentId: string | null = null;
        if (auth && auth.startsWith('Bearer ')) {
            try {
                const payload = JSON.parse(Buffer.from(auth.replace('Bearer ', '').split('.')[1] || '', 'base64').toString() || '{}');
                studentId = payload.sub;
            } catch (err) {
                studentId = null;
            }
        }


        // Save to database via assessments service
        try {
            const saveResult = await this.assessmentsService.saveGeneratedQuiz({
                title: params.title,
                topic: params.topic || 'AI Generated',
                difficulty: params.difficulty,
                timeLimit: params.timeLimit,
                questions: questions,
                studentId: studentId
            });

            return {
                success: true,
                data: {
                    ...params,
                    questions,
                    exerciseId: saveResult.exerciseId,
                    createdAt: saveResult.createdAt
                }
            };
        } catch (error) {
            console.error('Failed to save generated quiz to database:', error);
            throw error;
        }
    }
}
