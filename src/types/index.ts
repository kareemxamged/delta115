export type AppRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url?: string;
    role: AppRole;
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    error: Error | null;
}
