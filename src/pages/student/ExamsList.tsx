import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExamsList.module.css';
import { examService, Exam } from '../../services/examService';

// Helper to get icon based on subject name
const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math') || s.includes('calculus') || s.includes('algebra')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="28" height="28">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
            </svg>
        );
    }
    if (s.includes('physics') || s.includes('science') || s.includes('chemistry') || s.includes('biology')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="28" height="28">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        );
    }
    if (s.includes('english') || s.includes('literature') || s.includes('writing') || s.includes('language')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="28" height="28">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
        );
    }
    if (s.includes('computer') || s.includes('code') || s.includes('program') || s.includes('react') || s.includes('java') || s.includes('web')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="28" height="28">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
        );
    }
    if (s.includes('history') || s.includes('geo') || s.includes('social')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="28" height="28">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
        );
    }

    // Default / Academic
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="28" height="28">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.216 50.59 50.59 0 00-2.658.813m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
    );
};

export default function ExamsList() {
    const navigate = useNavigate();
    // --- State ---
    const [exams, setExams] = useState<Exam[]>([]);
    const [, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'finished'>('all');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'ongoing' | 'finished'>('all');

    // --- Fetch Data ---
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const data = await examService.getExams();
                setExams(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    // --- Derived Data (Filtering) ---
    const filteredExams = useMemo(() => {
        return exams.filter(exam => {
            // 1. Tab Filter
            if (activeTab !== 'all' && exam.status !== activeTab) return false;

            // 2. Search Filter
            if (searchTerm && !exam.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            // 3. Subject Filter (Dropdown)
            if (subjectFilter !== 'all' && exam.subject !== subjectFilter) return false;

            // 4. Status Dropdown Filter
            if (statusFilter !== 'all' && exam.status !== statusFilter) return false;

            return true;
        });
    }, [searchTerm, statusFilter, subjectFilter, activeTab, exams]);

    // Unique Subjects for Dropdown
    const subjects = Array.from(new Set(exams.map(e => e.subject)));


    // --- Pagination Logic ---
    const ITEMS_PER_PAGE = 6;
    const [currentPage, setCurrentPage] = useState(1);

    // Minimize Derived Data for Pagination
    const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);

    // Reset page when filters change
    useEffect(() => {
        if (currentPage !== 1) setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredExams]);

    const paginatedExams = filteredExams.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className={styles.container}>
            {/* Header / Title */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Exams Library</h1>
                <p style={{ color: 'var(--text-muted)' }}>Browse and manage your upcoming and past exams.</p>
            </div>

            {/* Controls Section */}
            <div className={styles.controls}>
                {/* Top Row: Search & Dropdowns */}
                <div className={styles.searchBarRow}>
                    <div className={styles.searchInputWrapper}>
                        <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 001.061 1.061z" />
                        </svg>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search exams by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className={styles.filterSelect}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">Check Status (All)</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="finished">Finished</option>
                    </select>

                    <select
                        className={styles.filterSelect}
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                    >
                        <option value="all">All Subjects</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Bottom Row: Tabs */}
                <div className={styles.tabsRow}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'all' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('all')}
                    >All Exams</button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >Upcoming</button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'ongoing' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('ongoing')}
                    >Ongoing</button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'finished' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('finished')}
                    >Finished</button>
                </div>
            </div>

            {/* Grid */}
            <div className={styles.grid}>
                {paginatedExams.length > 0 ? (
                    paginatedExams.map(exam => (
                        <div key={exam.id} className={styles.card}>
                            {/* Card Header */}
                            <div className={styles.cardHeader}>
                                <div
                                    className={styles.cardIcon}
                                    style={{ background: `${exam.subject_color || '#6366f1'}20`, color: exam.subject_color || '#6366f1' }}
                                >
                                    {getSubjectIcon(exam.subject)}
                                </div>
                                <span className={`${styles.statusBadge} ${styles[`status_${exam.status || 'upcoming'}`]}`}>
                                    {(exam.status || 'upcoming').toUpperCase()}
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className={styles.cardBody}>
                                <h3>{exam.title}</h3>
                                <div className={styles.tutorName}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                    {exam.tutor_name}
                                </div>

                                <div className={styles.cardMeta}>
                                    <div className={styles.metaItem}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                        {exam.start_time ? new Date(exam.start_time).toLocaleDateString() : 'Always Available'}
                                    </div>
                                    <div className={styles.metaItem}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {exam.duration_minutes} mins
                                    </div>
                                    <div className={styles.metaItem}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                        </svg>
                                        {exam.total_questions} Qs
                                    </div>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className={styles.cardActions}>
                                {/* Case 1: Exam Submitted/Finished by User */}
                                {exam.submission_status === 'submitted' ? (
                                    <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                        <div style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: exam.score !== undefined && exam.score >= 50 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: exam.score !== undefined && exam.score >= 50 ? '#34d399' : '#f87171',
                                            borderRadius: '8px', fontWeight: 'bold'
                                        }}>
                                            {exam.score ?? '-'}%
                                        </div>
                                        <button className={styles.secondaryBtn} onClick={() => navigate(`/student/exams/${exam.id}/result`)}>Review</button>
                                    </div>
                                ) : (
                                    /* Case 2: Not Submitted (Start/Resume/Details) */
                                    <>
                                        {/* Resume Button if started */}
                                        {exam.submission_status === 'started' && (
                                            <button className={styles.primaryBtn} onClick={() => navigate(`/student/exams/${exam.id}/take`)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                                </svg>
                                                Resume
                                            </button>
                                        )}

                                        {/* Start Button if ongoing and not started */}
                                        {!exam.submission_status && exam.status === 'ongoing' && (
                                            <button className={styles.primaryBtn} onClick={() => navigate(`/student/exams/${exam.id}/take`)}>
                                                Example Start
                                            </button>
                                        )}

                                        {/* Start Soon if upcoming */}
                                        {!exam.submission_status && exam.status === 'upcoming' && (
                                            <button className={styles.primaryBtn} disabled style={{ opacity: 0.6 }}>Start Soon</button>
                                        )}

                                        {/* Handle Standard buttons mapping if needed, but prioritizing submission state above */}
                                        {/* Fallback Details button always visible if not submitted/reviewed? Or always visible? */}
                                        <button
                                            className={styles.secondaryBtn}
                                            onClick={() => navigate(`/student/exams/${exam.id}`)}
                                        >Details</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No exams found matching your criteria.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        className={styles.pageBtn}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Modal Removed - Navigating to details page instead */}
        </div>
    );
}
