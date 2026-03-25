import { useState, useEffect } from 'react';
import { supabase } from '../../../../services/supabase';
import { instructorService, InstructorMetrics } from '../../../../services/instructorService';
import { BookOpen, Users, FileText, Star, Save, Loader2, Compass, Briefcase, Award, Hash, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import styles from '../../../student/StudentProfile.module.css';

const professionalSchema = z.object({
    employee_id: z.string().min(1, 'Teacher ID is required'),
    department: z.string().min(1, 'Department is required'),
    specialization: z.string().min(2, 'Specialization is required'),
    academic_degree: z.string().min(1, 'Academic Degree is required'),
    years_of_experience: z.number().min(0, 'Experience must be valid')
});

type ProfessionalFormData = z.infer<typeof professionalSchema>;

interface Props {
    userId: string;
    initialData?: Partial<ProfessionalFormData>;
    onSaved: (data: Partial<ProfessionalFormData>) => void;
}

const DEPARTMENTS = ['Computer Science', 'Engineering', 'Science', 'Mathematics', 'Arts & Humanities', 'Business'];
const DEGREES = ['PhD', 'MSc', 'BSc', 'Professor', 'Assistant Professor'];

export default function TeacherProfessionalTab({ userId, initialData, onSaved }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [metrics, setMetrics] = useState<InstructorMetrics | null>(null);
    const [loadingMetrics, setLoadingMetrics] = useState(true);

    const [formData, setFormData] = useState<ProfessionalFormData>({
        employee_id: initialData?.employee_id || '',
        department: initialData?.department || '',
        specialization: initialData?.specialization || '',
        academic_degree: initialData?.academic_degree || '',
        years_of_experience: initialData?.years_of_experience || 0
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ProfessionalFormData, string>>>({});

    useEffect(() => {
        instructorService.getMetrics(userId).then(data => {
            setMetrics(data);
            setLoadingMetrics(false);
        });
    }, [userId]);

    const handleSave = async () => {
        try {
            setErrors({});
            const validData = professionalSchema.parse(formData);

            setSaving(true);
            const { error } = await supabase
                .from('profiles')
                .update(validData)
                .eq('id', userId);

            if (error) throw error;

            onSaved(validData);
            setIsEditing(false);
            toast.success('Professional details updated successfully');
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const newErrors: any = {};
                err.issues.forEach((e: z.ZodIssue) => {
                    if (e.path[0]) newErrors[e.path[0]] = e.message;
                });
                setErrors(newErrors);
                toast.error('Please check the form for errors');
            } else {
                toast.error('Failed to save professional data');
                console.error(err);
            }
        } finally {
            setSaving(false);
        }
    };

    const statCards = [
        { label: 'Courses Managed', value: metrics ? String(metrics.totalCourses) : '—', icon: BookOpen, color: '#60a5fa' },
        { label: 'Exams Published', value: metrics ? String(metrics.examsPublished) : '—', icon: FileText, color: '#34d399' },
        { label: 'Active Students', value: metrics ? String(metrics.activeStudents) : '—', icon: Users, color: '#a78bfa' },
        { label: 'Avg. Rating', value: metrics ? String(metrics.averageRating) : '—', icon: Star, color: '#fb923c' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Instructor Metrics Grid */}
            <div className={styles.card} style={{ border: '1px solid rgba(139, 92, 246, 0.2)', background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)' }}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Instructor Performance</h3>
                </div>
                {loadingMetrics ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Loader2 size={32} className={styles.spin} color="rgba(255,255,255,0.2)" />
                    </div>
                ) : (
                    <div className={styles.statsGrid}>
                        {statCards.map(s => (
                            <div key={s.label} className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div className={styles.statIcon} style={{ background: `${s.color}20`, color: s.color }}>
                                        <s.icon size={22} />
                                    </div>
                                </div>
                                <div className={styles.statValue}>{s.value}</div>
                                <div className={styles.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Academic Credentials Form */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Academic Credentials</h3>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className={styles.editBtn}>Edit Details</button>
                    )}
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.formGrid}>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Teacher ID <Hash size={14} /></label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className={`${styles.input} ${errors.employee_id ? styles.inputError : ''}`}
                                    value={formData.employee_id}
                                    onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                                />
                            ) : <div className={styles.textValue}>{formData.employee_id || '—'}</div>}
                            {errors.employee_id && <span className={styles.errorText}>{errors.employee_id}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Department <Building size={14} /></label>
                            {isEditing ? (
                                <select
                                    className={`${styles.input} ${errors.department ? styles.inputError : ''}`}
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="">Select Department...</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            ) : <div className={styles.textValue}>{formData.department || '—'}</div>}
                            {errors.department && <span className={styles.errorText}>{errors.department}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Specialization <Compass size={14} /></label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className={`${styles.input} ${errors.specialization ? styles.inputError : ''}`}
                                    value={formData.specialization}
                                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                    placeholder="e.g. Quantum Mechanics"
                                />
                            ) : <div className={styles.textValue}>{formData.specialization || '—'}</div>}
                            {errors.specialization && <span className={styles.errorText}>{errors.specialization}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Academic Degree <Award size={14} /></label>
                            {isEditing ? (
                                <select
                                    className={`${styles.input} ${errors.academic_degree ? styles.inputError : ''}`}
                                    value={formData.academic_degree}
                                    onChange={e => setFormData({ ...formData, academic_degree: e.target.value })}
                                >
                                    <option value="">Select Degree...</option>
                                    {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            ) : <div className={styles.textValue}>{formData.academic_degree || '—'}</div>}
                            {errors.academic_degree && <span className={styles.errorText}>{errors.academic_degree}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Years of Experience <Briefcase size={14} /></label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    className={`${styles.input} ${errors.years_of_experience ? styles.inputError : ''}`}
                                    value={formData.years_of_experience}
                                    onChange={e => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                                />
                            ) : <div className={styles.textValue}>{formData.years_of_experience || '0'} Years</div>}
                            {errors.years_of_experience && <span className={styles.errorText}>{errors.years_of_experience}</span>}
                        </div>

                    </div>

                    {isEditing && (
                        <div className={styles.formActions}>
                            <button onClick={() => setIsEditing(false)} className={styles.cancelBtn} disabled={saving}>Cancel</button>
                            <button onClick={handleSave} className={styles.saveBtn} disabled={saving} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                                {saving ? <Loader2 size={16} className={styles.spin} /> : <Save size={16} />}
                                Save professional
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
