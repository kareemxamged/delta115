import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/auth';
import { supabase } from '../services/supabase';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    signIn: typeof authService.signIn;
    signUp: typeof authService.signUp;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(() => {
        // Optimistic Initialization
        try {
            const cached = localStorage.getItem('user_profile');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    // If we have a user from cache, we aren't "loading" in the blocking sense
    const [loading, setLoading] = useState(() => !localStorage.getItem('user_profile'));

    // Fetch user on mount & listen for updates
    useEffect(() => {
        let mounted = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            // 1. No Session -> Logged Out
            if (!session?.user) {
                setUser(null);
                setLoading(false);
                localStorage.removeItem('user_profile');
                return;
            }

            // 2. Has Session -> Ensure Profile
            // Optimization: If we already have the correct user loaded, skip fetch
            if (user && user.id === session.user.id) {
                // Determine if we need to background refresh or if cache is good enough
                // For now, accept it. Use handle to background refresh if needed?
                // Actually better to verifying fetching fresh data in background if wanted
                // But for "background check" requirement, avoiding flicker is key.
                setLoading(false);
                return;
            }

            // 3. Fetch Profile (Background Check)
            try {
                const profile = await authService.getCurrentProfile();
                if (mounted && profile) {
                    setUser(profile);
                    localStorage.setItem('user_profile', JSON.stringify(profile));
                }
            } catch (error) {
                console.error("Auth: Failed to fetch profile", error);
                // If we had a cached user, we might want to keep it or clear it?
                // If fetch failed drastically, valid session might be gone.
            } finally {
                if (mounted) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []); // Empty dependency array is correct for auth listener

    const handleSignOut = async () => {
        await authService.signOut();
        setUser(null);
        localStorage.removeItem('user_profile');
    };

    const value = {
        user,
        loading,
        signIn: authService.signIn,
        signUp: authService.signUp,
        signOut: handleSignOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
