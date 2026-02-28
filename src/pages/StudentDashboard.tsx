import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import styles from './StudentDashboard.module.css';

// --- Types ---
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
}

const StatCard = ({ title, value, subtitle, icon, color }: StatCardProps) => (
    <div className={styles.statCard}>
        <div className={styles.statHeader}>
            <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{title}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{value}</div>
            </div>
            <div className={styles.statIcon} style={{ background: `${color}20`, color: color }}>
                {icon}
            </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{subtitle}</div>
    </div>
);

export default function StudentDashboard() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Auto-refresh clock (simulating "Real-time")
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 30000); // Update every 30s
        return () => clearInterval(timer);
    }, []);

    // --- Mock Data ---
    const stats = [
        {
            title: 'Total Exams', value: 24, subtitle: '18 Completed', color: '#6366f1',
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
        },
        {
            title: 'Completed', value: 18, subtitle: '75% Completion', color: '#10b981',
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        {
            title: 'Pending', value: 6, subtitle: '2 Due this week', color: '#f59e0b',
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        {
            title: 'GPA / Score', value: '85.5%', subtitle: 'Top 10% of class', color: '#ec4899',
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
        },
    ];

    const upcomingExams = [
        { id: 1, title: 'Advanced React Patterns', date: 'Tomorrow, 10:00 AM', duration: '60 mins', questions: 30 },
        { id: 2, title: 'Database Fundamentals', date: 'Dec 20, 02:00 PM', duration: '90 mins', questions: 40 },
    ];

    const recentResults = [
        { id: 101, title: 'TypeScript Basics', date: 'Dec 15, 2024', score: 90, total: 30, passed: true },
        { id: 102, title: 'Advanced JavaScript', date: 'Dec 12, 2024', score: 75, total: 40, passed: true },
        { id: 103, title: 'CSS Grid Mastery', date: 'Dec 10, 2024', score: 95, total: 20, passed: true },
    ];

    // --- Chart Logic (Simple SVG Line Chart) ---
    // Data points: [Day, Score]
    const chartData = [65, 70, 68, 75, 80, 85, 82, 90, 88, 95];
    const maxScore = 100;

    // Generate SVG Path
    const chartPath = useMemo(() => {
        const width = 100; // viewbox units
        const height = 50; // viewbox units
        const stepX = width / (chartData.length - 1);

        let path = `M0,${height - (chartData[0] / maxScore) * height}`;
        chartData.forEach((score, index) => {
            const x = index * stepX;
            const y = height - (score / maxScore) * height;
            path += ` L${x},${y}`;
        });
        return path;
    }, [chartData]);


    return (
        <div className={styles.container}>
            {/* 1. Header Section */}
            <header className={styles.header}>
                <div className={styles.welcomeSection}>
                    <h1>Hello, {user?.full_name?.split(' ')[0] || 'User'}! 👋</h1>
                    <p>You have <strong>{upcomingExams.length} exams</strong> coming up this week.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.iconBtn} title="Notifications">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        <div className={styles.badge}>3</div>
                    </button>
                    <button className={styles.iconBtn} title="Profile">
                        <div className={styles.headerAvatar}>
                            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </button>
                </div>
            </header>

            {/* 2. Stats Grid */}
            <div className={styles.statsGrid}>
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            {/* 3. Quick Actions */}
            <div className={styles.quickActions}>
                <button className={`${styles.actionBtn} ${styles.primaryAction}`}>
                    {/* Play Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                    Start Exam
                </button>
                <button className={`${styles.actionBtn} ${styles.secondaryAction}`}>
                    {/* Chart Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    View All Results
                </button>
                <button className={`${styles.actionBtn} ${styles.secondaryAction}`}>
                    {/* Badge/Certificate Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    Certificates
                </button>
            </div>

            {/* 4. Main Content Grid */}
            <div className={styles.contentGrid}>

                {/* Left Column: Upcoming & Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* A. Upcoming Exams */}
                    <section>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>Upcoming Exams</h3>
                            <span className={styles.viewAll}>View All →</span>
                        </div>
                        <div className={styles.cardList}>
                            {upcomingExams.map(exam => (
                                <div key={exam.id} className={styles.listCard}>
                                    <div>
                                        <div className={styles.cardInfoTitle}>{exam.title}</div>
                                        <div className={styles.cardInfoSub}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {/* Clock Icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {exam.date}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {/* Timer Icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {exam.duration}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {/* Clipboard Icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.25 2.25 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                                </svg>
                                                {exam.questions} Qs
                                            </span>
                                        </div>
                                    </div>
                                    <button className={styles.cardActionBtn}>Start Now</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* B. Performance Chart */}
                    <section>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>Performance Trend</h3>
                        </div>
                        <div className={styles.chartContainer}>
                            {/* Simple SVG Chart */}
                            <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                {/* Gradient Defs */}
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Area Fill */}
                                <path
                                    d={`${chartPath} L100,50 L0,50 Z`}
                                    fill="url(#chartGradient)"
                                />

                                {/* Line Stroke */}
                                <path
                                    d={chartPath}
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth="1.5"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Dots */}
                                {chartData.map((score, index) => {
                                    const width = 100;
                                    const height = 50;
                                    const x = index * (width / (chartData.length - 1));
                                    const y = height - (score / maxScore) * height;
                                    return (
                                        <circle
                                            key={index}
                                            cx={x}
                                            cy={y}
                                            r="1.5"
                                            fill="white"
                                            stroke="var(--primary)"
                                            strokeWidth="0.5"
                                            vectorEffect="non-scaling-stroke"
                                            style={{ transition: 'all 0.3s' }}
                                        />
                                    );
                                })}
                            </svg>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <span>Dec 1</span>
                                <span>Dec 8</span>
                                <span>Dec 15</span>
                                <span>Dec 22</span>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Right Column: Recent Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>Recent Results</h3>
                            <span className={styles.viewAll}>View All →</span>
                        </div>
                        <div className={styles.cardList}>
                            {recentResults.map(result => (
                                <div key={result.id} className={styles.listCard} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div className={styles.cardInfoTitle} style={{ fontSize: '0.95rem' }}>{result.title}</div>
                                            <div className={styles.cardInfoSub} style={{ fontSize: '0.8rem' }}>{result.date}</div>
                                        </div>
                                        <div style={{
                                            background: result.score >= 90 ? '#10b98120' : '#f59e0b20',
                                            color: result.score >= 90 ? '#10b981' : '#f59e0b',
                                            padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem'
                                        }}>
                                            {result.score}%
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${result.score}%`, height: '100%', background: result.score >= 90 ? '#10b981' : '#f59e0b' }}></div>
                                    </div>
                                    <div style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
                                        <button className={styles.secondaryAction} style={{ flex: 1, padding: '6px', fontSize: '0.8rem', borderRadius: '6px' }}>Report</button>
                                        <button className={styles.secondaryAction} style={{ flex: 1, padding: '6px', fontSize: '0.8rem', borderRadius: '6px' }}>Review</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
}
