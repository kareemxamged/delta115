import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { X, ArrowLeft, ArrowRight, Save, LayoutGrid } from 'lucide-react';
import { examService } from '../../../../services/examService';

import { examSchema, ExamFormData } from '../../../../features/exam-creator/types';
import Stepper from '../../../../features/exam-creator/components/Stepper';
import Step1Info from '../../../../features/exam-creator/components/Step1Info';
import Step2Builder from '../../../../features/exam-creator/components/Step2Builder';
import Step3Settings from '../../../../features/exam-creator/components/Step3Settings';

import styles from './EditExamModal.module.css';

interface EditExamModalProps {
    examId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const STEPS = [
    { id: 1, title: 'Exam Info' },
    { id: 2, title: 'Question Builder' },
    { id: 3, title: 'Settings & Publish' }
];

export default function EditExamModal({ examId, onClose, onSuccess }: EditExamModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const methods = useForm<ExamFormData>({
        resolver: zodResolver(examSchema),
        mode: 'onTouched'
    });

    const { handleSubmit, trigger, reset } = methods;

    // Load Exam Data
    useEffect(() => {
        const loadExamData = async () => {
            setIsLoadingData(true);
            try {
                const data = await examService.getExamForEdit(examId);
                reset(data); // Inject all existing data into the form
            } catch (error: any) {
                console.error('Failed to load exam:', error);
                toast.error(error.message || 'Failed to open exam editor.');
                onClose(); // Auto-close if we can't load or it's past start time
            } finally {
                setIsLoadingData(false);
            }
        };
        loadExamData();
    }, [examId, reset, onClose]);

    const nextStep = async () => {
        let fieldsToValidate: string[] = [];
        if (currentStep === 1) {
            fieldsToValidate = ['title', 'subject', 'course_id', 'description'];
        } else if (currentStep === 2) {
            fieldsToValidate = ['questions'];
        }

        const isStepValid = await trigger(fieldsToValidate as any);
        if (isStepValid) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
            // Scroll modal content to top
            const scrollContainer = document.getElementById('edit-modal-scroll');
            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            toast.error('Please fix the errors before continuing.');
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        const scrollContainer = document.getElementById('edit-modal-scroll');
        if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onUpdate = async (data: ExamFormData) => {
        setIsSubmitting(true);
        try {
            await examService.updateExam(examId, data);
            toast.success('Exam updated successfully! ✅');
            onSuccess(); // Refresh the list
            onClose();   // Close the modal
        } catch (error: any) {
            console.error('Failed to update exam', error);
            // This is where the strict "Exam has already started" error will be caught
            toast.error(error.message || 'Failed to save changes.');
            if (error.message?.includes('started')) {
                onClose(); // Force close if the exam started while they were editing
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>

                {/* Modal Header (Fixed) */}
                <div className={styles.modalHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className={styles.iconBox}>
                            <LayoutGrid color="#818cf8" size={20} />
                        </div>
                        <div>
                            <h2 className={styles.title}>Edit Exam</h2>
                            <p className={styles.subtitle}>Modify questions, settings, and schedule</p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} disabled={isSubmitting}>
                        <X size={24} />
                    </button>
                </div>

                {isLoadingData ? (
                    <div className={styles.loadingWrapper}>
                        <div className={styles.loader}></div>
                        <p>Loading exam data for editing...</p>
                    </div>
                ) : (
                    <FormProvider {...methods}>
                        {/* Scrollable Content Area */}
                        <div id="edit-modal-scroll" className={styles.modalContent}>
                            <Stepper currentStep={currentStep} steps={STEPS} />

                            <div className={styles.stepWrapper}>
                                {currentStep === 1 && <Step1Info />}
                                {currentStep === 2 && <Step2Builder />}
                                {currentStep === 3 && <Step3Settings />}
                            </div>
                        </div>

                        {/* Modal Footer (Fixed) */}
                        <div className={styles.modalFooter}>
                            {currentStep > 1 ? (
                                <button type="button" onClick={prevStep} className={styles.btnOutline} disabled={isSubmitting}>
                                    <ArrowLeft size={16} /> Previous Step
                                </button>
                            ) : <div></div>}

                            {currentStep < 3 ? (
                                <button type="button" onClick={nextStep} className={styles.btnPrimary}>
                                    Next Step <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit((data) => onUpdate(data as ExamFormData))}
                                    className={`${styles.btnPrimary} ${styles.btnSave}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : <><Save size={16} /> Complete Edit</>}
                                </button>
                            )}
                        </div>
                    </FormProvider>
                )}

            </div>
        </div>
    );
}
