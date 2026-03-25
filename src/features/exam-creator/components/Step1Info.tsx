import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { supabase } from '../../../services/supabase';
import { ExamFormData } from '../types';
import styles from '../ExamCreator.module.css';

interface Course {
    id: number;
    name: string;
}

export function Step1Info() {
    const { register, watch, formState: { errors } } = useFormContext<ExamFormData>();
    const [courses, setCourses] = useState<Course[]>([]);

    const courseId = watch('course_id');

    useEffect(() => {
        // Fetch courses for the teacher
        const fetchCourses = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Assuming we fetch all open courses or courses assigned to this teacher
            const { data } = await supabase.from('courses').select('id, name');
            if (data) setCourses(data);
        };
        fetchCourses();
    }, []);

    return (
        <div className={styles.formArea}>
            <h3 className={styles.title} style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Basic Information</h3>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Exam Title *</label>
                <input
                    type="text"
                    {...register('title')}
                    placeholder="e.g. Midterm Mathematics Exam"
                    className={styles.input}
                />
                {errors.title && <span className={styles.errorText}>{errors.title.message}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Subject Area *</label>
                    <input
                        type="text"
                        {...register('subject')}
                        placeholder="e.g. Math, Science"
                        className={styles.input}
                    />
                    {errors.subject && <span className={styles.errorText}>{errors.subject.message}</span>}
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Link to Course *</label>
                    <select
                        {...register('course_id', { setValueAs: v => (v === "" || v === undefined) ? null : Number(v) })}
                        className={styles.input}
                        value={courseId || ""}
                    >
                        <option value="">-- Standalone Exam --</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                <label className={styles.label}>Description & Instructions</label>
                <textarea
                    {...register('description')}
                    placeholder="Provide instructions for the students..."
                    className={styles.input}
                    rows={4}
                />
            </div>
        </div>
    );
}

export default Step1Info;
