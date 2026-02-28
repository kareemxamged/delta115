import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService, EnrolledCourse } from '../../services/courseService';
import { Loader2, FileText, BarChart2, Library, BookOpen } from 'lucide-react';

const Icons = {
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
    Filter: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>,
    Book: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    Clock: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Chart: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    Users: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
};

export default function StudentCourses() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSemester, setFilterSemester] = useState('all');
    const [filterDept, setFilterDept] = useState('all');
    const [activeTab, setActiveTab] = useState<'current' | 'past' | 'all'>('current');
    const [courses, setCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getEnrolledCourses();
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase());

        // Improve Tab Logic: 'current' includes 'enrolled', 'past' includes 'completed'
        // For now, assume all 'enrolled' are current.
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'current' && course.enrollment_status === 'enrolled') ||
            (activeTab === 'past' && course.enrollment_status === 'completed');

        const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;
        const matchesDept = filterDept === 'all' || course.department === filterDept;

        return matchesSearch && matchesTab && matchesSemester && matchesDept;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'white' }}>
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Icons.Book /> My Courses
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your enrolled courses and view details.</p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icons.Plus /> Register New Course
                </button>
            </div>

            {/* Filters Bar */}
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                        <Icons.Search />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a course..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem 1rem 0.75rem 3rem',
                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px', color: 'white'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={filterSemester}
                        onChange={(e) => setFilterSemester(e.target.value)}
                        style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                    >
                        <option value="all">All Semesters</option>
                        <option value="Fall 2024">Fall 2024</option>
                        <option value="Spring 2024">Spring 2024</option>
                    </select>

                    <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                    >
                        <option value="all">All Departments</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Systems">Information Systems</option>
                    </select>
                </div>
            </div>

            {/* Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>

                {/* Main Content */}
                <div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        {['current', 'past', 'all'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                style={{
                                    background: 'transparent', border: 'none',
                                    padding: '0.5rem 1rem',
                                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                                    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                    cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize'
                                }}
                            >
                                {tab} Courses ({courses.filter(c => {
                                    if (tab === 'all') return true;
                                    if (tab === 'current') return c.enrollment_status === 'enrolled';
                                    if (tab === 'past') return c.enrollment_status === 'completed';
                                    return false;
                                }).length})
                            </button>
                        ))}
                    </div>

                    {/* Course Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {filteredCourses.map(course => (
                            <div key={course.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            width: '50px', height: '50px', borderRadius: '8px',
                                            background: 'rgba(59, 130, 246, 0.1)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem'
                                        }}>
                                            <BookOpen size={24} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{course.name}</h3>
                                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {course.code} | {course.instructor}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => navigate(`/student/courses/${course.id}`)}
                                        style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                                    >
                                        View Details →
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    {/* Info Column */}
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <h4 style={{ color: 'white', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Icons.Chart /> Course Info
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <span>• Credits: {course.credits}</span>
                                            <span>• Semester: {course.semester}</span>
                                            <span>• Dept: {course.department}</span>
                                            {/* Students count not in DB yet, mock or fetch */}
                                            <span>• Students: --</span>
                                        </div>
                                    </div>

                                    {/* Performance Column */}
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <h4 style={{ color: 'white', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Icons.Chart /> My Performance
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <span>• Exams: {course.exams_taken}/{course.total_exams}</span>
                                            <span>• Average: <span style={{ color: '#10b981' }}>{course.average_score}%</span></span>
                                            {/* Last Exam logic can be refined */}
                                        </div>
                                    </div>

                                    {/* Upcoming Column */}
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <h4 style={{ color: 'white', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Icons.Calendar /> Upcoming
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {course.upcoming_exams.length > 0 ? (
                                                course.upcoming_exams.map((event, idx) => (
                                                    <span key={idx}>• {event.title} - <span style={{ color: 'var(--primary)' }}>{event.date}</span></span>
                                                ))
                                            ) : (
                                                <span>No upcoming exams</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <button
                                        className="btn-secondary"
                                        style={{ padding: '0.6rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'exams' } })}
                                    >
                                        <FileText size={16} /> Exams
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        style={{ padding: '0.6rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'grades' } })}
                                    >
                                        <BarChart2 size={16} /> Grades
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        style={{ padding: '0.6rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'materials' } })}
                                    >
                                        <Library size={16} /> Materials
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>General Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>GPA</span>
                                <span style={{ fontWeight: 'bold', color: '#10b981' }}>3.45 / 4.00</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Credits Earned</span>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>87</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Credits Remaining</span>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>45</span>
                            </div>

                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Completion</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>66%</span>
                                </div>
                                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                    <div style={{ height: '100%', width: '66%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
