import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import LoadingSpinner from '../../components/LoadingSpinner';

// Premium Icons
const Icons = {
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 001.524 8.243z" /></svg>,
    Filter: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>,
    Download: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
    Trophy: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172V5.25a3 3 0 00-3-3 3 3 0 00-3 3v6.328c0 1.05-.33 2.086-.982 3.172M9.497 14.25a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25" /></svg>,
    TrendUp: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
    Target: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg>,
    Clock: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="32" height="32"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

export default function StudentResults() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any[]>([]);
    const [filteredResults, setFilteredResults] = useState<any[]>([]);

    // Filters
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await examService.getUserResults();
                setResults(data);
                setFilteredResults(data);
            } catch (error) {
                console.error("Failed to load results", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    useEffect(() => {
        let res = results;
        if (search) {
            res = res.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
        }
        if (subjectFilter !== 'All') {
            res = res.filter(r => r.subject === subjectFilter);
        }
        setFilteredResults(res);
    }, [search, subjectFilter, dateFilter, results]);

    // Stats Calculation
    const totalExams = filteredResults.length;
    const avgScore = totalExams > 0
        ? Math.round(filteredResults.reduce((acc, curr) => acc + curr.percentage, 0) / totalExams)
        : 0;
    const highestScore = totalExams > 0 ? Math.max(...filteredResults.map(r => r.percentage)) : 0;
    const lowestScore = totalExams > 0 ? Math.min(...filteredResults.map(r => r.percentage)) : 0;

    const handleDownload = () => alert("Exporting results to PDF...");

    if (loading) return <LoadingSpinner fullScreen text="Loading results..." />;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>My Results</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track your progress and analyze your performance.</p>
            </div>

            {/* Filters Bar */}
            <div className="glass-card" style={{ padding: '0.75rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative', width: '550px', marginRight: 'auto' }}>
                    <input
                        type="text"
                        placeholder="Search exams..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            paddingLeft: '44px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                        <Icons.Search />
                    </span>
                </div>

                {/* Filter Select */}
                <div style={{ position: 'relative', minWidth: '180px' }}>
                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            paddingRight: '40px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            appearance: 'none'
                        }}
                    >
                        <option value="All" style={{ background: '#1e293b' }}>All Subjects</option>
                        {Array.from(new Set(results.map(r => r.subject).filter(Boolean))).map(sub => (
                            <option key={String(sub)} value={String(sub)} style={{ background: '#1e293b' }}>{String(sub)}</option>
                        ))}
                    </select>
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
                        <Icons.Filter />
                    </span>
                </div>

                {/* Export Button */}
                <button
                    onClick={handleDownload}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px',
                        background: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer',
                        fontSize: '0.95rem', fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    <Icons.Download /> <span>Export</span>
                </button>
            </div>

            {/* General Stats */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    General Statistics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Overall Average</div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: avgScore >= 75 ? '#10b981' : avgScore >= 50 ? '#f59e0b' : '#ef4444', lineHeight: 1 }}>
                            {avgScore}%
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Total Exams</div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>
                            {totalExams}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Highest Score</div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981', lineHeight: 1 }}>
                            {highestScore}%
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Lowest Score</div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ef4444', lineHeight: 1 }}>
                            {lowestScore}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Trend Chart */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--primary)' }}><Icons.TrendUp /></span> Performance Trend
                </h3>
                <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                    {results.length > 1 ? (
                        <SimpleLineChart data={[...results].reverse()} />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ opacity: 0.3 }}><Icons.TrendUp /></div>
                            Take more exams to see your trend!
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Results List */}
            {/* Same list code... simplified for brevity if needed but keeping logic */}
            {/* ... (Keeping existing list logic but improving padding/spacing via CSS classes if they existed, or inline) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredResults.map((result) => (
                    <div key={result.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* ... item content ... */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.25rem' }}>{result.title}</h3>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {new Date(result.date).toLocaleDateString()} • {result.subject || 'General'}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: result.percentage >= 80 ? '#10b981' : result.percentage >= 50 ? '#f59e0b' : '#ef4444'
                                }}>
                                    {result.percentage}%
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: result.status === 'Passed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: result.status === 'Passed' ? '#10b981' : '#ef4444',
                                    display: 'inline-block',
                                    marginTop: '4px'
                                }}>
                                    {result.status}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${result.percentage}%`,
                                height: '100%',
                                background: result.percentage >= 80 ? '#10b981' : result.percentage >= 50 ? '#f59e0b' : '#ef4444',
                                borderRadius: '4px',
                                transition: 'width 1s ease-out'
                            }} />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <button
                                onClick={() => navigate(`/student/exam/${result.examId}`)}
                                style={{
                                    background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer',
                                    fontSize: '0.9rem', fontWeight: '500'
                                }}
                            >
                                View Details
                            </button>
                            <button
                                onClick={() => navigate(`/student/exam/${result.examId}/review`)}
                                className="btn-primary"
                                style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                            >
                                Review Answers
                            </button>
                        </div>
                    </div>
                ))}
            </div>


            {/* Bottom Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <StatCard icon={<Icons.Trophy />} title="Top Result" value={`${highestScore}%`} subtext="Best performance yet" color="#fbbf24" />
                <StatCard icon={<Icons.TrendUp />} title="Progress" value="+12%" subtext="vs last month" color="#3b82f6" />
                <StatCard icon={<Icons.Target />} title="Accuracy" value="88%" subtext="Correct answers" color="#10b981" />
                <StatCard icon={<Icons.Clock />} title="Avg Speed" value="35m" subtext="Per exam" color="#8b5cf6" />
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, subtext, color }: any) {
    return (
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px',
                background: color, filter: 'blur(40px)', opacity: 0.15, borderRadius: '50%'
            }} />
            <div style={{
                color: color, marginBottom: '0.75rem', display: 'flex', justifyContent: 'center',
                background: `rgba(255,255,255,0.05)`, width: '64px', height: '64px', borderRadius: '50%',
                alignItems: 'center', margin: '0 auto 1rem auto'
            }}>
                {icon}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{title}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{subtext}</div>
        </div>
    );
}

// Simple Custom SVG Line Chart
function SimpleLineChart({ data }: { data: any[] }) {
    // Normalize data for SVG
    const width = 1000;
    const height = 300;
    const padding = 40;

    // Y Axis: 0 to 100
    const maxY = 100;

    const getX = (index: number) => {
        const space = (width - padding * 2) / (data.length - 1);
        return padding + index * space;
    };

    const getY = (percentage: number) => {
        const availableHeight = height - padding * 2;
        return height - padding - (percentage / maxY) * availableHeight;
    };

    const points = data.map((d, i) => `${getX(i)},${getY(d.percentage)}`).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map(p => (
                <g key={p}>
                    <line
                        x1={padding} y1={getY(p)}
                        x2={width - padding} y2={getY(p)}
                        stroke="rgba(255,255,255,0.1)" strokeWidth="1"
                    />
                    <text x={padding - 10} y={getY(p) + 5} fill="rgba(255,255,255,0.5)" fontSize="12" textAnchor="end">{p}%</text>
                </g>
            ))}

            {/* Line */}
            <polyline
                points={points}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Gradient Area under line (Optional simple fill) */}
            <polygon
                points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
                fill="var(--primary)"
                fillOpacity="0.1"
            />

            {/* Data Points */}
            {data.map((d, i) => (
                <g key={i}>
                    <circle cx={getX(i)} cy={getY(d.percentage)} r="6" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="2" />
                    <text
                        x={getX(i)}
                        y={getY(d.percentage) - 15}
                        fill="white"
                        fontSize="12"
                        textAnchor="middle"
                        opacity="0.8"
                    >
                        {d.percentage}%
                    </text>
                    <text
                        x={getX(i)}
                        y={height - 20}
                        fill="rgba(255,255,255,0.5)"
                        fontSize="12"
                        textAnchor="middle"
                    >
                        {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </text>
                </g>
            ))}
        </svg>
    );
}
