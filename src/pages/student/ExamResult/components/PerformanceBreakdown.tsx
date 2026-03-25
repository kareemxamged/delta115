import { ExamResultData } from '../types';
import { Hourglass } from 'lucide-react';

interface PerformanceBreakdownProps {
    data: ExamResultData;
}

const PERF_COLOR: Record<string, string> = {
    'Excellent': '#10b981',
    'Very Good': '#34d399',
    'Good': '#f59e0b',
    'Needs Improvement': '#ef4444',
    'Pending Review': '#94a3b8',
};

export default function PerformanceBreakdown({ data }: PerformanceBreakdownProps) {
    if (!data.breakdown || data.breakdown.length === 0) return null;

    return (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '0.6rem', marginBottom: '1.25rem',
                fontSize: '1rem', fontWeight: 600
            }}>
                Performance Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {data.breakdown.map((item, idx) => {
                    const isPending = item.performance === 'Pending Review';
                    const pct = item.totalScore > 0
                        ? Math.round((item.score / item.totalScore) * 100)
                        : 0;
                    const color = PERF_COLOR[item.performance] ?? '#64748b';
                    const typeLabel =
                        item.type === 'MCQ' ? 'Multiple Choice' :
                            item.type === 'True/False' ? 'True / False' :
                                item.type === 'Essay' ? 'Essay Questions' :
                                    item.type === 'Code' ? 'Code Questions' : item.type;

                    return (
                        <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: '0.93rem' }}>{typeLabel}</span>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        {isPending
                                            ? `${item.total} question${item.total !== 1 ? 's' : ''}`
                                            : `${item.correct} / ${item.total} correct`}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    {isPending ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color }}>
                                            <Hourglass size={13} /> Pending
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color }}>
                                            {item.score}/{item.totalScore} pts ({pct}%)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{
                                height: '8px', borderRadius: '99px',
                                background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
                                marginBottom: '4px'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: isPending ? '100%' : `${pct}%`,
                                    background: isPending
                                        ? 'repeating-linear-gradient(45deg, rgba(148,163,184,0.2) 0px, rgba(148,163,184,0.2) 4px, transparent 4px, transparent 8px)'
                                        : color,
                                    borderRadius: '99px',
                                    transition: 'width 1s ease-out'
                                }} />
                            </div>

                            <div style={{ fontSize: '0.78rem', color, fontWeight: 500 }}>
                                {item.performance}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
