import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import {
    User, BookOpen, BarChart2, Mail,
    Phone, Calendar, Save, Edit2, Lock
} from 'lucide-react';
import { supabase } from '../../../../services/supabase';
import { toast } from 'react-hot-toast';
import styles from '../../../student/StudentProfile.module.css';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const personalSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    mobile: z
        .string()
        .regex(/^(\+\d{1,3}\s?)?\d{9,13}$/, 'Invalid phone number (e.g. +201234567890)')
        .optional()
        .or(z.literal('')),
    date_of_birth: z
        .string()
        .refine(v => !v || v <= new Date().toISOString().split('T')[0], 'DOB cannot be in the future')
        .optional(),
    headline: z.string().max(100, 'Headline must be under 100 characters').optional(),
    bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

type PersonalFormData = z.infer<typeof personalSchema>;

interface Props {
    userId: string;
    email: string;
    studentId?: string; // Kept for interface compatibility, but unused here
    initialData: Partial<PersonalFormData>;
    onSaved?: (saved: Partial<PersonalFormData>) => void;
}

// ─── Inline Error Message ─────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '-4px', display: 'block' }}>
            {msg}
        </span>
    );
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────
function Field({ label, icon, children, error }: { label: string; icon: React.ReactNode; children: React.ReactNode; error?: string }) {
    return (
        <div className={styles.inputGroup}>
            <label className={styles.label}>
                {icon} {label}
            </label>
            {children}
            <FieldError msg={error} />
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TeacherPersonalTab({ userId, email, initialData, onSaved }: Props) {
    const [isEditing, setIsEditing] = useState(false);

    const { register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset } = useForm<PersonalFormData>({
        resolver: zodResolver(personalSchema),
        defaultValues: {
            full_name: initialData.full_name ?? '',
            mobile: initialData.mobile ?? '',
            date_of_birth: initialData.date_of_birth ?? '',
            headline: initialData.headline ?? '',
            bio: initialData.bio ?? '',
        },
    });

    useEffect(() => {
        reset({
            full_name: initialData.full_name ?? '',
            mobile: initialData.mobile ?? '',
            date_of_birth: initialData.date_of_birth ?? '',
            headline: initialData.headline ?? '',
            bio: initialData.bio ?? '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    const onSubmit = async (data: PersonalFormData) => {
        try {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: data.full_name,
                    mobile: data.mobile,
                    date_of_birth: data.date_of_birth || null,
                    headline: data.headline,
                    bio: data.bio
                })
                .eq('id', userId);

            if (profileError) throw profileError;

            await supabase.auth.updateUser({
                data: { full_name: data.full_name },
            });

            toast.success('Profile updated successfully ✓');
            reset(data);          // mark form as pristine with new values
            onSaved?.(data);
            setIsEditing(false);
        } catch {
            toast.error('Failed to update profile');
        }
    };

    const handleCancel = () => { reset(initialData); setIsEditing(false); };

    const inputCls = (hasError?: boolean, enabledOverride: boolean = false) =>
        `${styles.input} ${!isEditing && !enabledOverride ? styles.inputDisabled : ''} ${hasError ? 'ring-error' : ''}`;

    // If the mobile field is edited without entering global editing mode, we give them a "Save Changes" button
    const showSaveInsteadOfEdit = isEditing || isDirty;

    return (
        <div className={styles.card}>
            <style>{`
                .ring-error { border-color: #f87171 !important; }
                .ring-error:focus { box-shadow: 0 0 0 4px rgba(248,113,113,0.15) !important; }
            `}</style>

            <div className={styles.cardHeader}>
                <div>
                    <h3 className={styles.cardTitle}>Personal Information</h3>
                    <p className={styles.cardSubtitle}>Manage your personal details and public profile.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isEditing && (
                        <button type="button" onClick={handleCancel}
                            className={styles.actionBtn}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={showSaveInsteadOfEdit ? handleSubmit(onSubmit) : () => setIsEditing(true)}
                        disabled={isSubmitting}
                        className={`${styles.actionBtn} ${showSaveInsteadOfEdit ? styles.primaryBtn : ''}`}
                        style={showSaveInsteadOfEdit ? { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' } : { display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {showSaveInsteadOfEdit ? <><Save size={16} /> {isSubmitting ? 'Saving…' : 'Save Changes'}</> : <><Edit2 size={16} /> Edit Profile</>}
                    </button>
                </div>
            </div>

            {isDirty && (
                <div style={{ marginBottom: '1.5rem', padding: '0.6rem 1rem', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px', fontSize: '0.82rem', color: '#fbbf24' }}>
                    You have unsaved changes
                </div>
            )}

            <div className={styles.formGrid}>

                <Field label="Full Name" icon={<User size={14} />} error={errors.full_name?.message}>
                    <div className={styles.inputWrapper}>
                        <input {...register('full_name')} disabled={!isEditing}
                            className={inputCls(!!errors.full_name)} placeholder="Enter your full name" />
                        {!isEditing && <Lock size={14} className={styles.lockIcon} />}
                    </div>
                </Field>

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Field label="Professional Headline" icon={<BookOpen size={14} />} error={errors.headline?.message}>
                        <div className={styles.inputWrapper}>
                            <input {...register('headline')} disabled={!isEditing}
                                className={`${inputCls(!!errors.headline)} ${isEditing ? styles.premiumHighlight : ''}`}
                                style={isEditing ? { borderColor: '#8b5cf6', boxShadow: '0 0 0 3px rgba(139,92,246,0.15)' } : {}}
                                placeholder="e.g. Senior Physics Professor" />
                            {!isEditing && <Lock size={14} className={styles.lockIcon} />}
                        </div>
                    </Field>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Field label="Bio" icon={<BarChart2 size={14} />} error={errors.bio?.message}>
                        <div className={styles.inputWrapper} style={{ height: 'auto' }}>
                            <textarea {...register('bio')} disabled={!isEditing}
                                className={`${inputCls(!!errors.bio)} ${styles.textarea} ${isEditing ? styles.premiumHighlight : ''}`}
                                style={isEditing ? { minHeight: '120px', borderColor: '#8b5cf6', boxShadow: '0 0 0 3px rgba(139,92,246,0.15)' } : { minHeight: '80px' }}
                                placeholder="Tell us about your professional background and teaching philosophy..." />
                            {!isEditing && <Lock size={14} className={styles.lockIcon} style={{ top: '16px', transform: 'none' }} />}
                        </div>
                    </Field>
                </div>

                {/* Always-readonly */}
                <Field label="Email Address" icon={<Mail size={14} />}>
                    <div className={styles.inputWrapper}>
                        <input type="email" value={email} disabled
                            className={`${styles.input} ${styles.inputDisabled}`} />
                        <Lock size={14} className={styles.lockIcon} />
                    </div>
                </Field>

                {/* REQUESTED MODIFICATION: Always Enabled Phone Number */}
                <Field label="Mobile Number" icon={<Phone size={14} />} error={errors.mobile?.message}>
                    <div className={styles.inputWrapper}>
                        <input {...register('mobile')} disabled={false} type="tel"
                            className={inputCls(!!errors.mobile, true)} placeholder="+201234567890" />
                    </div>
                </Field>

                <Field label="Date of Birth" icon={<Calendar size={14} />} error={errors.date_of_birth?.message}>
                    <div className={styles.inputWrapper}>
                        <input {...register('date_of_birth')} disabled={!isEditing} type="date"
                            max={new Date().toISOString().split('T')[0]}
                            className={inputCls(!!errors.date_of_birth)} />
                        {!isEditing && <Lock size={14} className={styles.lockIcon} />}
                    </div>
                </Field>

            </div>
        </div>
    );
}
