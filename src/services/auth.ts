import { supabase } from './supabase';
import { UserProfile } from '../types';

export const authService = {
    // Sign Up (Register) with Metadata
    async signUp(email: string, password: string, fullName: string, metadata: any = {}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    ...metadata,
                },
            },
        });
        if (error) throw error;
        return data;
    },

    // Sign In (Login)
    async signIn(email: string, password: string) {
        console.log('authService: signIn called for', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error('authService: signIn failed', error);
            throw error;
        }
        console.log('authService: signIn successful', data);
        return data;
    },

    // Sign Out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },


    // Reset Password Email
    async resetPassword(email: string) {
        // Automatically redirects to /reset-password
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    },

    // Update Password (logged in)
    async updatePassword(password: string) {
        console.log('authService: updatePassword called');

        // Create a promise for the update
        const updatePromise = supabase.auth.updateUser({ password });

        // Create a timeout promise (10 seconds)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out. Please check your connection.')), 10000);
        });

        // Race them
        try {
            const result: any = await Promise.race([updatePromise, timeoutPromise]);
            const { data, error } = result;

            if (error) {
                console.error('authService: Update failed', error);
                throw error;
            }

            console.log('authService: Update successful', data);
            return data;
        } catch (err) {
            console.error('authService: Exception in updatePassword', err);
            throw err;
        }
    },

    // Get Current User Profile (with Role)
    async getCurrentProfile(): Promise<UserProfile | null> {
        // Create the fetch promise
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // Fetch extra profile data from 'profiles' table
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return profile as UserProfile;
        };

        // Create timeout promise (3 seconds) - reduced from 15s to avoid login hang
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timed out')), 3000)
        );

        try {
            // Race them
            return await Promise.race([fetchProfile(), timeoutPromise]) as UserProfile | null;
        } catch (error) {
            console.error('authService: getCurrentProfile failed or timed out', error);
            throw error; // Let the caller decide or fallback
        }
    }
};
