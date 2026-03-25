import React, { useEffect, useState } from 'react';
import { X, Clock, FileText, Activity, Layers, CheckCircle } from 'lucide-react';
import styles from './SubmissionsModal.module.css';
import { examService } from '../../../../services/examService';
import LoadingSpinner from '../../../../components/LoadingSpinner';

interface SubmissionsModalProps {
    exam: any; // The exam object selected from the dashboard
    onClose: () => void;
}

export default function SubmissionsModal({ exam, onClose }: SubmissionsModalProps) {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const data = await examService.getExamSubmissions(exam.id);
                setSubmissions(data || []);
            } catch (error) {
                console.error("Failed to load submissions", error);
            } finally {
                setLoading(false);
            }
        };

        if (exam?.id) {
            fetchSubmissions();
        }
    }, [exam]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Derived Stats
    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter(s => s.status === 'submitted');
    const avgScore = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedSubmissions.length)
        : 0;

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <header className={styles.header}>
                    <div className={styles.titleArea}>
                        <h2>{exam.title}</h2>
                        <div className={styles.statsRow}>
                            <span className={styles.statBadge}>
                                <FileText size={16} />
                                {totalSubmissions} Submissions
                            </span>
                            <span className={styles.statBadge}>
                                <Activity size={16} />
                                Avg Score: {avgScore} / {exam.total_marks || '?'}
                            </span>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.content}>
                    {loading ? (
                        <LoadingSpinner fullScreen={false} text="Loading submissions..." />
                    ) : submissions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Layers className={styles.emptyIcon} />
                            <h3>No submissions yet</h3>
                            <p>When students take this exam, their results will appear here.</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Timestamp</th>
                                    <th>Status</th>
                                    <th>Score</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub: any) => {
                                    const profile = sub.profiles;
                                    const isSubmitted = sub.status === 'submitted';
                                    const pct = exam.total_marks > 0 && isSubmitted
                                        ? Math.round(((sub.score || 0) / exam.total_marks) * 100)
                                        : 0;

                                    return (
                                        <tr key={sub.id}>
                                            <td>
                                                <div className={styles.studentCell}>
                                                    <img
                                                        src={profile?.avatar_url || 'https://ui-avatars.com/api/?name=Student&background=random'}
                                                        alt="Avatar"
                                                        className={styles.avatar}
                                                    />
                                                    <span className={styles.studentName}>
                                                        {profile?.full_name || 'Unknown Student'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.studentCell}>
                                                    <Clock size={14} style={{ color: '#64748b' }} />
                                                    <span className={styles.timestamp}>
                                                        {new Date(sub.started_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[`status_${sub.status}`]}`}>
                                                    {isSubmitted ? 'Graded' : 'In Progress'}
                                                </span>
                                            </td>
                                            <td>
                                                {isSubmitted ? (
                                                    <div className={styles.scoreBox}>
                                                        <span className={styles.scoreVal}>{sub.score} / {exam.total_marks}</span>
                                                        <span className={styles.scorePct}>{pct}%</span>
                                                    </div>
                                                ) : (
                                                    <span className={styles.scorePct}>Pending</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    className={styles.reviewBtn}
                                                    disabled={!isSubmitted}
                                                    style={!isSubmitted ? { opacity: 0.3 } : undefined}
                                                >
                                                    <CheckCircle size={16} />
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
