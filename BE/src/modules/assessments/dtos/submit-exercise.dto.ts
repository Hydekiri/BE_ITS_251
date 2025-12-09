export class AnswerDto {
  questionId: string;
  answerType: string;
  selectedOption?: string;
  answerText?: string;
  timeSpentSeconds?: number;
}

export class SubmitExerciseDto {
  answers: AnswerDto[];
  totalTimeSpentSeconds?: number;
}

export default SubmitExerciseDto;
