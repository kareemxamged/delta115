import { useFormContext, useFieldArray } from 'react-hook-form';
import { Sparkles, Plus, AlertCircle } from 'lucide-react';
import { ExamFormData } from '../types';
import QuestionCard from './QuestionCard';
import styles from '../ExamCreator.module.css';
import { toast } from 'react-hot-toast';

export function Step2Builder() {
    const { control, formState: { errors } } = useFormContext<ExamFormData>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'questions'
    });

    const addQuestion = () => {
        append({
            text: '',
            type: 'mcq',
            options: ['', '', '', ''],
            correct_answer: '',
            marks: 1,
            image_url: null,
            explanation: '',
        });
    };

    const handleAIGeneration = () => {
        // Placeholder for future feature
        toast('AI Generation Studio coming soon! ✨', { icon: '🤖' });
    };

    return (
        <div className={styles.formArea} style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 className={styles.title} style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Question Builder</h3>
                    <p className={styles.subtitle} style={{ margin: 0 }}>Add and configure questions for your exam</p>
                </div>

                <button type="button" onClick={handleAIGeneration} className={styles.aiBtn}>
                    <Sparkles size={16} /> Auto-Generate with AI
                </button>
            </div>

            {errors.questions?.message && (
                <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} /> {errors.questions.message as string}
                </div>
            )}

            {fields.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '60px', height: '60px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <Plus size={30} color="#818cf8" />
                    </div>
                    <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.2rem' }}>No Questions Yet</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Start building your exam by adding your first question manually, or let AI generate them for you.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button type="button" onClick={addQuestion} className={styles.btnPrimary} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                            + Add Manually
                        </button>
                        <button type="button" onClick={handleAIGeneration} className={styles.aiBtn} style={{ padding: '0.6rem 1.5rem' }}>
                            <Sparkles size={16} /> Generate AI Defaults
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {fields.map((field, index) => (
                        <QuestionCard
                            key={field.id} // useFieldArray provides unique un-predictable IDs
                            index={index}
                            remove={remove}
                        />
                    ))}

                    <button type="button" onClick={addQuestion} className={styles.btnOutline} style={{ width: '100%', padding: '1rem', justifyContent: 'center', borderStyle: 'dashed' }}>
                        <Plus size={18} /> Add Another Question
                    </button>
                </div>
            )}
        </div>
    );
}

export default Step2Builder;
