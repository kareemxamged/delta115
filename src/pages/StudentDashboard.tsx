import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { examService } from '../services/examService';
import styles from './StudentDashboard.module.css';
import {
    Play, BarChart2, BookOpen, ClipboardList, CheckCircle,
    Timer, Calendar, Users, TrendingUp, Star, Clock, Eye,
} from 'lucide-react';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
} from 'recharts';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Exam {
    id: string;
    title: string;
    duration_minutes: number;
    total_marks: number;
    start_time: string | null;
    course_name?: string;
    submission_id?: string;
    submitted?: boolean;
}

interface Submission {
    id: string;
    exam_id: string;
    score: number | null;
    submitted_at: string;
    exam_title?: string;
}

interface DashboardData {
    upcomingExams: Exam[];
    liveExams: Exam[];
    recentSubmissions: Submission[];
    totalEnrolled: number;
    completedCount: number;
    newGradesCount: number;
}

// ─── Countdown Hook ──────────────────────────────────────────────────────────
function useCountdown(targetIso: string | null) {
    const [diff, setDiff] = useState(0);

    useEffect(() => {
        if (!targetIso) return;
        const tick = () => setDiff(Math.max(0, new Date(targetIso).getTime() - Date.now()));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetIso]);

    const hours = Math.floor(diff / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const seconds = Math.floor((diff % 60_000) / 1_000);
    return { hours, minutes, seconds, expired: diff === 0 };
}

// ─── GPA Gauge ───────────────────────────────────────────────────────────────
function GpaGauge({ gpa, max = 4 }: { gpa: number; max?: number }) {
    const r = 52;
    const cx = 66;
    const cy = 66;
    const circ = 2 * Math.PI * r;
    const pct = Math.min(gpa / max, 1);
    const dash = pct * circ;
    const color = gpa >= 3.5 ? '#34d399' : gpa >= 2.5 ? '#60a5fa' : '#f59e0b';

    return (
        <div className={styles.gaugeWrap}>
            <svg width={132} height={132} viewBox="0 0 132 132">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
                <circle cx={cx} cy={cy} r={r} fill="none"
                    stroke={color} strokeWidth={10}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeDashoffset={circ / 4}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }} />
            </svg>
            <div className={styles.gaugeCenter}>
                <div className={styles.gaugeValue}>{gpa.toFixed(2)}</div>
                <div className={styles.gaugeSubLabel}>Term GPA</div>
            </div>
        </div>
    );
}

// ─── Subject Color Map ────────────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, string> = {
    Math: '#6366f1',
    Physics: '#34d399',
    Chemistry: '#f59e0b',
    CS: '#ec4899',
    AI: '#ec4899',
    Science: '#60a5fa',
    English: '#a78bfa',
    Default: '#94a3b8',
};

function subjectColor(name: string): string {
    return SUBJECT_COLORS[name] ?? SUBJECT_COLORS.Default;
}

// ─── Chart Data Pivot ─────────────────────────────────────────────────────────
// Converts flat submissions list → [{date, Subject1: score, Subject2: score}]
function buildChartData(results: any[]) {
    const dateMap: Record<string, Record<string, string | number>> = {};
    const subjects = new Set<string>();

    [...results].reverse().forEach(r => {
        const label = new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const subj = r.subject ?? 'General';
        subjects.add(subj);
        if (!dateMap[label]) dateMap[label] = { date: label };
        dateMap[label][subj] = r.percentage;
    });

    return { rows: Object.values(dateMap), subjects: Array.from(subjects) };
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.chartTooltip}>
            <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.5rem', fontSize: '0.8rem' }}>{label}</div>
            {payload.map((p: any) => (
                <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', alignItems: 'center', padding: '2px 0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: p.stroke, fontSize: '0.78rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.stroke, display: 'inline-block' }} />
                        {p.dataKey}
                    </span>
                    <span style={{ fontWeight: 700, color: 'white', fontSize: '0.82rem' }}>{p.value}%</span>
                </div>
            ))}
        </div>
    );
}

