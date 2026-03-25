import { z } from 'zod';

export const questionSchema = z.object({
    id: z.string().optional(), // For newly added questions before saving
    text: z.string().min(1, 'Question text is required'),
    type: z.enum(['mcq', 'true_false', 'subjective']),
    options: z.array(z.string()).min(2, 'At least 2 options required').optional(),
    correct_answer: z.string().min(1, 'Please provide the correct answer'),
    marks: z.number().min(1, 'Marks must be at least 1'),
    image_url: z.string().nullable().optional(),
    explanation: z.string().optional(),
});

export const examSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    subject: z.string().min(2, 'Subject is required'),
    course_id: z.number().nullable().optional(), // Can belong to a specific course tracking id
    description: z.string().optional(),

    // Config
    start_time: z.string().nullable().optional(),
    end_time: z.string().nullable().optional(),
    duration_minutes: z.number().min(5, 'Minimum 5 minutes'),
    total_marks: z.number().optional(), // Computed from questions
    passing_score: z.number().min(1, 'Required').max(100),
    is_randomized: z.boolean(),
    allow_review: z.boolean(),
    show_correct_answers: z.boolean(),

    // Assignment
    target_group: z.string().nullable().optional(),
    target_student_ids: z.array(z.string()).optional(),

    status: z.enum(['upcoming', 'ongoing', 'finished']).optional(),

    questions: z.array(questionSchema).min(1, 'Add at least one question'),
});

export type ExamFormData = z.infer<typeof examSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
