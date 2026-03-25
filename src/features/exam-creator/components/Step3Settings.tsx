import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Clock, Shuffle, ShieldCheck, Users, UserPlus } from 'lucide-react';
import { supabase } from '../../../services/supabase';
import { ExamFormData } from '../types';
import { StudentPickerModal } from './StudentPickerModal';
import styles from '../ExamCreator.module.css';

export function Step3Settings() {
    const { register, watch, setValue, formState: { errors } } = useFormContext<ExamFormData>();
    const [levels, setLevels] = useState<string[]>([]);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const watchGroup = watch('target_group');
    const watchStudentIds = watch('target_student_ids') || [];
    const watchAllowReview = watch('allow_review');

    useEffect(() => {
        if (!watchAllowReview) {
            setValue('show_correct_answers', false);
        }
    }, [watchAllowReview, setValue]);

    useEffect(() => {
        // Fetch unique levels for the dropdown
        const fetchLevels = async () => {
            const { data } = await supabase.from('profiles').select('level').not('level', 'is', null);
            if (data) {
                const unique = Array.from(new Set(data.map(d => d.level))).filter(Boolean) as string[];
                setLevels(unique.sort());
            }
        };
        fetchLevels();
    }, []);

    return (
        <div className={styles.formArea}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 className={styles.title} style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Exam Settings</h3>
                <p className={styles.subtitle} style={{ margin: 0 }}>Configure time limits, passing requirements, and behavior.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Timing & Scheduling */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Clock size={16} color="#818cf8" /> Timing & Scheduling
                    </h4>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Start Time (Optional)</label>
                        <input
                            type="datetime-local"
                            {...register('start_time')}
                            className={styles.input}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Leave empty if students can start anytime.</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>End Time / Hard Deadline (Optional)</label>
                        <input
                            type="datetime-local"
                            {...register('end_time')}
                            className={styles.input}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Exam forcefully expires here regardless of student duration.</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Duration (in minutes) *</label>
                        <input
                            type="number"
                            {...register('duration_minutes', { valueAsNumber: true })}
                            className={styles.input}
                            min="5"
                        />
                        {errors.duration_minutes && <span className={styles.errorText}>{errors.duration_minutes.message}</span>}
                    </div>
                </div>

                {/* Grading & Behavior */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <ShieldCheck size={16} color="#34d399" /> Grading & Security
                    </h4>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Passing Score (%) *</label>
                        <input
                            type="number"
                            {...register('passing_score', { valueAsNumber: true })}
                            className={styles.input}
                            min="1" max="100"
                        />
                        {errors.passing_score && <span className={styles.errorText}>{errors.passing_score.message}</span>}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Minimum percentage required to pass.</span>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div>
                            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Shuffle size={14} color="#f59e0b" /> Randomize Questions
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                                Shuffle question order for each student
                            </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <div style={{ position: 'relative' }}>
                                <input type="checkbox" {...register('is_randomized')} style={{ opacity: 0, width: 0, height: 0 }} />
                                <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', transition: '0.3s', position: 'relative' }} className="toggle-bg">
                                    <div style={{ position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.3s' }} className="toggle-dot" />
                                </div>
                            </div>
                        </label>
                        <style>{`
                            input:checked + .toggle-bg { background: var(--primary) !important; }
                            input:checked + .toggle-bg .toggle-dot { transform: translateX(16px); }
                        `}</style>
                    </div>

                    {/* Allow Review Toggle */}
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div>
                            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ShieldCheck size={14} color="#60a5fa" /> Allow Review After Submission
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                                Let students revisit their answers after the exam
                            </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <div style={{ position: 'relative' }}>
                                <input type="checkbox" {...register('allow_review')} style={{ opacity: 0, width: 0, height: 0 }} />
                                <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', transition: '0.3s', position: 'relative' }} className="toggle-bg">
                                    <div style={{ position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.3s' }} className="toggle-dot" />
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Show Correct Answers Toggle */}
                    <div style={{
                        marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
                        opacity: watchAllowReview ? 1 : 0.5, pointerEvents: watchAllowReview ? 'auto' : 'none'
                    }}>
                        <div>
                            <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ShieldCheck size={14} color="#34d399" /> Show Correct Answers in Review
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                                Reveal correct answers when students review wrong responses
                            </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <div style={{ position: 'relative' }}>
                                <input type="checkbox" {...register('show_correct_answers')} style={{ opacity: 0, width: 0, height: 0 }} />
                                <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', transition: '0.3s', position: 'relative' }} className="toggle-bg">
                                    <div style={{ position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.3s' }} className="toggle-dot" />
                                </div>
                            </div>
                        </label>
                    </div>

                </div>

            </div>

            {/* Assignment & Access Section (Full Width Row) */}
            <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <Users size={16} color="#60a5fa" /> Visibility & Assignment
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    By default, exams are visible to all students. You can restrict this exam to a specific Academic Level, or strictly to a custom list of specific students.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Level / Group Selection */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Target Academic Level (Group)</label>
                        <select {...register('target_group')} className={styles.input} style={{ appearance: 'auto' }}>
                            <option value="">All Levels (Unrestricted)</option>
                            {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                        </select>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            If selected, only students in this level will see the exam.
                        </span>
                    </div>

                    {/* Specific Student Selection */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Specific Students override</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.2rem' }}>
                            <button
                                type="button"
                                onClick={() => setIsPickerOpen(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem',
                                    background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)',
                                    color: 'white', borderRadius: '8px', cursor: 'pointer', flex: 1,
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#818cf8'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                            >
                                <UserPlus size={16} color="#818cf8" />
                                {watchStudentIds.length > 0
                                    ? `Selected (${watchStudentIds.length}) Students`
                                    : 'Pick Specific Students...'}
                            </button>
                            {watchStudentIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setValue('target_student_ids', [])}
                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                            Selecting students will restrict the exam ONLY to them, bypassing the Level setting.
                        </span>
                    </div>
                </div>
            </div>

            <StudentPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                levelFilter={watchGroup}
                selectedStudentIds={watchStudentIds}
                onApplySelection={(ids) => setValue('target_student_ids', ids, { shouldDirty: true, shouldValidate: true })}
            />
        </div>
    );
}

export default Step3Settings;
