export class GenerateExerciseDto {
  courseId: string;
  moduleId?: string;
  topic: string;
  subtopic?: string;
  numQuestions: number;
  difficultyLevel?: string;
  questionTypes?: string[];
  timeLimit?: number;
  prompt?: string;
}

export default GenerateExerciseDto;
