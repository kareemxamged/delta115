import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { supabase } from '../services/supabase';
import styles from './Login.module.css';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth(); // Get auth state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Ref to track if we successfully logged in via event
    const loginSuccessRef = useRef(false);

    // 1. Check if user is ALREADY logged in on mount
    useEffect(() => {
        if (user) {
            console.log('Login: User already authenticated, redirecting...');
            handleRoleRedirect();
        }
    }, [user]);

    useEffect(() => {
        // Listen for auth state changes (Magic Fix for Hanging Promises)
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Login: Auth Event detected:', event);

            if (event === 'SIGNED_IN' && session) {
                console.log('Login: SIGNED_IN event received! Processing login success...');
                loginSuccessRef.current = true;

                // Stop loading if it's spinning
                setLoading(false);

                await handleRoleRedirect();
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate]);

    const handleRoleRedirect = async () => {
        try {
            // 0. Check for "from" state (Redirect back to original page)
            const from = (location.state as any)?.from?.pathname;
            if (from && !from.includes('/login')) {
                console.log('Login: Redirecting back to origin:', from);
                navigate(from, { replace: true });
                return;
            }

            // Attempt to get profile with fallback
            let role = 'student';
            try {
                const profile = await authService.getCurrentProfile();
                if (profile && profile.role) role = profile.role;
            } catch (profileErr) {
                console.error("Login: Profile fetch failed, defaulting to student", profileErr);
            }

            console.log('Login: Redirecting for role:', role);
            switch (role) {
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'teacher':
                    navigate('/teacher/dashboard');
                    break;
                case 'student':
                    navigate('/student/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            console.error('Login: Role redirect error', err);
            // Even if profile fetch fails, we are logged in, so go to home/student
            navigate('/student/dashboard');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        loginSuccessRef.current = false; // Reset success tracker

        try {
            console.log('Login: Attempting sign in...');

            // Safety timeout wrapper
            const performLogin = async () => {
                const { user } = await authService.signIn(email, password);
                console.log('Login: Promise resolved with user:', user?.id);

                if (user && !loginSuccessRef.current) {
                    // Manual redirect if event didn't fire yet
                    await handleRoleRedirect();
                }
            };

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timed out. Please check your connection.')), 10000)
            );

            await Promise.race([performLogin(), timeoutPromise]);

        } catch (err: any) {
            console.error('Login: Catch block error:', err);

            // CRITICAL CHECK: Did we actually succeed via event?
            if (loginSuccessRef.current) {
                console.log('Login: Error ignored/suppressed because SIGNED_IN event was received.');
                return;
            }

            let message = err.message || 'Failed to login';

            if (message === 'Invalid login credentials') {
                message = 'Incorrect email or password. Please try again.';
            } else if (message.includes('Email not confirmed')) {
                message = 'Please verify your email address before logging in.';
            }

            setError(message);
        } finally {
            // Only stop loading if we haven't succeeded (if succeeded, redirect happens inside)
            // Or better, just always stop it to be safe. 
            // If redirect happens, component unmounts anyway.
            if (!loginSuccessRef.current) {
                setLoading(false);
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Google login failed');
        }
    };

    // Prevent rendering while checking auth or redirecting
    // Prevent rendering while checking auth or redirecting
    if (authLoading || user) {
        return <LoadingSpinner fullScreen text="Checking session..." />;
    }

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-card`}>
                <div className={styles.logoSection}>
                    <div className={styles.logo}>🎓</div>
                    <h2 className={styles.title}>Welcome Back</h2>
                    <p className={styles.subtitle}>Sign in to access your account</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className={styles.optionsRow}>
                        <label className={styles.rememberMe}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Remember me
                        </label>
                        <Link to="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.divider}>Or</div>

                <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin}>
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                </button>

                <div className={styles.signupLink}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
