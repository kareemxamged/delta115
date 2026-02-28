import { ExamResultData } from '../types';

interface PerformanceBreakdownProps {
    data: ExamResultData;
}

export default function PerformanceBreakdown({ data }: PerformanceBreakdownProps) {
    return (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Performance Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {data.breakdown.map((item, index) => {
                    const percentage = (item.score / item.totalScore) * 100;
                    return (
                        <div key={index}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{item.type == 'MCQ' ? 'Multiple Choice' : item.type == 'Essay' ? 'Essay Questions' : item.type == 'True/False' ? 'True/False' : item.type}</span>
                                <span style={{ color: 'var(--text-muted)' }}>
                                    {item.score}/{item.totalScore} ({Math.round(percentage)}%)
                                </span>
                            </div>

                            {/* Progress Bar Container */}
                            <div style={{
                                height: '10px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '5px',
                                overflow: 'hidden',
                                marginBottom: '0.5rem'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${percentage}%`,
                                    background: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444',
                                    borderRadius: '5px',
                                    transition: 'width 1s ease-out'
                                }} />
                            </div>

                            <div style={{ fontSize: '0.85rem', color: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444' }}>
                                {item.performance === 'Excellent' ? 'Excellent' : item.performance === 'Very Good' ? 'Very Good' : item.performance === 'Good' ? 'Good' : 'Needs Improvement'}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
