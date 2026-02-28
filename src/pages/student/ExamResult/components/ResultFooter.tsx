import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExamResultData } from '../types';

interface ResultFooterProps {
    data: ExamResultData;
}

export default function ResultFooter({ data }: ResultFooterProps) {
    const navigate = useNavigate();
    const { id } = useParams();
    const [showRetryModal, setShowRetryModal] = useState(false);

    // 1. Handle PDF Download (Print)
    const handlePrint = () => {
        window.print();
    };

    // 2. Handle Email Result
    const handleEmail = () => {
        const subject = `Exam Result: ${data.examTitle}`;
        const body = `
Hello,

Here is my exam result for ${data.examTitle}:

Result: ${data.isPassed ? 'PASSED' : 'FAILED'}
Score: ${data.percentage}% (${data.studentScore}/${data.totalScore})
Time Spent: ${data.timeSpent}

Regards,
        `.trim();

        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    // 3. Handle Retry Logic
    const handleRetry = () => {
        if (data.allowRetry) {
            navigate(`/student/exams/${id}/take`);
        } else {
            setShowRetryModal(true);
        }
    };

    return (
        <>
            <div className="result-footer-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                <style>
                    {`
                        @media print {
                            .result-footer-actions { display: none !important; }
                        }
                        
                        /* Button Animations & Hovers */
                        .result-btn {
                            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                            transform: scale(1);
                        }
                        .result-btn:hover {
                            transform: translateY(-2px);
                            filter: brightness(1.2);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                        }
                        .result-btn:active {
                            transform: scale(0.98);
                        }

                        /* Specific Button Colors */
                        .btn-download {
                            background: rgba(51, 65, 85, 0.5) !important;
                            color: #e2e8f0 !important;
                            border: 1px solid rgba(255,255,255,0.1) !important;
                        }
                        .btn-review {
                            background: var(--primary) !important;
                            color: white !important;
                            border: none !important;
                            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                        }
                        .btn-email {
                            background: rgba(139, 92, 246, 0.2) !important;
                            color: #c4b5fd !important;
                            border: 1px solid rgba(139, 92, 246, 0.3) !important;
                        }
                        .btn-retry {
                            background: rgba(234, 179, 8, 0.2) !important;
                            color: #fde047 !important;
                            border: 1px solid rgba(234, 179, 8, 0.3) !important;
                        }
                    `}
                </style>

                <button
                    onClick={handlePrint}
                    className="btn-secondary result-btn btn-download"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '3rem', cursor: 'pointer',
                        padding: '0 1.5rem', borderRadius: '0.5rem', fontWeight: 500
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download PDF
                </button>

                <button
                    onClick={() => navigate(`/student/exams/${id}/review`)}
                    className="btn-primary result-btn btn-review"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '3rem', cursor: 'pointer', minWidth: '160px',
                        padding: '0 1.5rem', borderRadius: '0.5rem', fontWeight: 500
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                    </svg>
                    Review Answers
                </button>

                <button
                    onClick={handleEmail}
                    className="btn-secondary result-btn btn-email"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '3rem', cursor: 'pointer',
                        padding: '0 1.5rem', borderRadius: '0.5rem', fontWeight: 500
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Email Result
                </button>

                <button
                    onClick={handleRetry}
                    className="btn-secondary result-btn btn-retry"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '3rem', cursor: 'pointer',
                        padding: '0 1.5rem', borderRadius: '0.5rem', fontWeight: 500
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Retry Exam
                </button>
            </div>

            {/* Default Retry Modal */}
            {showRetryModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowRetryModal(false)}>
                    <div className="glass-card" style={{
                        width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Retry Not Allowed</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            This exam is set to one-time only. You cannot retake it at this moment. Please contact your instructor for more information.
                        </p>
                        <button
                            className="btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => setShowRetryModal(false)}
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
