import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService, EnrolledCourse } from '../../services/courseService';
import { Loader2, FileText, BarChart2, Library, BookOpen, Book, Search, Filter, Users, Calendar, Plus, Info } from 'lucide-react';

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                        <Book size={32} color="var(--primary)" /> My Courses
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Manage your enrolled courses and view details.</p>
                </div>
                <button
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                        border: 'none', color: 'white', padding: '12px 24px',
                        borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                        boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
                        transition: 'all 0.3s'
                    }}
                >
                    <Plus size={20} /> Register New Course
                </button>
            </div>

            {/* Filters Bar */}
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a course..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '0.85rem 1rem 0.85rem 3rem',
                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px', color: 'white', boxSizing: 'border-box', outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flex: '1 1 auto', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 200px' }}>
                        <select
                            value={filterSemester}
                            onChange={(e) => setFilterSemester(e.target.value)}
                            style={{
                                width: '100%', padding: '0.85rem 1rem', paddingRight: '2.5rem',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white', boxSizing: 'border-box', appearance: 'none', outline: 'none', cursor: 'pointer'
                            }}
                        >
                            <option value="all" style={{ background: '#1e293b' }}>All Semesters</option>
                            <option value="Fall 2024" style={{ background: '#1e293b' }}>Fall 2024</option>
                            <option value="Spring 2024" style={{ background: '#1e293b' }}>Spring 2024</option>
                        </select>
                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
                            <Filter size={18} />
                        </div>
                    </div>

                    <div style={{ position: 'relative', flex: '1 1 200px' }}>
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            style={{
                                width: '100%', padding: '0.85rem 1rem', paddingRight: '2.5rem',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white', boxSizing: 'border-box', appearance: 'none', outline: 'none', cursor: 'pointer'
                            }}
                        >
                            <option value="all" style={{ background: '#1e293b' }}>All Departments</option>
                            <option value="Computer Science" style={{ background: '#1e293b' }}>Computer Science</option>
                            <option value="Information Systems" style={{ background: '#1e293b' }}>Information Systems</option>
                        </select>
                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
                            <Filter size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>

                {/* Main Content */}
                <div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        {['current', 'past', 'all'].map(tab => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    style={{
                                        background: 'transparent', border: 'none',
                                        padding: '0.5rem 1rem',
                                        color: isActive ? 'white' : 'var(--text-muted)',
                                        fontWeight: isActive ? 'bold' : 'normal',
                                        borderBottom: isActive ? '2px solid transparent' : '2px solid transparent',
                                        borderImage: isActive ? 'linear-gradient(to right, #8b5cf6, #6366f1) 1' : 'none',
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
                            );
                        })}
                    </div>

                    {/* Course Grid - Updated to vertical array of specialized compact cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {filteredCourses.map(course => (
                            <div key={course.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                {/* Course Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            width: '56px', height: '56px', borderRadius: '12px',
                                            background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <BookOpen size={28} color="#8b5cf6" />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white', fontWeight: 'bold' }}>{course.name}</h3>
                                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'white' }}>{course.code}</span>
                                                <span>•</span>
                                                <Users size={14} /> {course.instructor}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/student/courses/${course.id}`)}
                                        style={{
                                            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                                            color: 'white', padding: '0.5rem 1.25rem', borderRadius: '8px',
                                            cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                                    >
                                        View Details →
                                    </button>
                                </div>

                                {/* Compact 2-Column Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>

                                    {/* Left Column: Info & Progress */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            <h4 style={{ color: 'white', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                                                <Info size={16} color="var(--primary)" /> Course Info
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Credits:</span> <span style={{ color: 'white' }}>{course.credits}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Semester:</span> <span style={{ color: 'white' }}>{course.semester}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Department:</span> <span style={{ color: 'white' }}>{course.department}</span></div>
                                            </div>
                                        </div>

                                        {/* Progress Bar Injection */}
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Course Progress</span>
                                                <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 'bold' }}>{course.average_score}%</span>
                                            </div>
                                            <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${course.average_score}%`, background: 'linear-gradient(to right, #8b5cf6, #6366f1)', borderRadius: '3px', transition: 'width 1s ease-in-out' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Performance & Upcoming */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            <h4 style={{ color: 'white', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                                                <BarChart2 size={16} color="var(--primary)" /> Performance
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Exams Taken:</span> <span style={{ color: 'white' }}>{course.exams_taken} / {course.total_exams}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Average Score:</span> <span style={{ color: '#10b981', fontWeight: 'bold' }}>{course.average_score}%</span></div>
                                            </div>
                                        </div>

                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <h4 style={{ color: 'white', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                <Calendar size={14} color="#f59e0b" /> Upcoming
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {course.upcoming_exams.length > 0 ? (
                                                    course.upcoming_exams.slice(0, 1).map((event, idx) => (
                                                        <span key={idx} style={{ fontSize: '0.85rem' }}>
                                                            {event.title} <br /><span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{event.date}</span>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span style={{ fontSize: '0.85rem' }}>No upcoming exams</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <button
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                                        onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'exams' } })}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    >
                                        <FileText size={16} /> Exams
                                    </button>
                                    <button
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                                        onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'grades' } })}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    >
                                        <BarChart2 size={16} /> Grades
                                    </button>
                                    <button
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                                        onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'materials' } })}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    >
                                        <Library size={16} /> Materials
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Stats (Sticky) */}
                <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1.25rem 0', color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>General Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Cumulative GPA</span>
                                <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>3.45 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 4.0</span></span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Credits Earned</span>
                                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>87</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Credits Remaining</span>
                                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>45</span>
                            </div>

                            <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Degree Progress</span>
                                    <span style={{ fontSize: '0.9rem', color: '#8b5cf6', fontWeight: 'bold' }}>66%</span>
                                </div>
                                <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: '66%', background: 'linear-gradient(to right, #8b5cf6, #6366f1)', borderRadius: '4px', boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
