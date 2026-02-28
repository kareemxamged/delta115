import { Question } from '../pages/student/ExamEngine/types';

export interface QuestionReview extends Question {
    userAnswer: any;
    isCorrect?: boolean; // For auto-graded questions
    explanation?: string;
}

export interface ExamReviewData {
    examId: string;
    examTitle: string;
    score: number;
    totalScore: number;
    questions: QuestionReview[];
}
