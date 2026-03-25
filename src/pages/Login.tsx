import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { supabase } from '../services/supabase';
import styles from './Login.module.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { Shield } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading, refreshProfile } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auth Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // 2FA / MFA State
    const [showMFA, setShowMFA] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [mfaFactorId, setMfaFactorId] = useState('');
    const [isMfaLoading, setIsMfaLoading] = useState(false);

    const loginSuccessRef = useRef(false);

    const handleRoleRedirect = useCallback(async () => {
        try {
            const from = (location.state as any)?.from?.pathname;
            if (from && !from.includes('/login')) {
                navigate(from, { replace: true });
                return;
            }

            let role = 'student';
            try {
                let profile = user;
                if (!profile) profile = await refreshProfile();

                // When 2FA is needed, this might fail or return null due to RLS, which is handled correctly
                if (profile && profile.role) role = profile.role;
            } catch (profileErr) {
                console.error("Login: Profile fetch failed, defaulting to student", profileErr);
            }

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
            navigate('/student/dashboard');
        }
    }, [location.state, navigate, refreshProfile, user]);

    // 1. Check if user is ALREADY fully logged in on mount
    useEffect(() => {
        if (user) {
            handleRoleRedirect();
        }
    }, [user, handleRoleRedirect]);

    // 2. Initial AAL Check on Mount (to catch any stranded aal1 sessions on refresh)
    useEffect(() => {
        supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data: aal }) => {
            if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
                // We have an active session but it's only aal1. Reveal the MFA prompt immediately.
                supabase.auth.mfa.listFactors().then(({ data: factors }) => {
                    const totpFactor = factors?.totp.find(f => f.status === 'verified');
                    if (totpFactor) {
                        setMfaFactorId(totpFactor.id);
                        setShowMFA(true);
                    }
                });
            }
        });
    }, []);

    // 3. Listen to Auth State Changes
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Dislodge from Supabase auth lock execution thread
                setTimeout(async () => {
                    // Before considering it a valid login, check Assurance Level
                    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

                    if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
                        // Halt! Require 2FA verification.
                        const factors = await supabase.auth.mfa.listFactors();
                        const totpFactor = factors.data?.totp.find(f => f.status === 'verified');
                        if (totpFactor) {
                            setMfaFactorId(totpFactor.id);
                            setShowMFA(true);
                            setLoading(false);
                            return; // Stop flow
                        }
                    }

                    // If fully authenticated (aal2 or no 2FA required)
                    loginSuccessRef.current = true;
                    setLoading(false);
                    await handleRoleRedirect();
                }, 10);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate, handleRoleRedirect]);



    // ─── LOGIN HANDLER ───
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        loginSuccessRef.current = false;

        try {
            const performLogin = async () => {
                const { user: authUser } = await authService.signIn(email, password);

                if (authUser && !loginSuccessRef.current) {
                    // Check AAL because authListener might be delayed
                    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

                    if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
                        const factors = await supabase.auth.mfa.listFactors();
                        const totpFactor = factors.data?.totp.find(f => f.status === 'verified');
                        if (totpFactor) {
                            setMfaFactorId(totpFactor.id);
                            setShowMFA(true);
                            return; // Stop redirect, wait for MFA
                        }
                    }

                    // AAL1 perfectly fine (2FA not enabled)
                    await handleRoleRedirect();
                }
            };

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timed out. Please check your connection.')), 10000)
            );

            await Promise.race([performLogin(), timeoutPromise]);
        } catch (err: any) {
            if (loginSuccessRef.current || showMFA) return;

            let message = err.message || 'Failed to login';
            if (message === 'Invalid login credentials') {
                message = 'Incorrect email or password. Please try again.';
            } else if (message.includes('Email not confirmed')) {
                message = 'Please verify your email address before logging in.';
            }
            setError(message);
        } finally {
            if (!loginSuccessRef.current && !showMFA) {
                setLoading(false);
            }
        }
    };

    // ─── VERIFY 2FA HANDLER ───
    const handleVerifyMFA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otpCode.length !== 6) {
            setError('Please enter a valid 6-digit code.');
            return;
        }
        setIsMfaLoading(true);
        setError('');

        try {
            console.log('Login: Sending MFA challenge for factor', mfaFactorId);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('MFA request timed out. Check network.')), 8000));

            const challengeTask = supabase.auth.mfa.challenge({ factorId: mfaFactorId });
            const challenge: any = await Promise.race([challengeTask, timeoutPromise]);
            if (challenge.error) throw challenge.error;

            console.log('Login: Sending MFA verify with code', otpCode);
            const verifyTask = supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: challenge.data.id,
                code: otpCode,
            });
            const verify: any = await Promise.race([verifyTask, timeoutPromise]);
            if (verify.error) throw verify.error;

            console.log('Login: MFA Verification successful. Elevating session to aal2.');
            loginSuccessRef.current = true;

            // Wait briefly to allow global AuthProvider to digest the TOKEN_REFRESHED event natively
            await new Promise(r => setTimeout(r, 600));

            // Force global useAuth cache to fetch and store the user BEFORE navigating
            await refreshProfile();

            await handleRoleRedirect();
        } catch (err: any) {
            console.error('Login: MFA Verify Error:', err);
            setError(err.message || 'Invalid Two-Factor Auth code or connection error.');
        } finally {
            setIsMfaLoading(false);
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

    const handleCancelMFA = async () => {
        await supabase.auth.signOut();
        setShowMFA(false);
        setOtpCode('');
        setError('');
        setLoading(false);
    };

    if (authLoading || (user && !showMFA)) {
        return <LoadingSpinner fullScreen text="Checking session..." />;
    }

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-card`}>

                {showMFA ? (
                    // ─── MFA VIEW ───
                    <>
                        <div className={styles.logoSection}>
                            <div style={{
                                background: 'rgba(139, 92, 246, 0.15)',
                                color: '#a78bfa',
                                width: '72px',
                                height: '72px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem auto',
                                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
                            }}>
                                <Shield size={32} />
                            </div>
                            <h2 className={styles.title}>Two-Factor Auth</h2>
                            <p className={styles.subtitle}>Enter the 6-digit code from your authenticator app.</p>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <form onSubmit={handleVerifyMFA}>
                            <div className={styles.formGroup}>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // only digits
                                        className={styles.input}
                                        style={{ textAlign: 'center', letterSpacing: '0.8rem', fontSize: '1.5rem', fontWeight: 700, padding: '1rem', width: '200px' }}
                                        placeholder="000000"
                                        autoComplete="one-time-code"
                                        inputMode="numeric"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }} disabled={isMfaLoading || otpCode.length !== 6}>
                                {isMfaLoading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <button type="button" onClick={handleCancelMFA} style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
                                Cancel &amp; Back to Login
                            </button>
                        </form>
                    </>
                ) : (
                    // ─── STANDARD LOGIN VIEW ───
                    <>
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
                    </>
                )}

            </div>
        </div>
    );
};

export default Login;
