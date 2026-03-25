import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Trash2, Image as ImageIcon, Plus, X } from 'lucide-react';
import { supabase } from '../../../services/supabase';
import { ExamFormData } from '../types';
import styles from '../ExamCreator.module.css';

interface QuestionCardProps {
    index: number;
    remove: (index: number) => void;
}

export function QuestionCard({ index, remove }: QuestionCardProps) {
    const { register, watch, setValue } = useFormContext<ExamFormData>();

    const [isUploading, setIsUploading] = useState(false);

    // Watch specific fields for this question
    const qType = watch(`questions.${index}.type`);
    const qImageUrl = watch(`questions.${index}.image_url`);
    const qOptions = watch(`questions.${index}.options`) || [];

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('question-images')
                .upload(`public/${fileName}`, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('question-images').getPublicUrl(`public/${fileName}`);
            setValue(`questions.${index}.image_url`, data.publicUrl, { shouldValidate: true });
        } catch (error) {
            console.error('Image upload failed', error);
        } finally {
            setIsUploading(false);
        }
    };

    const addOption = () => {
        setValue(`questions.${index}.options`, [...qOptions, '']);
    };

    const removeOption = (optIndex: number) => {
        setValue(`questions.${index}.options`, qOptions.filter((_, i) => i !== optIndex));
    };

    return (
        <div className={styles.questionCard}>
            <div className={styles.questionHeader}>
                <h4 style={{ color: 'white', margin: 0 }}>Question #{index + 1}</h4>
                <button type="button" onClick={() => remove(index)} className={styles.removeBtn}>
                    <Trash2 size={14} /> Remove
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Question Text & Image */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <textarea
                            {...register(`questions.${index}.text`)}
                            placeholder="Enter your question here..."
                            className={styles.textarea}
                            rows={3}
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Image Upload Area */}
                    <div style={{ width: '140px', height: '90px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                        {qImageUrl ? (
                            <>
                                <img src={qImageUrl} alt="Question media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button type="button" onClick={() => setValue(`questions.${index}.image_url`, null)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', padding: '4px', color: 'white', cursor: 'pointer' }}>
                                    <X size={12} />
                                </button>
                            </>
                        ) : (
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                                {isUploading ? <div className={styles.spin}>↻</div> : <ImageIcon size={20} />}
                                <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Add Image</span>
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isUploading} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Question Config Row */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className={styles.inputGroup} style={{ flex: 1, marginBottom: 0 }}>
                        <label className={styles.label}>Question Type</label>
                        <select {...register(`questions.${index}.type`)} className={styles.select}>
                            <option value="mcq">Multiple Choice</option>
                            <option value="true_false">True / False</option>
                            <option value="subjective">Subjective (Text)</option>
                        </select>
                    </div>

                    <div className={styles.inputGroup} style={{ width: '120px', marginBottom: 0 }}>
                        <label className={styles.label}>Points/Marks</label>
                        <input type="number" {...register(`questions.${index}.marks`, { valueAsNumber: true })} className={styles.input} min="1" />
                    </div>
                </div>

                {/* Options Builder for MCQ */}
                {qType === 'mcq' && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <label className={styles.label}>Answer Options</label>
                            <button type="button" onClick={addOption} style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Plus size={12} /> Add Option
                            </button>
                        </div>

                        <div className={styles.optionsGrid}>
                            {qOptions.map((_, optIndex) => (
                                <div key={optIndex} style={{ display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                                        {String.fromCharCode(65 + optIndex)}
                                    </div>
                                    <input
                                        {...register(`questions.${index}.options.${optIndex}`)}
                                        placeholder={`Option ${optIndex + 1}`}
                                        className={styles.input}
                                        style={{ flex: 1 }}
                                    />
                                    {qOptions.length > 2 && (
                                        <button type="button" onClick={() => removeOption(optIndex)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={styles.inputGroup} style={{ marginTop: '1.5rem', marginBottom: 0 }}>
                            <label className={styles.label}>Correct Answer (Exact Match)</label>
                            <select {...register(`questions.${index}.correct_answer`)} className={styles.select}>
                                <option value="">-- Select Correct Option --</option>
                                {qOptions.map((opt, i) => (
                                    opt ? <option key={i} value={opt}>Option {String.fromCharCode(65 + i)}: {opt}</option> : null
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* True/False Options */}
                {qType === 'true_false' && (
                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.label}>Correct Answer</label>
                        <select {...register(`questions.${index}.correct_answer`)} className={styles.select}>
                            <option value="">-- Select --</option>
                            <option value="True">True</option>
                            <option value="False">False</option>
                        </select>
                    </div>
                )}

                {/* Explanation Field */}
                <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label}>Explanation (Shown after exam) - Optional</label>
                    <input
                        {...register(`questions.${index}.explanation`)}
                        placeholder="Explain why the answer is correct..."
                        className={styles.input}
                    />
                </div>
            </div>
        </div>
    );
}

export default QuestionCard;
