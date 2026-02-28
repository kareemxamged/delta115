import { ExamResultData } from '../types';

interface ResultHeaderProps {
    data: ExamResultData;
}

export default function ResultHeader({ data }: ResultHeaderProps) {
    const strokeDasharray = 283; // 2 * PI * 45 (radius)
    const strokeDashoffset = strokeDasharray - (data.percentage / 100) * strokeDasharray;

    return (
        <div className="glass-card" style={{
            padding: '2rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translate(-50%, 0)',
                width: '300px',
                height: '300px',
                background: data.isPassed ? 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%)',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
                    {data.isPassed ? '🎉 Exam Completed Successfully!' : 'Exam Not Passed. Keep Practicing!'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                    {/* SVG Score Circle */}
                    <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '1rem' }}>
                        <svg width="150" height="150" viewBox="0 0 100 100">
                            {/* Background Circle */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                            {/* Progress Circle */}
                            <circle
                                cx="50" cy="50" r="45" fill="none"
                                stroke={data.isPassed ? '#10b981' : '#ef4444'}
                                strokeWidth="8"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute',
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.percentage}%</div>
                            <div style={{ marginTop: '0.25rem' }}>
                                {data.isPassed ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#10b981" width="24" height="24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#ef4444" width="24" height="24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                        {data.studentScore} / {data.totalScore} Points
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Correct
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{data.correctAnswers}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Wrong
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{data.wrongAnswers}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Time
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{data.timeSpent}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0V9.499c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0V9.499c0-.621-.504-1.125-1.125-1.125h-.871M12.75 8.25c0-.621-.504-1.125-1.125-1.125h-.871M12 2.25a2.25 2.25 0 00-2.25 2.25v2.625" />
                            </svg>
                            Rank
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{data.rank}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
