import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ExamDetails.module.css';
import { examService, Exam } from '../../services/examService';
import { supabase } from '../../services/supabase';

import LoadingSpinner from '../../components/LoadingSpinner';

export default function ExamDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [showStartModal, setShowStartModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState('00:00:00');
    const [invalidLink, setInvalidLink] = useState(false);

    // Fetch Exam Data
    useEffect(() => {
        const fetchExam = async () => {
            if (id) {
                try {
                    const data = await examService.getExamById(Number(id));
                    if (data && data.is_published !== false) {
                        setExam(data);
                    } else {
                        setInvalidLink(true);
                    }
                } catch (error) {
                    console.error('Failed to load exam', error);
                    navigate('/student/exams');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchExam();
    }, [id, navigate]);

    // Real countdown from exam.start_time
    useEffect(() => {
        if (!exam) return;

        const computeCountdown = () => {
            if (!exam.start_time) { setTimeLeft('Always Available'); return; }
            const target = new Date(exam.start_time).getTime();

            const diff = target - Date.now();
            if (diff <= 0) { setTimeLeft('00:00:00'); return; }

            const totalSeconds = Math.floor(diff / 1000);
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            setTimeLeft(
                `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            );
        };

        computeCountdown();
        const timer = setInterval(computeCountdown, 1000);
        return () => clearInterval(timer);
    }, [exam]);

    // Fast Real-Time Kickout if Unpublished Mid-view
    useEffect(() => {
        if (!exam) return;

        const channel = supabase
            .channel(`exam-status-${exam.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'exams', filter: `id=eq.${exam.id}` },
                (payload: any) => {
                    const updatedExam = payload.new;
                    if (updatedExam.is_published === false) {
                        // Force redirect
                        navigate('/student/exams', { replace: true });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [exam, navigate]);

    if (loading) return <LoadingSpinner fullScreen text="Loading Details..." />;

    if (invalidLink) {
        return (
            <div className={styles.container} style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className={styles.modalContent} style={{
                    textAlign: 'center',
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
                    padding: '3rem 2.5rem'
                }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '2px solid rgba(239, 68, 68, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '40px', height: '40px', color: '#f87171' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Invalid or Expired Link</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2.5rem', lineHeight: 1.6, fontSize: '1.05rem' }}>
                        The exam you are looking for does not exist, or it has been temporarily unpublished by the instructor.
                    </p>

                    <button
                        className={styles.startBtn}
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', marginTop: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onClick={() => navigate('/student/exams')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!exam) return null;

    const handleStartExam = () => {
        // Logic to start exam (Will navigate to Exam Engine later)
        console.log('Starting Exam:', exam.id);
        setShowStartModal(false);
        navigate(`/student/exams/${exam.id}/take`);
    };

    return (
        <div className={styles.container}>
            {/* Back Navigation */}
            <button className={styles.backBtn} onClick={() => navigate('/student/exams')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Exams
            </button>

            {/* Header Card */}
            <header className={styles.headerCard}>
                <div className={styles.examTitleRow}>
                    <h1 className={styles.examTitle}>{exam.title}</h1>
                    <span className={`${styles.statusBadge} ${styles[`status_${exam.status}`]}`}>
                        {exam.status}
                    </span>
                </div>

                <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                        <div className={styles.metaIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        </div>
                        <div>
                            <span className={styles.metaLabel}>Tutor</span>
                            <span className={styles.metaValue}>{exam.tutor_name}</span>
                        </div>
                    </div>

                    <div className={styles.metaItem}>
                        <div className={styles.metaIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                        </div>
                        <div>
                            <span className={styles.metaLabel}>Date</span>
                            <span className={styles.metaValue}>{exam.start_time ? new Date(exam.start_time).toLocaleDateString() : 'Always Available'}</span>
                        </div>
                    </div>

                    <div className={styles.metaItem}>
                        <div className={styles.metaIcon}>
                            {/* Clock Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className={styles.metaLabel}>Duration</span>
                            <span className={styles.metaValue}>{exam.duration_minutes} mins</span>
                        </div>
                    </div>
                </div>
            </header>
            {/* Description / Instructions from teacher */}
            {exam.description && (
                <div className={styles.sectionCard} style={{ margin: '1.5rem 0', gridColumn: '1 / -1' }}>
                    <h3 className={styles.sectionTitle}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Description &amp; Instructions
                    </h3>
                    <p style={{ color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{exam.description}</p>
                </div>
            )}

            <div className={styles.contentGrid}>
                {/* Main Info Column */}
                <div className={styles.leftCol}>
                    {/* Exam Info */}
                    <div className={styles.sectionCard}>
                        <h3 className={styles.sectionTitle}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            Exam Structure
                        </h3>
                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <span style={{ color: 'var(--text-muted)' }}>Total Questions</span>
                                <span className={styles.metaValue}>{exam.total_questions} Questions</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span style={{ color: 'var(--text-muted)' }}>Total Marks</span>
                                <span className={styles.metaValue}>{exam.total_marks || exam.total_questions} Marks</span>
                            </div>
                            {/* Question types breakdown not available in current schema */}
                        </div>
                    </div>

                    {/* Topics */}
                    <div className={styles.sectionCard}>
                        <h3 className={styles.sectionTitle}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                            Topics Covered
                        </h3>
                        <ul className={styles.topicsList}>
                            {exam.topics ? (
                                exam.topics.map((topic, i) => (
                                    <li key={i} className={styles.topicTag}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        {topic}
                                    </li>
                                ))
                            ) : (
                                <span style={{ color: '#64748b' }}>No specific topics listed.</span>
                            )}
                        </ul>
                    </div>

                    {/* Notes */}
                    <div className={styles.sectionCard}>
                        <h3 className={styles.sectionTitle}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            Important Instructions
                        </h3>
                        <ul className={styles.infoList} style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#cbd5e1' }}>
                            {exam.instructions ? (
                                exam.instructions.map((inst, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem' }}>{inst}</li>
                                ))
                            ) : (
                                <>
                                    <li style={{ marginBottom: '0.5rem' }}>Ensure you have a stable internet connection.</li>
                                    <li style={{ marginBottom: '0.5rem' }}>Once started, the timer cannot be paused.</li>
                                    <li style={{ marginBottom: '0.5rem' }}>Don't refresh the page during the exam.</li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Right Actions Column */}
                <div className={styles.actionCard}>
                    <div className={styles.sectionCard} style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)' }}>
                        <div className={styles.timerBox}>
                            <div className={styles.timerLabel}>
                                {!exam.start_time ? 'Availability' : exam.status === 'upcoming' ? 'Starts In' : 'Status'}
                            </div>
                            <div className={styles.timerValue} style={{ fontSize: !exam.start_time ? '1.5rem' : undefined }}>{timeLeft}</div>
                        </div>

                        {/* Logic based on SUBMISSION status first, then Exam status */}
                        {exam.submission_status === 'submitted' ? (
                            <button
                                className={styles.startBtn}
                                onClick={() => navigate(`/student/exams/${exam.id}/result`)}
                                style={{ background: '#334155' }}
                            >
                                Review Results
                            </button>
                        ) : exam.submission_status === 'started' ? (
                            <button className={styles.startBtn} onClick={() => navigate(`/student/exams/${exam.id}/take`)}>
                                Resume Exam
                            </button>
                        ) : (
                            /* No submission yet */
                            (exam.status === 'upcoming' && exam.start_time && new Date(exam.start_time).getTime() > Date.now()) ? (
                                <button className={styles.startBtn} disabled>
                                    Not Started Yet
                                </button>
                            ) : (
                                <button className={styles.startBtn} onClick={() => setShowStartModal(true)}>
                                    Start Exam Now →
                                </button>
                            )
                        )}

                        <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', marginTop: '1rem' }}>
                            ID: {exam.id} | Session Protected
                        </p>
                    </div>
                </div>
            </div>

            {/* Start Confirmation Modal */}
            {showStartModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>Ready to begin?</h2>

                        <div className={styles.checklist}>
                            <div className={styles.checkItem}>
                                <div className={styles.checkIcons}>✓</div>
                                <div>Stable internet connection</div>
                            </div>
                            <div className={styles.checkItem}>
                                <div className={styles.checkIcons}>✓</div>
                                <div>Distraction-free environment</div>
                            </div>
                            <div className={styles.checkItem}>
                                <div className={styles.checkIcons}>✓</div>
                                <div>Enough time allocated ({exam.duration_minutes} mins)</div>
                            </div>
                        </div>

                        <div className={styles.warningBox}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            You cannot pause or restart once you begin.
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowStartModal(false)}>
                                Cancel
                            </button>
                            <button className={styles.confirmBtn} onClick={handleStartExam}>
                                Yes, Start Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
