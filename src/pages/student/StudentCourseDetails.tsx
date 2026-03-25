import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Mail, Clock, Calendar, FileText,
    BookOpen, BarChart2, BookMarked, CheckCircle2,
    Circle, ExternalLink, Play, Trophy,
    TrendingUp, Users, ChevronRight, Lock
} from 'lucide-react';
import { courseService } from '../../services/courseService';

// ─── Types ──────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'exams' | 'grades' | 'materials';

interface CourseData {
    id: number;
    name: string;
    code: string;
    description?: string;
    instructor?: string;
    department?: string;
    credits?: number;
    semester?: string;
    performance?: { grade: number; attendance: number; participation: number };
    exams?: ExamItem[];
}

interface ExamItem {
    id: number;
    title: string;
    start_time: string;
    duration_minutes: number;
    total_questions: number;
    total_marks: number;
    status: string;
    user_status?: string;
    user_score?: number;
}

interface Material {
    id: number;
    title: string;
    description?: string;
    type: 'pdf' | 'video' | 'slides' | 'link' | 'code';
    url?: string;
    file_size?: string;
    duration?: string;
    week?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getExamStatus(exam: ExamItem): 'upcoming' | 'active' | 'submitted' | 'completed' {
    if (exam.user_status === 'submitted') return 'submitted';
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(start.getTime() + exam.duration_minutes * 60000);
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    return 'completed';
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    upcoming: { label: 'Upcoming', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
    active: { label: 'Active', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    submitted: { label: 'Submitted', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    completed: { label: 'Completed', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
};

function gradeColor(pct: number) {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
}

function gradeLetter(pct: number) {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
}

const TYPE_META: Record<string, { color: string; icon: React.ReactNode; action: string }> = {
    pdf: { color: '#ef4444', icon: <FileText size={18} />, action: '↓ Download' },
    video: { color: '#8b5cf6', icon: <Play size={18} />, action: '▶ Watch' },
    slides: { color: '#3b82f6', icon: <BookOpen size={18} />, action: '↓ Download' },
    link: { color: '#10b981', icon: <ExternalLink size={18} />, action: '↗ Open' },
    code: { color: '#f59e0b', icon: <FileText size={18} />, action: '↓ Download' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** SVG Radial Progress Ring */
function RadialProgress({ value, size = 120, stroke = 10 }: { value: number; size?: number; stroke?: number }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - Math.min(value, 100) / 100);
    const color = gradeColor(value);
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color, fontWeight: 700
            }}>
                <span style={{ fontSize: '1.4rem' }}>{value}%</span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>{gradeLetter(value)}</span>
            </div>
        </div>
    );
}

/** Status Tag Badge */
function StatusTag({ status }: { status: string }) {
    const meta = STATUS_META[status] ?? STATUS_META.upcoming;
    return (
        <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
            color: meta.color, background: meta.bg, border: `1px solid ${meta.color}33`,
            letterSpacing: '0.03em', whiteSpace: 'nowrap'
        }}>
            {status === 'active' ? '● ' : ''}{meta.label}
        </span>
    );
}

/** Thin horizontal progress bar */
function MiniBar({ pct }: { pct: number }) {
    return (
        <div style={{ height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginTop: '6px' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: '99px', background: gradeColor(pct), transition: 'width 0.8s ease' }} />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TAB_CONFIG: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={15} /> },
    { id: 'exams', label: 'Exams', icon: <BookMarked size={15} /> },
    { id: 'grades', label: 'Grades', icon: <Trophy size={15} /> },
    { id: 'materials', label: 'Materials', icon: <BookOpen size={15} /> },
];

export default function StudentCourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const initialTab = (location.state?.activeTab as TabId) || 'overview';
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);
    const [tabKey, setTabKey] = useState(0); // for animation re-trigger

    const [course, setCourse] = useState<CourseData | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    // localStorage-backed viewed set
    const storageKey = `course_materials_viewed_${id}`;
    const [viewed, setViewed] = useState<Set<number>>(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            return raw ? new Set<number>(JSON.parse(raw) as number[]) : new Set<number>();
        } catch { return new Set<number>(); }
    });

    const toggleViewed = useCallback((matId: number) => {
        setViewed(prev => {
            const next = new Set(prev);
            next.has(matId) ? next.delete(matId) : next.add(matId);
            localStorage.setItem(storageKey, JSON.stringify([...next]));
            return next;
        });
    }, [storageKey]);

    const switchTab = (tab: TabId) => {
        setActiveTab(tab);
        setTabKey(k => k + 1); // reset animation
    };

    useEffect(() => {
        if (!id) return;
        Promise.all([courseService.getCourseDetails(id), courseService.getMaterials(id)])
            .then(([courseData, matData]) => {
                setCourse(courseData as CourseData);
                setMaterials(matData as Material[]);
            })
            .catch(err => console.error('Failed to fetch course details', err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)', gap: '0.75rem' }}>
            <Clock size={18} /> Loading course…
        </div>
    );
    if (!course) return (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' }}>Course not found.</div>
    );

    // ── Derived data ──────────────────────────────────────────────────────────
    const allExams = course.exams ?? [];
    const pastResults = allExams
        .filter(e => e.user_status === 'submitted')
        .map(e => ({
            id: e.id, title: e.title,
            score: e.user_score ?? 0, total: e.total_marks || 100,
            date: e.start_time ? new Date(e.start_time).toLocaleDateString() : 'Always Available'
        }));

    const earnedPts = pastResults.reduce((s, r) => s + r.score, 0);
    const totalPts = pastResults.reduce((s, r) => s + r.total, 0);
    const overallPct = totalPts > 0 ? Math.round((earnedPts / totalPts) * 100) : 0;
    const avgGrade = course.performance?.grade ?? overallPct;

    const groupedExams = allExams.reduce<Record<string, ExamItem[]>>((acc, exam) => {
        const month = exam.start_time ? new Date(exam.start_time).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Always Available';
        (acc[month] ??= []).push(exam);
        return acc;
    }, {});

    const groupedMaterials = materials.reduce<Record<number, Material[]>>((acc, mat) => {
        const wk = mat.week ?? 0;
        (acc[wk] ??= []).push(mat);
        return acc;
    }, {});

    const tabCounts: Record<TabId, number | null> = {
        overview: null,
        exams: allExams.length,
        grades: pastResults.length,
        materials: materials.length,
    };

    // ── Animation style ───────────────────────────────────────────────────────
    const panelStyle: React.CSSProperties = {
        animation: 'cdFadeSlide 0.28s ease both',
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* Keyframes */}
            <style>{`
                @keyframes cdFadeSlide {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cd-tab-btn { transition: color 0.18s, border-color 0.18s, background 0.18s; }
                .cd-tab-btn:hover { color: white !important; }
                .cd-viewed-btn { transition: opacity 0.18s, transform 0.18s; }
                .cd-viewed-btn:hover { transform: scale(1.12); }
            `}</style>

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button className="btn-icon"
                    onClick={() => navigate('/student/courses')}
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', flexShrink: 0 }}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {course.code}
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                        {course.name}
                    </h1>
                </div>
            </div>

            {/* ── Sticky Course Info Bar ───────────────────────────────────── */}
            <div className="glass-card" style={{
                padding: '1rem 1.5rem', marginBottom: '1.5rem',
                position: 'sticky', top: '0px', zIndex: 20,
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem',
                backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
                {[
                    { icon: <Users size={14} />, label: 'Instructor', value: course.instructor ?? '—' },
                    { icon: <BookOpen size={14} />, label: 'Department', value: course.department ?? '—' },
                    { icon: <TrendingUp size={14} />, label: 'Credits', value: `${course.credits ?? '—'} Credits` },
                    { icon: <Calendar size={14} />, label: 'Semester', value: course.semester ?? '—' },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ color: 'var(--primary)', flexShrink: 0 }}>{item.icon}</div>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</div>
                            <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 500 }}>{item.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tab Bar ──────────────────────────────────────────────────── */}
            <div style={{
                display: 'flex', gap: '0.25rem', marginBottom: '1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0'
            }}>
                {TAB_CONFIG.map(tab => {
                    const active = activeTab === tab.id;
                    const count = tabCounts[tab.id];
                    return (
                        <button key={tab.id}
                            className="cd-tab-btn"
                            onClick={() => switchTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.7rem 1.25rem', background: 'transparent', border: 'none',
                                color: active ? 'white' : 'var(--text-muted)',
                                fontWeight: active ? 700 : 400, fontSize: '0.9rem',
                                borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                                cursor: 'pointer', textTransform: 'capitalize',
                                position: 'relative', bottom: '-1px'
                            }}>
                            <span style={{ color: active ? 'var(--primary)' : 'inherit' }}>{tab.icon}</span>
                            {tab.label}
                            {count !== null && (
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px',
                                    borderRadius: '99px', lineHeight: 1.6,
                                    background: active ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                                    color: active ? 'white' : 'var(--text-muted)'
                                }}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* OVERVIEW TAB                                                  */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
                <div key={`ov-${tabKey}`} style={{ ...panelStyle, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* Left column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Description */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ color: 'white', margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600 }}>About This Course</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', margin: 0, fontSize: '0.95rem' }}>
                                {course.description ?? 'No description provided.'}
                            </p>
                        </div>

                        {/* Course Health / Performance */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1.25rem 0', color: 'white', fontSize: '1rem', fontWeight: 600 }}>
                                Course Health
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <RadialProgress value={avgGrade} size={120} stroke={10} />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        { label: 'Average Grade', value: course.performance?.grade ?? overallPct, color: gradeColor(course.performance?.grade ?? overallPct) },
                                        { label: 'Attendance', value: course.performance?.attendance ?? 0, color: '#3b82f6' },
                                        { label: 'Participation', value: course.performance?.participation ?? 0, color: '#8b5cf6' },
                                    ].map(stat => (
                                        <div key={stat.label}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{stat.label}</span>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: stat.color }}>{stat.value}%</span>
                                            </div>
                                            <div style={{ height: '5px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)' }}>
                                                <div style={{ width: `${stat.value}%`, height: '100%', borderRadius: '99px', background: stat.color, transition: 'width 1s ease' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Results */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ color: 'white', margin: 0, fontSize: '1rem', fontWeight: 600 }}>Recent Results</h3>
                                <button style={{ fontSize: '0.82rem', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '3px' }}
                                    onClick={() => switchTab('grades')}>
                                    View All <ChevronRight size={13} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {pastResults.length > 0 ? pastResults.slice(0, 3).map(res => (
                                    <div key={res.id} className="glass-card" style={{ padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 500, color: 'white', fontSize: '0.93rem' }}>{res.title}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{res.date}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: gradeColor(Math.round(res.score / res.total * 100)) }}>
                                                {res.score} / {res.total}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {Math.round(res.score / res.total * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No results yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Materials preview */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ color: 'white', margin: 0, fontSize: '1rem', fontWeight: 600 }}>Course Materials</h3>
                                <button style={{ fontSize: '0.82rem', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '3px' }}
                                    onClick={() => switchTab('materials')}>
                                    View All ({materials.length}) <ChevronRight size={13} />
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                {materials.length > 0 ? materials.slice(0, 4).map(mat => {
                                    const meta = TYPE_META[mat.type] ?? TYPE_META.link;
                                    return (
                                        <div key={mat.id} style={{
                                            padding: '0.9rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                                            display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
                                            border: '1px solid rgba(255,255,255,0.06)'
                                        }}>
                                            <div style={{ padding: '7px', background: `${meta.color}18`, borderRadius: '7px', color: meta.color, flexShrink: 0 }}>
                                                {meta.icon}
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.88rem', color: 'white', fontWeight: 500 }}>{mat.title}</div>
                                                <div style={{ fontSize: '0.73rem', color: meta.color, textTransform: 'uppercase', fontWeight: 600 }}>{mat.type}</div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div style={{ color: 'var(--text-muted)', gridColumn: 'span 2', fontSize: '0.9rem' }}>No materials yet.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
                            <h3 style={{ margin: '0 0 1.25rem 0', color: 'white', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Calendar size={15} style={{ color: 'var(--primary)' }} /> Upcoming Exams
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {allExams.filter(e => getExamStatus(e) === 'upcoming').length > 0
                                    ? allExams.filter(e => getExamStatus(e) === 'upcoming').slice(0, 3).map(exam => (
                                        <div key={exam.id} style={{
                                            padding: '1rem', borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'
                                        }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'white', fontSize: '0.9rem' }}>{exam.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Calendar size={12} /> {exam.start_time ? new Date(exam.start_time).toLocaleDateString() : 'Always Available'}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Clock size={12} /> {exam.duration_minutes} min
                                                </span>
                                            </div>
                                            <button className="btn-primary"
                                                style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', justifyContent: 'center' }}
                                                onClick={() => navigate(`/student/exams/${exam.id}`)}>
                                                View Details
                                            </button>
                                        </div>
                                    ))
                                    : <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming exams.</div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* EXAMS TAB                                                     */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'exams' && (
                <div key={`ex-${tabKey}`} style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {allExams.length === 0 ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <BookMarked size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                            <div>No exams for this course yet.</div>
                        </div>
                    ) : Object.entries(groupedExams).map(([month, exams]) => (
                        <div key={month}>
                            <div style={{
                                fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                marginBottom: '0.75rem', paddingBottom: '0.5rem',
                                borderBottom: '1px solid rgba(255,255,255,0.06)'
                            }}>{month}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {exams.map(exam => {
                                    const status = getExamStatus(exam);
                                    const pct = exam.user_score != null
                                        ? Math.round(exam.user_score / (exam.total_marks || 100) * 100) : null;
                                    return (
                                        <div key={exam.id} className="glass-card" style={{
                                            padding: '1.25rem 1.5rem',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                                            opacity: status === 'completed' && exam.user_status !== 'submitted' ? 0.6 : 1
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 600, color: 'white', fontSize: '1rem' }}>{exam.title}</span>
                                                    <StatusTag status={status} />
                                                </div>
                                                <div style={{ color: 'var(--text-muted)', display: 'flex', gap: '1rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Calendar size={12} /> {exam.start_time ? new Date(exam.start_time).toLocaleDateString() : 'Always Available'}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={12} /> {exam.duration_minutes} min</span>
                                                    <span>{exam.total_questions} Questions</span>
                                                </div>
                                                {status === 'submitted' && pct !== null && (
                                                    <MiniBar pct={pct} />
                                                )}
                                            </div>
                                            <div style={{ flexShrink: 0 }}>
                                                {status === 'submitted' ? (
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: gradeColor(pct ?? 0) }}>
                                                            {exam.user_score} / {exam.total_marks || 100}
                                                        </div>
                                                        <button style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                                                            onClick={() => navigate(`/student/exams/${exam.id}/result`)}>
                                                            View Result →
                                                        </button>
                                                    </div>
                                                ) : status === 'active' ? (
                                                    <button className="btn-primary"
                                                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem', justifyContent: 'center' }}
                                                        onClick={() => navigate(`/student/exams/${exam.id}`)}>
                                                        Start Now →
                                                    </button>
                                                ) : status === 'upcoming' ? (
                                                    <button disabled style={{
                                                        padding: '0.5rem 1.25rem', fontSize: '0.85rem',
                                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'var(--text-muted)', borderRadius: '8px', cursor: 'not-allowed',
                                                        display: 'flex', alignItems: 'center', gap: '5px'
                                                    }}>
                                                        <Lock size={13} /> Locked
                                                    </button>
                                                ) : (
                                                    <button style={{
                                                        padding: '0.5rem 1.25rem', fontSize: '0.85rem',
                                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                                        color: 'var(--text-muted)', borderRadius: '8px', cursor: 'default'
                                                    }}>
                                                        Missed
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* GRADES TAB                                                    */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'grades' && (
                <div key={`gr-${tabKey}`} style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Summary Dashboard Card */}
                    <div className="glass-card" style={{
                        padding: '1.5rem 2rem',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
                        border: '1px solid rgba(99,102,241,0.2)'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                    Total Points Earned
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white' }}>{earnedPts}</span>
                                    <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>/ {totalPts}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ flex: 1, height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)' }}>
                                        <div style={{ width: `${overallPct}%`, height: '100%', borderRadius: '99px', background: `linear-gradient(to right, var(--primary), #8b5cf6)`, transition: 'width 1s ease' }} />
                                    </div>
                                    <span style={{ fontWeight: 700, color: gradeColor(overallPct), fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{overallPct}%</span>
                                </div>
                                {totalPts === 0 && (
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>No graded exams yet.</div>
                                )}
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: gradeColor(overallPct), lineHeight: 1 }}>{gradeLetter(overallPct)}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grade</div>
                            </div>
                        </div>
                    </div>

                    {/* Individual grade rows */}
                    {pastResults.length > 0 ? pastResults.map(res => {
                        const pct = Math.round(res.score / res.total * 100);
                        return (
                            <div key={res.id} className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.6rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'white', fontSize: '0.97rem', marginBottom: '2px' }}>{res.title}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Submitted on {res.date}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: gradeColor(pct) }}>{res.score} / {res.total}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '2px' }}>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pct}%</span>
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', borderRadius: '99px',
                                                color: gradeColor(pct), background: `${gradeColor(pct)}18`,
                                                border: `1px solid ${gradeColor(pct)}33`
                                            }}>{gradeLetter(pct)}</span>
                                        </div>
                                    </div>
                                </div>
                                <MiniBar pct={pct} />
                            </div>
                        );
                    }) : (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Trophy size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                            <div>No grades available yet.</div>
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* MATERIALS TAB                                                 */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'materials' && (
                <div key={`mat-${tabKey}`} style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {materials.length === 0 ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <BookOpen size={32} style={{ opacity: 0.3, marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
                            <h3 style={{ margin: '0 0 0.5rem' }}>No materials yet.</h3>
                            <p style={{ margin: 0 }}>Materials will appear here once uploaded by the instructor.</p>
                        </div>
                    ) : Object.entries(groupedMaterials).sort(([a], [b]) => Number(a) - Number(b)).map(([week, mats]) => (
                        <div key={week}>
                            <div style={{
                                fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                marginBottom: '0.75rem', paddingBottom: '0.5rem',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <span>{Number(week) > 0 ? `Week ${week}` : 'General'}</span>
                                <span style={{ fontWeight: 400 }}>{(mats as Material[]).filter(m => viewed.has(m.id)).length} / {(mats as Material[]).length} viewed</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {(mats as Material[]).map(mat => {
                                    const meta = TYPE_META[mat.type] ?? TYPE_META.link;
                                    const isViewed = viewed.has(mat.id);
                                    return (
                                        <div key={mat.id} className="glass-card" style={{
                                            padding: '0.9rem 1.1rem',
                                            display: 'flex', alignItems: 'center', gap: '0.9rem',
                                            opacity: isViewed ? 0.65 : 1,
                                            transition: 'opacity 0.25s',
                                            border: isViewed ? '1px solid rgba(52,211,153,0.15)' : undefined
                                        }}>
                                            {/* Type icon */}
                                            <div style={{
                                                width: '40px', height: '40px', flexShrink: 0, borderRadius: '9px',
                                                background: `${meta.color}18`, border: `1px solid ${meta.color}33`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: meta.color, position: 'relative'
                                            }}>
                                                {meta.icon}
                                                {isViewed && (
                                                    <div style={{
                                                        position: 'absolute', bottom: '-4px', right: '-4px',
                                                        background: '#10b981', borderRadius: '50%', width: '14px', height: '14px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <CheckCircle2 size={10} color="white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1px' }}>
                                                    <span style={{ fontWeight: 600, color: 'white', fontSize: '0.92rem' }}>{mat.title}</span>
                                                    {/* Inline action link */}
                                                    <a href={mat.url || '#'} target="_blank" rel="noopener noreferrer"
                                                        style={{
                                                            fontSize: '0.75rem', color: meta.color, fontWeight: 600,
                                                            textDecoration: 'none', padding: '1px 8px',
                                                            background: `${meta.color}15`, borderRadius: '6px',
                                                            border: `1px solid ${meta.color}30`, whiteSpace: 'nowrap'
                                                        }}>
                                                        {meta.action}
                                                    </a>
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{mat.description}</div>
                                                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.73rem' }}>
                                                    <span style={{ color: meta.color, textTransform: 'uppercase', fontWeight: 600 }}>{mat.type}</span>
                                                    {mat.file_size && <span style={{ color: 'var(--text-muted)' }}>{mat.file_size}</span>}
                                                    {mat.duration && <span style={{ color: 'var(--text-muted)' }}>⏱ {mat.duration}</span>}
                                                </div>
                                            </div>

                                            {/* Viewed Toggle */}
                                            <button className="cd-viewed-btn"
                                                onClick={() => toggleViewed(mat.id)}
                                                title={isViewed ? 'Mark as unviewed' : 'Mark as viewed'}
                                                style={{
                                                    flexShrink: 0, background: 'transparent', border: 'none',
                                                    cursor: 'pointer', color: isViewed ? '#10b981' : 'rgba(255,255,255,0.2)',
                                                    padding: '4px', borderRadius: '6px'
                                                }}>
                                                {isViewed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
