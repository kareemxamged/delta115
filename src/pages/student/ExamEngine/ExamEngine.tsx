import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamEngine } from './hooks/useExamEngine';
import styles from './ExamEngine.module.css'; // Make sure this exists or use inline styles
import ExamHeader from './components/ExamHeader';
import ExamSidebar from './components/ExamSidebar';
import QuestionArea from './components/QuestionArea';
import ExamFooter from './components/ExamFooter';
import SummaryModal from './components/SummaryModal';
import ConfirmSubmitModal from './components/ConfirmSubmitModal';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { examService } from '../../../services/examService';
import { Exam } from './types';

export default function ExamEngine() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Remote Data State
    const [exam, setExam] = useState<Exam | null>(null);
    const [submission, setSubmission] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialization
    useEffect(() => {
        const initExam = async () => {
            if (!id) return;
            try {
                // 1. Fetch Exam Data
                const examData = await examService.getExamWithQuestions(Number(id));
                setExam(examData);

                // 2. Start/Resume Exam (Returns full submission now)
                const subData = await examService.startExam(Number(id));
                setSubmission(subData);
            } catch (err) {
                console.error("Failed to initialize exam:", err);
                setError("Failed to load exam. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        initExam();
    }, [id]);

    const {
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        answers,
        flags,
        timeLeft,
        isSaved,
        status,
        nextQuestion,
        prevQuestion,
        jumpToQuestion,
        answerQuestion,
        toggleFlag,
        finishExam
    } = useExamEngine(exam, submission);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showSummary, setShowSummary] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    // Mobile Responsive
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, []);

    // Handle Finish
    useEffect(() => {
        if (status === 'finished') {
            // Redirect to real result page
            navigate(`/student/exams/${id}/result`, { replace: true });
        }
    }, [status, navigate, id]);

    const handleConfirmSubmit = () => {
        finishExam();
    };

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (error) return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-app)',
            color: 'white',
            padding: '2rem'
        }}>
            <div className="glass-card" style={{
                padding: '3rem',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.05)'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                    color: '#f87171'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Failed to Load</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
                <button
                    className="btn-primary"
                    onClick={() => window.location.reload()}
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );
    if (!exam) return <div style={{ color: 'white', padding: '3rem', textAlign: 'center' }}>Exam not found.</div>;
    if (!currentQuestion) return <div style={{ color: 'white', padding: '3rem', textAlign: 'center' }}>No questions available for this exam.</div>;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-app)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column'
        }}>

            <ExamHeader
                title={exam.title}
                timeLeft={timeLeft}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
                isSaved={isSaved}
            />

            <main style={{
                flex: 1,
                marginTop: '100px',
                marginBottom: '80px',
                padding: '2rem',
                marginRight: isSidebarOpen ? '300px' : '0',
                transition: 'margin-right 0.3s ease',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{ width: '100%', maxWidth: '900px' }}>

                    {/* Toggle Sidebar */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{
                            position: 'fixed',
                            right: '0',
                            top: '120px',
                            zIndex: 60,
                            background: 'var(--primary)',
                            border: 'none',
                            borderTopLeftRadius: '8px',
                            borderBottomLeftRadius: '8px',
                            width: '32px',
                            height: '50px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'none',
                            outline: 'none',
                            boxShadow: '-2px 0 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            width="16"
                            height="16"
                            style={{ transform: isSidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    <QuestionArea
                        question={currentQuestion}
                        answer={answers[currentQuestion.id]}
                        onChange={answerQuestion}
                    />

                </div>
            </main >

            <ExamSidebar
                questions={exam.questions}
                currentQuestionIndex={currentQuestionIndex}
                answers={answers}
                flags={flags}
                onJump={jumpToQuestion}
                isOpen={isSidebarOpen}
            />

            <ExamFooter
                onNext={nextQuestion}
                onPrev={prevQuestion}
                onFlag={toggleFlag}
                onOverview={() => setShowSummary(true)}
                isFirst={currentQuestionIndex === 0}
                isLast={currentQuestionIndex === totalQuestions - 1}
                isFlagged={!!flags[currentQuestion.id]}
            />

            {/* Modals */}
            {
                showSummary && (
                    <SummaryModal
                        questions={exam.questions}
                        answers={answers}
                        flags={flags}
                        onClose={() => setShowSummary(false)}
                        onJump={(idx) => {
                            jumpToQuestion(idx);
                            setShowSummary(false);
                        }}
                        onSubmit={() => {
                            setShowSummary(false);
                            setShowConfirmSubmit(true);
                        }}
                    />
                )
            }

            {
                showConfirmSubmit && (
                    <ConfirmSubmitModal
                        onCancel={() => setShowConfirmSubmit(false)}
                        onConfirm={handleConfirmSubmit}
                        unansweredCount={totalQuestions - Object.keys(answers).length}
                        timeLeft={timeLeft}
                    />
                )
            }

        </div >
    );
}