// ─── Exam Status Logic ───────────────────────────────────────────────────────
function getExamStatus(exam: Exam, now: Date) {
    if (exam.submitted) return 'done';
    if (!exam.start_time) return 'upcoming';
    const start = new Date(exam.start_time);
    const end = new Date(start.getTime() + (exam.duration_minutes * 60000));
    if (now >= start && now <= end) return 'live';
    if (now > end) return 'missed';
    return 'upcoming';
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData>({
        upcomingExams: [], liveExams: [], recentSubmissions: [],
        totalEnrolled: 0, completedCount: 0, newGradesCount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [gpa, setGpa] = useState(0);
    const [now, setNow] = useState(new Date());
    const [chartRows, setChartRows] = useState<any[]>([]);
    const [chartSubjects, setChartSubjects] = useState<string[]>([]);

    // Tick every minute for status badges
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, []);

    // ─── Fetch Data ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                // 1. Enrolled courses
                const { data: enrollments } = await supabase
                    .from('enrollments')
                    .select('course_id')
                    .eq('student_id', user.id);
                const courseIds = enrollments?.map(e => e.course_id) ?? [];

                // 2. All exams for enrolled courses
                let exams: any[] = [];
                if (courseIds.length > 0) {
                    const { data } = await supabase
                        .from('exams')
                        .select('id, title, duration_minutes, total_marks, start_time, course_id, courses(name)')
                        .in('course_id', courseIds)
                        .order('start_time', { ascending: true });
                    exams = data || [];
                }

                // 3. Submissions for this student
                const { data: submissions } = await supabase
                    .from('submissions')
                    .select('id, exam_id, score, submitted_at, status')
                    .eq('student_id', user.id)
                    .order('submitted_at', { ascending: false });

                const submittedSet = new Set((submissions ?? []).map(s => s.exam_id));
                const completedSubs = (submissions ?? []).filter(s => s.score !== null);

                // 4. Compute GPA (avg score as % of total marks, mapped to 4.0)
                const examMap: Record<string, any> = {};
                (exams ?? []).forEach(e => { examMap[e.id] = e; });

                const scoredSubs = completedSubs.filter(s => examMap[s.exam_id]);
                const avgPct = scoredSubs.length
                    ? scoredSubs.reduce((acc, s) => acc + (s.score! / (examMap[s.exam_id]?.total_marks || 100)), 0) / scoredSubs.length
                    : 0;
                setGpa(+(avgPct * 4).toFixed(2));

                // 5. Categorize exams
                const n = new Date();
                const upcoming = (exams ?? [])
                    .filter(e => {
                        const submitted = submittedSet.has(e.id);
                        if (submitted) return false;
                        return !e.start_time || new Date(e.start_time) > n;
                    })
                    .map(e => ({ ...e, course_name: (e as any).courses?.name, submitted: false }));

                const live = (exams ?? [])
                    .filter(e => {
                        if (submittedSet.has(e.id)) return false;
                        if (!e.start_time) return false;
                        const start = new Date(e.start_time);
                        const end = new Date(start.getTime() + (e.duration_minutes * 60000));
                        return n >= start && n <= end;
                    })
                    .map(e => ({ ...e, course_name: (e as any).courses?.name, submitted: false }));

                // 6. All exams list for the Active Assignments panel
                const allExams = (exams ?? []).map(e => ({
                    ...e,
                    course_name: (e as any).courses?.name,
                    submitted: submittedSet.has(e.id),
                    submission_id: (submissions ?? []).find(s => s.exam_id === e.id)?.id,
                }));

                // 7. Recent submissions with exam title
                const recent = completedSubs.slice(0, 8).map(s => ({
                    ...s,
                    exam_title: examMap[s.exam_id]?.title ?? 'Exam',
                }));

                setData({
                    upcomingExams: upcoming.slice(0, 5),
                    liveExams: live,
                    recentSubmissions: recent,
                    totalEnrolled: courseIds.length,
                    completedCount: completedSubs.length,
                    newGradesCount: completedSubs.filter(s => s.score !== null).length,
                });

                // Store all exams for panel usage
                setAllExamList(allExams.slice(0, 6));

                // 8. Fetch per-subject results for chart
                try {
                    const userResults = await examService.getUserResults();
                    const { rows, subjects } = buildChartData(userResults);
                    setChartRows(rows);
                    setChartSubjects(subjects);
                } catch (_) { /* chart data optional */ }
            } catch (e) {
                console.error('Dashboard fetch error:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    const [allExamList, setAllExamList] = useState<Exam[]>([]);

    // Next event = first upcoming or live exam
    const nextExam = useMemo(() => data.liveExams[0] ?? data.upcomingExams[0] ?? null, [data]);
    const { hours, minutes, seconds } = useCountdown(nextExam?.start_time ?? null);

    // (chart data is now in chartRows / chartSubjects state)

    const completionPct = allExamList.length
        ? Math.round((data.completedCount / Math.max(allExamList.length, 1)) * 100)
        : 0;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.greeting}>
                    <h1>Hello, {user?.full_name?.split(' ')[0] || 'Student'} 👋</h1>
                    <p>Here's what's happening with your studies today.</p>
                </div>
            </header>

            {/* Next Event Countdown */}
            {nextExam && (
                <div className={styles.nextEventCard}>
                    <div>
                        <div className={styles.nextEventLabel}>⚡ Next Event</div>
                        <div className={styles.nextEventTitle}>{nextExam.title}</div>
                        <div className={styles.nextEventMeta}>
                            <Calendar size={13} />
                            {nextExam.course_name ?? 'General Exam'}
                            {nextExam.start_time && (
                                <> · {new Date(nextExam.start_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
                            )}
                        </div>
                    </div>

                    {nextExam.start_time && (
                        <div className={styles.countdown}>
                            {[{ val: hours, label: 'HRS' }, { val: minutes, label: 'MIN' }, { val: seconds, label: 'SEC' }].map((u, i) => (
                                <React.Fragment key={u.label}>
                                    {i > 0 && <div className={styles.cdSep}>:</div>}
                                    <div className={styles.cdUnit}>
                                        <div className={styles.cdNum}>{String(u.val).padStart(2, '0')}</div>
                                        <div className={styles.cdLabel}>{u.label}</div>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    <Link to={`/student/exams/${nextExam.id}`} className={styles.startBtn}>
                        <Play size={16} /> Start Now
                    </Link>
                </div>
            )}

            {/* Layout: Main + Sidebar */}
            <div className={styles.layout}>
                {/* Main Column */}
                <div>
                    {/* Quick Stats */}
                    <div className={styles.statsRow}>
                        <div className={styles.statCard}>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Active Exams</div>
                                <div className={styles.statValue}>{data.liveExams.length}</div>
                                <div className={styles.statSub}>{data.upcomingExams.length} upcoming</div>
                            </div>
                            <div className={styles.statIcon} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                                <ClipboardList size={24} />
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>New Grades</div>
                                <div className={styles.statValue}>{data.newGradesCount}</div>
                                <div className={styles.statSub}>{data.completedCount} total completed</div>
                            </div>
                            <div className={styles.statIcon} style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                                <Star size={24} />
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statInfo}>
                                <div className={styles.statLabel}>Completion</div>
                                <div className={styles.statValue}>{completionPct}%</div>
                                <div className={styles.statSub}>{data.completedCount} / {allExamList.length} exams</div>
                            </div>
                            <div className={styles.statIcon} style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Active Assignments / Exams */}
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}><ClipboardList size={18} /> Active Assignments</h3>
                        <Link to="/student/exams" className={styles.viewAll}>View All →</Link>
                    </div>

                    {loading ? (
                        <div className={styles.emptyState}>Loading exams…</div>
                    ) : allExamList.length === 0 ? (
                        <div className={styles.emptyState}>No exams found for your enrolled courses.</div>
                    ) : (
                        allExamList.map(exam => {
                            const status = getExamStatus(exam, now);
                            return (
                                <div key={exam.id} className={styles.examCard}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className={styles.examName}>{exam.title}</div>
                                        <div className={styles.examMeta}>
                                            <span><BookOpen size={12} />{exam.course_name ?? '—'}</span>
                                            <span><Clock size={12} />{exam.duration_minutes} min</span>
                                            {exam.start_time && (
                                                <span>
                                                    <Calendar size={12} />
                                                    {new Date(exam.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
                                        <span className={`${styles.statusBadge} ${status === 'live' ? styles.statusLive :
                                            status === 'upcoming' ? styles.statusUpcoming :
                                                status === 'missed' ? styles.statusMissed :
                                                    styles.statusDone
                                            }`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>

                                        {status === 'live' || status === 'upcoming' ? (
                                            <Link to={`/student/exams/${exam.id}`} className={`${styles.actionBtn} ${styles.primaryBtn}`}>
                                                <Play size={13} /> Start
                                            </Link>
                                        ) : status === 'done' && exam.submission_id ? (
                                            <Link to={`/student/results/${exam.submission_id}`} className={`${styles.actionBtn} ${styles.ghostBtn}`}>
                                                <Eye size={13} /> Result
                                            </Link>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Performance Chart — Recharts */}
                    {chartRows.length >= 2 && (
                        <div className={styles.chartSection}>
                            <div className={styles.sectionHeader}>
                                <h3 className={styles.sectionTitle}><BarChart2 size={18} /> Term Performance</h3>
                                <Link to="/student/results" className={styles.viewAll}>View All →</Link>
                            </div>

                            {/* Per-subject gradient defs (SVG workaround for recharts area fills) */}
                            <svg width={0} height={0} style={{ position: 'absolute' }}>
                                <defs>
                                    {chartSubjects.map((subj, i) => (
                                        <linearGradient key={i} id={`grad-${subj}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={subjectColor(subj)} stopOpacity={0.15} />
                                            <stop offset="95%" stopColor={subjectColor(subj)} stopOpacity={0} />
                                        </linearGradient>
                                    ))}
                                </defs>
                            </svg>

                            <div className={styles.chartWrap}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartRows} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            ticks={[0, 25, 50, 75, 100]}
                                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={v => `${v}%`}
                                        />
                                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                                        <Legend
                                            verticalAlign="top"
                                            align="right"
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingBottom: '0.5rem' }}
                                        />
                                        {chartSubjects.map(subj => (
                                            <Line
                                                key={subj}
                                                type="monotone"
                                                dataKey={subj}
                                                stroke={subjectColor(subj)}
                                                strokeWidth={2.5}
                                                dot={false}
                                                activeDot={{ r: 5, strokeWidth: 0 }}
                                                connectNulls
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    {/* GPA Gauge */}
                    <div className={styles.sideCard}>
                        <div className={styles.sideCardTitle}>Academic Standing</div>
                        <GpaGauge gpa={gpa} />
                        <div className={styles.statRow}>
                            <span className={styles.statRowLabel}><CheckCircle size={14} /> Exams Passed</span>
                            <span className={styles.statRowVal}>{data.completedCount}</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statRowLabel}><BookOpen size={14} /> Courses</span>
                            <span className={styles.statRowVal}>{data.totalEnrolled}</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statRowLabel}><Timer size={14} /> Pending Exams</span>
                            <span className={styles.statRowVal}>{data.upcomingExams.length + data.liveExams.length}</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.sideCard}>
                        <div className={styles.sideCardTitle}>Quick Access</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {[
                                { to: '/student/exams', icon: <ClipboardList size={15} />, label: 'My Exams' },
                                { to: '/student/results', icon: <BarChart2 size={15} />, label: 'My Results' },
                                { to: '/student/courses', icon: <BookOpen size={15} />, label: 'My Courses' },
                                { to: '/student/profile', icon: <Users size={15} />, label: 'My Profile' },
                            ].map(l => (
                                <Link key={l.to} to={l.to}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.75rem', borderRadius: '9px', color: 'var(--text-muted)', fontSize: '0.88rem', textDecoration: 'none', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = ''; }}>
                                    {l.icon} {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
