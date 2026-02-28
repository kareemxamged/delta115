import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { courseService } from '../../services/courseService';

const Icons = {
    Back: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>,
    Mail: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
    Clock: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
    File: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
};

export default function StudentCourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const initialTab = location.state?.activeTab || 'overview';
    const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'grades' | 'materials'>(initialTab);

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const data = await courseService.getCourseDetails(id);
                setCourse(data);
            } catch (error) {
                console.error("Failed to fetch course details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'white' }}>
                <Icons.Clock /> <span style={{ marginLeft: '10px' }}>Loading Course...</span>
            </div>
        );
    }

    if (!course) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Course not found</div>;
    }

    const pendingExams = course.exams ? course.exams.filter((e: any) => e.user_status !== 'submitted' && new Date(e.start_time) > new Date()) : [];
    const pastResults = course.exams ? course.exams
        .filter((e: any) => e.user_status === 'submitted')
        .map((e: any) => ({
            id: e.id,
            title: e.title,
            score: e.user_score,
            total: e.total_marks || 100,
            date: e.submitted_at ? new Date(e.submitted_at).toLocaleDateString() : 'Unknown date'
        })) : [];

    const materials: any[] = []; // Placeholder for now

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className="btn-icon"
                    onClick={() => navigate('/student/courses')}
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                >
                    <Icons.Back />
                </button>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'white' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{course.code} |</span> {course.name}
                </h1>
            </div>

            {/* Course Info */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>Instructor</span>
                        <div style={{ fontWeight: '500', marginTop: '4px', color: 'white' }}>{course.instructor}</div>
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>Department</span>
                        <div style={{ fontWeight: '500', marginTop: '4px', color: 'white' }}>{course.department}</div>
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>Credits / Semester</span>
                        <div style={{ fontWeight: '500', marginTop: '4px', color: 'white' }}>{course.credits} Credits • {course.semester}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['overview', 'exams', 'grades', 'materials'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        style={{
                            background: 'transparent', border: 'none',
                            padding: '1rem 1.5rem',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === tab ? 'bold' : 'normal',
                            borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                            cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                            fontSize: '1rem'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Description */}
                        <div>
                            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Description</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{course.description}</p>
                        </div>

                        {/* Performance */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', color: 'white' }}>My Performance</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{course.performance?.grade || 0}%</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Average Grade</div>
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{course.performance?.attendance || 0}%</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Attendance</div>
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{course.performance?.participation || 0}%</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Participation</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Results */}
                        <div>
                            <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Recent Results
                                <button
                                    style={{ fontSize: '0.85rem', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                                    onClick={() => setActiveTab('grades')}
                                >
                                    View All
                                </button>
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {pastResults.map((res: any, idx: number) => (
                                    <div key={idx} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '500', color: 'white' }}>{res.title}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{res.date}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: '#10b981' }}>{res.score}%</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{res.score}/{res.total}</div>
                                        </div>
                                    </div>
                                ))}
                                {pastResults.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No recent results.</div>}
                            </div>
                        </div>

                        {/* Materials Preview */}
                        <div>
                            <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Course Materials
                                <button
                                    style={{ fontSize: '0.85rem', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                                    onClick={() => setActiveTab('materials')}
                                >
                                    View All ({materials.length})
                                </button>
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {materials.length > 0 ? materials.slice(0, 4).map((mat: any, idx: number) => (
                                    <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                        <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', color: 'var(--primary)' }}>
                                            <Icons.File />
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem', color: 'white' }}>{mat.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mat.type} File</div>
                                        </div>
                                    </div>
                                )) : <div style={{ color: 'var(--text-muted)', gridColumn: 'span 2' }}>No materials yet.</div>}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar: Upcoming Exams */}
                    <div>
                        <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Icons.Calendar /> Upcoming
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {pendingExams.length > 0 ? pendingExams.map((exam: any) => (
                                    <div key={exam.id} style={{
                                        padding: '1rem', borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>{exam.title}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                                            <Icons.Calendar /> {new Date(exam.start_time).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <Icons.Clock /> {exam.duration_minutes || 60} min • {exam.total_questions || '?'} Qs
                                        </div>
                                        <button
                                            className="btn-primary"
                                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
                                            onClick={() => navigate(`/student/exams/${exam.id}`)}
                                        >
                                            Start Now
                                        </button>
                                    </div>
                                )) : <div style={{ color: 'var(--text-muted)' }}>No upcoming exams.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Exams Tab */}
            {activeTab === 'exams' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {course.exams && course.exams.length > 0 ? course.exams.map((exam: any) => (
                        <div key={exam.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>{exam.title}</div>
                                <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                                    <span><Icons.Calendar /> {new Date(exam.start_time).toLocaleDateString()}</span>
                                    <span><Icons.Clock /> {exam.duration_minutes} min</span>
                                    <span>{exam.total_questions} Questions</span>
                                </div>
                            </div>
                            <div>
                                {exam.user_status === 'submitted' ? (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#10b981', fontWeight: 'bold' }}>Completed</div>
                                        <div style={{ color: 'white' }}>Score: {exam.user_score}/{exam.total_marks || 100}</div>
                                    </div>
                                ) : (
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate(`/student/exams/${exam.id}`)}
                                        style={{ padding: '0.5rem 1.5rem' }}
                                    >
                                        Start
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }} className="glass-card">No exams found for this course.</div>}
                </div>
            )}

            {/* Grades Tab */}
            {activeTab === 'grades' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {pastResults.length > 0 ? pastResults.map((res: any) => (
                        <div key={res.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>{res.title}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Submitted on {res.date}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Score</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{res.score} / {res.total}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Percentage</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>{Math.round((res.score / res.total) * 100)}%</div>
                                </div>
                            </div>
                        </div>
                    )) : <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }} className="glass-card">No grades available yet.</div>}
                </div>
            )}

            {/* Materials Tab - Still empty but consistent UI */}
            {activeTab === 'materials' && (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ marginBottom: '1rem', opacity: 0.5 }}><Icons.File /></div>
                    <h3>No materials available yet.</h3>
                    <p>Course materials will appear here once uploaded by the instructor.</p>
                </div>
            )}

        </div>
    );
}
