export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            courses: {
                Row: {
                    id: number
                    code: string
                    name: string
                    description: string | null
                    credits: number
                    department: string | null
                    semester: string | null
                    instructor: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    code: string
                    name: string
                    description?: string | null
                    credits?: number
                    department?: string | null
                    semester?: string | null
                    instructor?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    code?: string
                    name?: string
                    description?: string | null
                    credits?: number
                    department?: string | null
                    semester?: string | null
                    instructor?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            enrollments: {
                Row: {
                    id: string
                    student_id: string
                    course_id: number
                    status: 'enrolled' | 'completed' | 'dropped'
                    grade: number | null
                    enrolled_at: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    course_id: number
                    status?: 'enrolled' | 'completed' | 'dropped'
                    grade?: number | null
                    enrolled_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    course_id?: number
                    status?: 'enrolled' | 'completed' | 'dropped'
                    grade?: number | null
                    enrolled_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "enrollments_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "enrollments_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    }
                ]
            }
            exams: {
                Row: {
                    created_at: string | null
                    description: string | null
                    duration_minutes: number
                    id: number
                    instructions: string[] | null
                    start_time: string
                    status: Database["public"]["Enums"]["exam_status"] | null
                    subject: string
                    subject_color: string | null
                    subject_icon: string | null
                    title: string
                    topics: string[] | null
                    total_marks: number | null
                    total_questions: number | null
                    tutor_name: string | null
                    course_id: number | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    duration_minutes: number
                    id?: number
                    instructions?: string[] | null
                    start_time: string
                    status?: Database["public"]["Enums"]["exam_status"] | null
                    subject: string
                    subject_color?: string | null
                    subject_icon?: string | null
                    title: string
                    topics?: string[] | null
                    total_marks?: number | null
                    total_questions?: number | null
                    tutor_name?: string | null
                    course_id?: number | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    duration_minutes?: number
                    id?: number
                    instructions?: string[] | null
                    start_time?: string
                    status?: Database["public"]["Enums"]["exam_status"] | null
                    subject?: string
                    subject_color?: string | null
                    subject_icon?: string | null
                    title?: string
                    topics?: string[] | null
                    total_marks?: number | null
                    total_questions?: number | null
                    tutor_name?: string | null
                    course_id?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "exams_course_id_fkey"
                        columns: ["course_id"]
                        isOneToOne: false
                        referencedRelation: "courses"
                        referencedColumns: ["id"]
                    }
                ]
            }
            profiles: {
                Row: {
                    created_at: string | null
                    department: string | null
                    email: string | null
                    employee_id: string | null
                    full_name: string | null
                    id: string
                    level: string | null
                    major: string | null
                    role: Database["public"]["Enums"]["app_role"] | null
                    student_id: string | null
                    subjects: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    department?: string | null
                    email?: string | null
                    employee_id?: string | null
                    full_name?: string | null
                    id: string
                    level?: string | null
                    major?: string | null
                    role?: Database["public"]["Enums"]["app_role"] | null
                    student_id?: string | null
                    subjects?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    department?: string | null
                    email?: string | null
                    employee_id?: string | null
                    full_name?: string | null
                    id?: string
                    level?: string | null
                    major?: string | null
                    role?: Database["public"]["Enums"]["app_role"] | null
                    student_id?: string | null
                    subjects?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            questions: {
                Row: {
                    correct_answer: string | null
                    created_at: string | null
                    exam_id: number
                    id: number
                    marks: number | null
                    options: Json | null
                    text: string
                    type: Database["public"]["Enums"]["question_type"]
                }
                Insert: {
                    correct_answer?: string | null
                    created_at?: string | null
                    exam_id: number
                    id?: number
                    marks?: number | null
                    options?: Json | null
                    text: string
                    type: Database["public"]["Enums"]["question_type"]
                }
                Update: {
                    correct_answer?: string | null
                    created_at?: string | null
                    exam_id?: number
                    id?: number
                    marks?: number | null
                    options?: Json | null
                    text?: string
                    type?: Database["public"]["Enums"]["question_type"]
                }
                Relationships: [
                    {
                        foreignKeyName: "questions_exam_id_fkey"
                        columns: ["exam_id"]
                        isOneToOne: false
                        referencedRelation: "exams"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            app_role: "admin" | "teacher" | "student"
            exam_status: "upcoming" | "ongoing" | "finished"
            question_type: "mcq" | "true_false" | "essay"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
