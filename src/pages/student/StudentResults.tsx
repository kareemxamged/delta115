import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, Filter, Download as DownloadIcon, Trophy, TrendingUp, Target, Clock, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function StudentResults() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any[]>([]);
    const [filteredResults, setFilteredResults] = useState<any[]>([]);

    // Filters & Sorting
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('Newest');

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
        let res = [...results];

        // 1. Search Filter
        if (search) {
            res = res.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
        }

        // 2. Subject Filter
        if (subjectFilter !== 'All') {
            res = res.filter(r => r.subject === subjectFilter);
        }

        // 3. Sorting
        res.sort((a, b) => {
            if (sortOrder === 'Newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortOrder === 'Oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortOrder === 'Highest') return b.percentage - a.percentage;
            if (sortOrder === 'Lowest') return a.percentage - b.percentage;
            return 0;
        });

        setFilteredResults(res);
    }, [search, subjectFilter, sortOrder, results]);

    // Safe Stats Calculation (O(N) safe from stack overflow)
    const totalExams = filteredResults.length;
    const avgScore = totalExams > 0
        ? Math.round(filteredResults.reduce((acc, curr) => acc + curr.percentage, 0) / totalExams)
        : 0;

    const highestScore = totalExams > 0
        ? filteredResults.reduce((max, r) => (r.percentage > max ? r.percentage : max), 0)
        : 0;

    const lowestScore = totalExams > 0
        ? filteredResults.reduce((min, r) => (r.percentage < min ? r.percentage : min), 100)
        : 0;

    const handleDownload = () => {
        if (filteredResults.length === 0) return;

        const headers = ['Exam Title', 'Subject', 'Date', 'Score (%)', 'Status'];
        const csvRows = [
            headers.join(','),
            ...filteredResults.map(r => [
                `"${r.title}"`,
                `"${r.subject || 'General'}"`,
                new Date(r.date).toLocaleDateString(),
                r.percentage,
                r.status
            ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-results-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return <LoadingSpinner fullScreen text="Loading results..." />;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>My Results</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track your progress and analyze your performance.</p>
            </div>

            {/* Filters Bar (Fluid & Wrap) */}
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <input
                        type="text"
                        placeholder="Search exams..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
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
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
                        <Search size={20} />
                    </span>
                </div>

                {/* Filter Select */}
                <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
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
                        <Filter size={20} />
                    </span>
                </div>

                {/* Sort Order Select */}
                <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                        }}
                    >
                        <option value="Newest" style={{ background: '#1e293b' }}>Sort: Newest First</option>
                        <option value="Oldest" style={{ background: '#1e293b' }}>Sort: Oldest First</option>
                        <option value="Highest" style={{ background: '#1e293b' }}>Sort: Highest Score</option>
                        <option value="Lowest" style={{ background: '#1e293b' }}>Sort: Lowest Score</option>
                    </select>
                </div>

                {/* Export Button */}
                <button
                    onClick={handleDownload}
                    disabled={filteredResults.length === 0}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px',
                        background: filteredResults.length === 0 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(to right, #8b5cf6, #6366f1)',
                        border: 'none', color: filteredResults.length === 0 ? 'rgba(255,255,255,0.3)' : 'white',
                        cursor: filteredResults.length === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.95rem', fontWeight: 'bold', flex: '1 1 auto', justifyContent: 'center',
                        boxShadow: filteredResults.length > 0 ? '0 4px 14px 0 rgba(139, 92, 246, 0.39)' : 'none',
                        transition: 'all 0.3s'
                    }}
                >
                    <DownloadIcon size={20} /> <span>Export CSV</span>
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
                    <span style={{ color: '#8b5cf6' }}><TrendingUp size={24} /></span> Performance Trend
                </h3>
                <div style={{ minHeight: results.length === 0 ? '200px' : '300px', width: '100%', position: 'relative' }}>
                    {results.length > 1 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={[...results].reverse()} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    stroke="rgba(255,255,255,0.2)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    stroke="rgba(255,255,255,0.2)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    formatter={(value: any) => [`${value}%`, 'Score']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="percentage"
                                    stroke="url(#colorScore)"
                                    strokeWidth={4}
                                    dot={{ fill: 'var(--bg-card)', stroke: '#8b5cf6', strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 7, fill: '#6366f1', stroke: 'white' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : results.length === 1 ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                            {/* Subtle placeholder curve */}
                            <svg viewBox="0 0 1000 300" style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none' }}>
                                <path d="M 0 300 Q 250 150 500 200 T 1000 50" fill="none" stroke="url(#placeholderGradient)" strokeWidth="4" />
                                <defs>
                                    <linearGradient id="placeholderGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem 2.5rem', borderRadius: '16px', backdropFilter: 'blur(8px)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                <TrendingUp size={36} color="#8b5cf6" />
                                <h4 style={{ color: 'white', fontSize: '1.2rem', margin: 0 }}>Baseline Established</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '300px', textAlign: 'center' }}>
                                    You scored <strong>{results[0].percentage}%</strong> on your first exam. Take more exams to unlock live trend tracking!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ opacity: 0.3 }}><TrendingUp size={48} /></div>
                            Insufficient data. Take your first exam to view statistics.
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Results List or Empty State */}
            {filteredResults.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                        <AlertCircle size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>No Results Found</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
                        We couldn't find any exams matching your current search or filter criteria. Try adjusting your filters to see more results.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredResults.map((result) => (
                        <div key={result.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => navigate(`/student/exams/${result.examId}`)}
                                    style={{
                                        background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer',
                                        fontSize: '0.9rem', fontWeight: '500'
                                    }}
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => navigate(`/student/exams/${result.examId}/review`)}
                                    className="btn-primary"
                                    style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                                >
                                    Review Answers
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <StatCard icon={<Trophy size={32} />} title="Top Result" value={`${highestScore}%`} subtext="Best performance yet" color="#fbbf24" />
                <StatCard icon={<TrendingUp size={32} />} title="Progress" value="+12%" subtext="vs last month" color="#3b82f6" />
                <StatCard icon={<Target size={32} />} title="Accuracy" value="88%" subtext="Correct answers" color="#10b981" />
                <StatCard icon={<Clock size={32} />} title="Avg Speed" value="35m" subtext="Per exam" color="#8b5cf6" />
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
