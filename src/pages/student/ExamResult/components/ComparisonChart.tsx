import { ExamResultData } from '../types';

interface ComparisonChartProps {
    data: ExamResultData;
}

export default function ComparisonChart({ data }: ComparisonChartProps) {
    return (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Performance Comparison
            </h3>

            <div style={{ position: 'relative', height: '150px', padding: '1rem 0' }}>
                {/* Y Axis Labels */}
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>100%</span>
                    <span>50%</span>
                    <span>0%</span>
                </div>

                {/* Chart Area */}
                <div style={{ marginLeft: '40px', height: '100%', position: 'relative', borderLeft: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>

                    {/* Class Average Line (Dotted) */}
                    <div style={{
                        position: 'absolute',
                        bottom: `${data.classAverage}%`,
                        left: 0, right: 0,
                        borderTop: '1px dashed rgba(255,255,255,0.3)'
                    }}>
                        <span style={{ position: 'absolute', right: 0, top: '-20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Class Avg: {data.classAverage}%</span>
                    </div>

                    {/* Student Bar */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '40px',
                        height: `${data.percentage}%`,
                        background: '#3b82f6',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 1s ease-out'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-25px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontWeight: 'bold',
                            color: '#3b82f6'
                        }}>
                            You
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
