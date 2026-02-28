
import { supabase } from './supabase';
import { Database } from '../types/supabase';
import { Exam as EngineExam, Question } from '../pages/student/ExamEngine/types';
import { ExamResultData } from '../pages/student/ExamResult/types';

export type Exam = Database['public']['Tables']['exams']['Row'] & {
    score?: number;
    submission_id?: string;
    submission_status?: 'started' | 'submitted';
};

export const examService = {
    async getExams() {
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch exams and their submissions for the current user
        const { data, error } = await supabase
            .from('exams')
            .select(`
                *,
                submissions (
                    id,
                    score,
                    status
                )
            `)
            .order('start_time', { ascending: false });

        if (error) {
            console.error('Error fetching exams:', error);
            throw error;
        }

        // Transform data to include submission info at top level
        return data.map((exam: any) => {
            const submission = exam.submissions?.find((s: any) => s.student_id === user?.id) || exam.submissions?.[0];
            return {
                ...exam,
                submission_id: submission?.id,
                submission_status: submission?.status,
                score: submission?.score
            };
        });
    },

    async getExamById(id: number) {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('exams')
            .select(`
                *,
                submissions (
                    id,
                    score,
                    status
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching exam ${id}:`, error);
            throw error;
        }

        // Transform to include user-specific status
        const submission = data.submissions?.find((s: any) => s.student_id === user?.id) || data.submissions?.[0]; // RLS should handle filtering, but being safe

        return {
            ...data,
            submission_id: submission?.id,
            submission_status: submission?.status,
            score: submission?.score
        };
    },

    // --- Exam Engine Methods ---

    async startExam(examId: number): Promise<any> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Check for existing submission
        const { data: existing } = await supabase
            .from('submissions')
            .select('*') // Select all to get started_at and answers
            .eq('exam_id', examId)
            .eq('student_id', user.id)
            .single();

        if (existing) return existing;

        // Create new submission
        const { data, error } = await supabase
            .from('submissions')
            .insert({
                exam_id: examId,
                student_id: user.id,
                status: 'started',
                started_at: new Date().toISOString(), // Ensure we track start time explicitly if DB doesn't default it
                answers: {}
            })
            .select() // Select all
            .single();

        if (error) throw error;
        return data;
    },

    async getExamWithQuestions(examId: number): Promise<EngineExam> {
        // 1. Fetch Exam Details
        const { data: examData, error: examError } = await supabase
            .from('exams')
            .select('*')
            .eq('id', examId)
            .single();

        if (examError) throw examError;

        // 2. Fetch Questions
        const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', examId)
            .order('id', { ascending: true }); // Keep order stable

        if (questionsError) throw questionsError;

        // 3. Map to Engine Types
        const questions: Question[] = questionsData.map((q: any) => {
            const base = {
                id: q.id,
                text: q.text,
                marks: q.marks,
                type: q.type as any
            };

            if (q.type === 'mcq') {
                return { ...base, options: q.options };
            }
            if (q.type === 'code') {
                // For now, mock initial code if not in DB options
                return { ...base, language: 'javascript', initialCode: '// Write your code here...' };
            }
            if (q.type === 'essay') {
                return { ...base, wordLimit: 200 }; // Default limit
            }

            return base;
        });

        return {
            id: String(examData.id), // Ensure ID is string for Engine compatibility if needed, or update types
            title: examData.title,
            durationMinutes: examData.duration_minutes,
            totalQuestions: examData.total_questions,
            questions: questions
        };
    },

    async submitAnswer(submissionId: string, answers: any) {
        // Just update answers column
        // We need to fetch existing answers first OR use jsonb_set provided by Postgrest/Supabase if possible, 
        // but simplest is to just overwrite the JSON blob if we have the full state on client.
        // Or better: update the specific key.
        // For simplicity in this project: The client sends the FULL answers object.

        const { error } = await supabase
            .from('submissions')
            .update({ answers })
            .eq('id', submissionId);

        if (error) throw error;
    },

    async finishExam(submissionId: string, answers: any, examId: number) {
        // Fetch questions to calculate score
        const { data: questions } = await supabase
            .from('questions')
            .select('id, type, correct_answer, marks')
            .eq('exam_id', examId);

        let totalScore = 0;
        let correctCount = 0;

        // Simple Grading Logic
        if (questions) {
            questions.forEach(q => {
                const studentAnswer = answers[q.id];
                if (studentAnswer === undefined) return;

                if (q.type === 'mcq' || q.type === 'true_false') {
                    if (String(studentAnswer) === String(q.correct_answer)) {
                        totalScore += q.marks;
                        correctCount++;
                    }
                }
                // Essay/Code: auto-grade not implemented, assume 0 or manual review needed. 
                // For MVP demo, we can give full marks for code if not empty? No, let's keep it 0 or random for demo.
                // Let's just track objective questions for now.
            });
        }

        const { error } = await supabase
            .from('submissions')
            .update({
                answers,
                status: 'submitted',
                submitted_at: new Date().toISOString(),
                score: totalScore
            })
            .eq('id', submissionId);

        if (error) throw error;
    },

    async getReviewData(examId: string): Promise<import('../types/review').ExamReviewData | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch submission
        const { data: submission } = await supabase
            .from('submissions')
            .select('*')
            .eq('exam_id', examId)
            .eq('student_id', user.id)
            .maybeSingle();

        if (!submission) return null;

        // Fetch Exam & Questions
        const { data: examData } = await supabase.from('exams').select('*').eq('id', examId).single();
        const { data: questionsData } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', examId)
            .order('id', { ascending: true });

        if (!examData || !questionsData) return null;

        // Merge Data
        const questions = questionsData.map((q: any) => {
            const userAnswer = submission.answers[q.id];
            let isCorrect = undefined;

            if (q.type === 'mcq' || q.type === 'true_false') {
                isCorrect = String(userAnswer) === String(q.correct_answer);
            }

            const baseRequest = {
                id: q.id,
                text: q.text,
                type: q.type,
                marks: q.marks,
                userAnswer,
                isCorrect,
                explanation: q.explanation,
                correctAnswer: q.correct_answer // Include correct answer for review
            };

            if (q.type === 'mcq') return { ...baseRequest, options: q.options };
            if (q.type === 'code') return { ...baseRequest, language: 'javascript', initialCode: '// ...' };
            if (q.type === 'essay') return { ...baseRequest, wordLimit: 200 };

            return baseRequest;
        });

        return {
            examId: String(examData.id),
            examTitle: examData.title,
            score: submission.score || 0,
            totalScore: examData.total_marks,
            questions: questions as any
        };
    },

    async getSubmissionResult(examId: string): Promise<ExamResultData | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch submission
        const { data: submission, error: subError } = await supabase
            .from('submissions')
            .select('*')
            .eq('exam_id', examId)
            .eq('student_id', user.id)
            .maybeSingle();

        if (subError || !submission) return null;

        // Fetch Exam & Questions to build result
        const { data: examData } = await supabase.from('exams').select('*').eq('id', examId).single();
        const { data: questions } = await supabase.from('questions').select('*').eq('exam_id', examId);

        if (!examData || !questions) return null;

        // Calculate Stats
        let correctAnswers = 0;
        let wrongAnswers = 0;
        let earnedScore = submission.score || 0;
        const totalScore = examData.total_marks;
        const answers = submission.answers || {};

        questions.forEach(q => {
            const ans = answers[q.id];
            if (q.type === 'mcq' || q.type === 'true_false') {
                if (String(ans) === String(q.correct_answer)) {
                    correctAnswers++;
                } else {
                    wrongAnswers++;
                }
            }
        });

        // Mock Qualitative Data for now (Tutor Feedback, etc.)
        // In real app, this would come from a 'reviews' table.
        return {
            id: submission.id,
            examTitle: examData.title,
            studentScore: earnedScore,
            totalScore: totalScore,
            percentage: Math.round((earnedScore / totalScore) * 100),
            isPassed: (earnedScore / totalScore) >= 0.5,

            correctAnswers,
            wrongAnswers,
            timeSpent: "45 mins", // Mock
            rank: "5/20", // Mock

            breakdown: [
                { type: 'MCQ', total: 10, correct: 8, score: 8, totalScore: 10, performance: 'Very Good' },
                { type: 'True/False', total: 5, correct: 5, score: 5, totalScore: 5, performance: 'Excellent' },
                // ...
            ],

            tutorName: "System Auto-Grader",
            tutorNote: "This is an auto-generated result based on your objective answers.",
            strengths: ["Objective Questions"],
            weaknesses: ["Subjective Questions (Pending Review)"],

            allowRetry: true,
            classAverage: 75,
            percentile: 80
        };
    },

    async getUserResults() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('submissions')
            .select(`
                *,
                exams (
                    id,
                    title,
                    total_marks,
                    subject
                )
            `)
            .eq('student_id', user.id)
            .eq('status', 'submitted')
            .order('submitted_at', { ascending: false });

        if (error) throw error;

        return data.map((sub: any) => ({
            id: sub.id,
            examId: sub.exams.id,
            title: sub.exams.title,
            subject: sub.exams.subject,
            score: sub.score,
            totalMarks: sub.exams.total_marks,
            percentage: Math.round((sub.score / sub.exams.total_marks) * 100),
            date: sub.submitted_at,
            status: (sub.score / sub.exams.total_marks) >= 0.5 ? 'Passed' : 'Failed'
        }));
    }
};
