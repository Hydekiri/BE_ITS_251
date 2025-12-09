import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

export interface GenerationParams {
  title: string;
  topic?: string;
  difficulty: string; // Easy, Medium, Hard
  questionCount: number;
  timeLimit?: number;
  language?: string; // e.g., 'Vietnamese', 'English'
}

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  async generateQuestionsFromFile(file: Express.Multer.File, params: GenerationParams): Promise<any> {
    if (!this.model) {
      // Return mock data for testing if no API key
      console.warn('Gemini API Key not found. Returning mock data.');
      return this.getMockQuestions(params.questionCount);
    }

    try {
      // 1. Parse File Content
      let textContent = '';
      if (file.mimetype === 'application/pdf') {
        const data = await pdfParse(file.buffer);
        textContent = data.text;
      } else {
        // Plain text or other formats
        textContent = file.buffer.toString('utf-8');
      }

      // Truncate if too long (basic handling)
      if (textContent.length > 30000) {
        textContent = textContent.substring(0, 30000) + '...[truncated]';
      }

      // 2. Build Prompt
      const language = params.language || 'Vietnamese'; // Default to vietnamese as per request
      const prompt = `
        Context: You are an intelligent quiz generator for medical students.
        Task: Create a quiz with ${params.questionCount} multiple-choice questions based on the provided text.
        Difficulty: ${params.difficulty}
        Language: ${language}
        Format: Return ONLY a valid JSON array. Each object should have:
        - "id": number
        - "text": string (the question)
        - "type": "multiple-choice"
        - "options": array of objects { "id": string (A, B, C, D), "text": string, "isCorrect": boolean }
        - "explanation": string (optional explanation)

        Content to base questions on:
        """${textContent}"""
      `;

      // 3. Generate Content
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Try to parse JSON with better error handling
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError.message);
        console.error('Response text (first 500 chars):', text.substring(0, 500));

        // Try to extract JSON array from response
        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          try {
            return JSON.parse(arrayMatch[0]);
          } catch (e) {
            console.error('Failed to parse extracted array');
          }
        }

        throw new Error('Failed to parse AI response as JSON: ' + parseError.message);
      }

    } catch (error) {
      console.error('Error generating questions:', error);
      throw new HttpException('Failed to generate quiz: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getMockQuestions(count: number) {
    return Array.from({ length: count }).map((_, i) => ({
      id: i + 1,
      text: `Question ${i + 1} (Mock): This is a generated question based on your upload.`,
      type: 'multiple-choice',
      options: [
        { id: 'A', text: 'Correct Answer', isCorrect: true },
        { id: 'B', text: 'Wrong Answer 1', isCorrect: false },
        { id: 'C', text: 'Wrong Answer 2', isCorrect: false },
        { id: 'D', text: 'Wrong Answer 3', isCorrect: false },
      ],
      explanation: 'This is a mock explanation because API key is missing.'
    }));
  }

  // Keep the old helper for backward compatibility if needed, or remove it
  async generateSummary(text: string): Promise<string> {
    return "Summary functionality deprecated in favor of quiz generation.";
  }
}
