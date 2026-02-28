import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ExamDetails.module.css';
import { examService, Exam } from '../../services/examService';

import LoadingSpinner from '../../components/LoadingSpinner';

export default function ExamDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [showStartModal, setShowStartModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState('00:00:00');

    // Fetch Exam Data
    useEffect(() => {
        const fetchExam = async () => {
            if (id) {
                try {
                    const data = await examService.getExamById(Number(id));
                    if (data) {
                        setExam(data);
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

    // Timer Logic (Mock countdown)
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            // Just a mock countdown for visual
            const hours = String(23 - now.getHours()).padStart(2, '0');
            const minutes = String(59 - now.getMinutes()).padStart(2, '0');
            const seconds = String(59 - now.getSeconds()).padStart(2, '0');
            setTimeLeft(`${hours}:${minutes}:${seconds}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (loading) return <LoadingSpinner fullScreen text="Loading Details..." />;

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
                            <span className={styles.metaValue}>{new Date(exam.start_time).toLocaleDateString()}</span>
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
                                {exam.status === 'upcoming' ? 'Starts In' : 'Time Remaining'}
                            </div>
                            <div className={styles.timerValue}>{timeLeft}</div>
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
                            exam.status === 'upcoming' ? (
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
