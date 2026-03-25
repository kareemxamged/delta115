import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, Filter, MoreVertical, Edit,
    Trash2, Copy, BarChart2,
    Clock, Globe, Shield
} from 'lucide-react';
import { examService, Exam } from '../../../services/examService';
import styles from './ManageExams.module.css';
import EditExamModal from './components/EditExamModal';
import SubmissionsModal from './components/SubmissionsModal';

export default function ManageExams() {
    const navigate = useNavigate();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Always Available' | 'Active' | 'Upcoming' | 'Expired' | 'Disabled'>('All');

    // Modals
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; examId: number | null; examTitle: string }>({ isOpen: false, examId: null, examTitle: '' });
    const [duplicateModal, setDuplicateModal] = useState<{ isOpen: boolean; examId: number | null; examTitle: string }>({ isOpen: false, examId: null, examTitle: '' });
    const [editModalExamId, setEditModalExamId] = useState<number | null>(null);
    const [submissionsModalExam, setSubmissionsModalExam] = useState<Exam | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    const loadExams = async () => {
        setLoading(true);
        try {
            // Reusing getExams inside examService which gets all exams for the logged in teacher
            const data = await examService.getExams();
            setExams(data);
        } catch (error) {
            console.error('Failed to load exams:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExams();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = () => setOpenDropdownId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleActionClick = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    // --- Computed Status Logic ---
    const getExamDerivedStatus = (exam: Exam): { label: string; color: string; bg: string } => {
        const isPublished = exam.is_published ?? true;
        const now = Date.now();
        const start = exam.start_time ? new Date(exam.start_time).getTime() : null;
        const end = exam.end_time ? new Date(exam.end_time).getTime() : null;

        if (!isPublished) {
            return { label: 'Disabled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
        }
        if (exam.status === 'finished' || (end && end < now)) {
            return { label: 'Expired', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
        }
        if (!start) {
            return { label: 'Always Available', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
        }
        if (start > now) {
            return { label: 'Upcoming', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' };
        }
        return { label: 'Active', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
    };

    // --- Filtered Exams ---
    const filteredExams = useMemo(() => {
        return exams.filter(exam => {
            const matchesSearch =
                (exam.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (exam.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (statusFilter !== 'All') {
                const derivedInfo = getExamDerivedStatus(exam);
                if (derivedInfo.label !== statusFilter) return false;
            }

            return true;
        });
    }, [exams, searchQuery, statusFilter]);

    // --- Handlers ---
    const handleTogglePublish = async (exam: Exam) => {
        const newVal = !(exam.is_published ?? true);
        try {
            await examService.toggleExamPublishStatus(exam.id, newVal);
            setExams(prev => prev.map(e => e.id === exam.id ? { ...e, is_published: newVal } : e));
        } catch (error) {
            console.error('Error toggling publish:', error);
            alert('Failed to update exam status.');
        }
    };

    const handleToggleRandomize = async (exam: Exam) => {
        const newVal = !exam.is_randomized;
        try {
            await examService.toggleExamRandomization(exam.id, newVal);
            setExams(prev => prev.map(e => e.id === exam.id ? { ...e, is_randomized: newVal } : e));
        } catch (error) {
            console.error('Error toggling randomization:', error);
            alert('Failed to update randomization setting.');
        }
    };

    const confirmDuplicate = async () => {
        if (!duplicateModal.examId) return;
        try {
            await examService.duplicateExam(duplicateModal.examId);
            setDuplicateModal({ isOpen: false, examId: null, examTitle: '' });
            loadExams(); // Reload to get fresh list
        } catch (error) {
            console.error('Error duplicating:', error);
            alert('Failed to duplicate exam.');
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.examId) return;
        try {
            await examService.deleteExam(deleteModal.examId);
            setExams(prev => prev.filter(e => e.id !== deleteModal.examId));
            setDeleteModal({ isOpen: false, examId: null, examTitle: '' });
        } catch (error) {
            console.error('Error deleting exam:', error);
            alert('Failed to delete exam. It might have active submissions.');
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Manage Exams</h1>
                    <p className={styles.subtitle}>Control visibility, randomize questions, and manage your assessments.</p>
                </div>
                <button
                    className={`btn-primary ${styles.createBtn}`}
                    onClick={() => navigate('/teacher/create-exam')}
                >
                    <Plus size={18} />
                    Create New Exam
                </button>
            </div>

            {/* Filters Bar */}
            <div className={styles.filtersBar}>
                <div className={styles.searchBox}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search by title or subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.filterSelectWrapper}>
                    <Filter className={styles.filterIcon} size={16} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className={styles.filterSelect}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Always Available">Always Available</option>
                        <option value="Active">Active</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Disabled">Disabled</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.emptyState}>
                        <div className={styles.loader}></div>
                        <p>Loading exams...</p>
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Globe size={48} className={styles.emptyIcon} />
                        <h3>No exams found</h3>
                        <p>Try adjusting your filters or create a new exam.</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Exam Details</th>
                                <th>Schedule</th>
                                <th>Metrics</th>
                                <th>Settings</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExams.map(exam => {
                                const statusInfo = getExamDerivedStatus(exam);
                                const isPub = exam.is_published ?? true;

                                return (
                                    <tr key={exam.id} className={!isPub ? styles.disabledRow : ''}>
                                        <td>
                                            <div className={styles.examPrimaryInfo}>
                                                <div className={styles.examTitle}>{exam.title}</div>
                                                <div className={styles.examSubject}>{exam.subject}</div>
                                                <span
                                                    className={styles.statusBadge}
                                                    style={{ color: statusInfo.color, backgroundColor: statusInfo.bg, borderColor: `${statusInfo.color}30` }}
                                                >
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className={styles.scheduleInfo}>
                                                <div className={styles.timeRow}>
                                                    <Clock size={14} />
                                                    {exam.duration_minutes} mins
                                                </div>
                                                <div className={styles.timeRow}>
                                                    <Globe size={14} />
                                                    {exam.start_time ? new Date(exam.start_time).toLocaleDateString() : 'Evergreen'}
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className={styles.metricsBox}>
                                                <div><span className={styles.metricVal}>{exam.total_questions}</span> Qs</div>
                                                <div className={styles.metricDiv}></div>
                                                <div><span className={styles.metricVal}>{exam.total_marks}</span> Pts</div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className={styles.settingsToggles}>
                                                <div className={styles.toggleRow}>
                                                    <span className={styles.toggleLabel}>Published</span>
                                                    <label className={styles.switch}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isPub}
                                                            disabled={statusInfo.label === 'Expired'}
                                                            onChange={() => handleTogglePublish(exam)}
                                                        />
                                                        <span className={styles.slider} style={statusInfo.label === 'Expired' ? { opacity: 0.5, cursor: 'not-allowed' } : undefined} />
                                                    </label>
                                                </div>
                                                <div className={styles.toggleRow}>
                                                    <span className={styles.toggleLabel}>Shuffle Qs</span>
                                                    <label className={styles.switch}>
                                                        <input
                                                            type="checkbox"
                                                            checked={exam.is_randomized}
                                                            disabled={statusInfo.label === 'Expired'}
                                                            onChange={() => handleToggleRandomize(exam)}
                                                        />
                                                        <span className={styles.slider} style={statusInfo.label === 'Expired' ? { opacity: 0.5, cursor: 'not-allowed' } : undefined} />
                                                    </label>
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ textAlign: 'right', position: 'relative' }}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={(e) => handleActionClick(e, exam.id)}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {openDropdownId === exam.id && (
                                                <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        className={styles.dropdownItem}
                                                        disabled={statusInfo.label !== 'Upcoming'}
                                                        title={statusInfo.label !== 'Upcoming' ? 'Only upcoming exams can be edited.' : ''}
                                                        style={{ opacity: statusInfo.label !== 'Upcoming' ? 0.5 : 1, cursor: statusInfo.label !== 'Upcoming' ? 'not-allowed' : 'pointer' }}
                                                        onClick={() => {
                                                            if (statusInfo.label === 'Upcoming') {
                                                                setEditModalExamId(exam.id);
                                                                setOpenDropdownId(null);
                                                            }
                                                        }}
                                                    >
                                                        <Edit size={14} /> Edit Exam
                                                    </button>
                                                    <button className={styles.dropdownItem} onClick={() => {
                                                        setSubmissionsModalExam(exam);
                                                        setOpenDropdownId(null);
                                                    }}>
                                                        <BarChart2 size={14} /> Submissions
                                                    </button>
                                                    <div className={styles.dropdownDivider} />
                                                    <button className={styles.dropdownItem} onClick={() => {
                                                        setDuplicateModal({ isOpen: true, examId: exam.id, examTitle: exam.title });
                                                        setOpenDropdownId(null);
                                                    }}>
                                                        <Copy size={14} /> Duplicate
                                                    </button>
                                                    <button
                                                        className={`${styles.dropdownItem} ${styles.dangerText}`}
                                                        onClick={() => {
                                                            setDeleteModal({ isOpen: true, examId: exam.id, examTitle: exam.title });
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIconBox}>
                            <Shield size={24} className={styles.dangerText} />
                        </div>
                        <h2 className={styles.modalTitle}>Delete Exam?</h2>
                        <p className={styles.modalDesc}>
                            Are you sure you want to delete <strong>"{deleteModal.examTitle}"</strong>?
                            This action cannot be undone and may remove associated student submissions.
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.modalCancelBtn}
                                onClick={() => setDeleteModal({ isOpen: false, examId: null, examTitle: '' })}
                            >
                                Cancel
                            </button>
                            <button className={styles.modalDeleteBtn} onClick={confirmDelete}>
                                Yes, Delete Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicate Confirmation Modal */}
            {duplicateModal.isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIconBox} style={{ background: 'rgba(96, 165, 250, 0.1)' }}>
                            <Copy size={24} color="#60a5fa" />
                        </div>
                        <h2 className={styles.modalTitle}>Duplicate Exam?</h2>
                        <p className={styles.modalDesc}>
                            Are you sure you want to create a copy of <strong>"{duplicateModal.examTitle}"</strong>?
                            The questions and settings will be cloned as a new "Upcoming" exam.
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.modalCancelBtn}
                                onClick={() => setDuplicateModal({ isOpen: false, examId: null, examTitle: '' })}
                            >
                                Cancel
                            </button>
                            <button className={styles.modalDuplicateBtn} onClick={confirmDuplicate}>
                                Yes, Duplicate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Exam Modal */}
            {editModalExamId && (
                <EditExamModal
                    examId={editModalExamId}
                    onClose={() => setEditModalExamId(null)}
                    onSuccess={loadExams}
                />
            )}

            {/* Submissions Modal */}
            {submissionsModalExam && (
                <SubmissionsModal
                    exam={submissionsModalExam}
                    onClose={() => setSubmissionsModalExam(null)}
                />
            )}
        </div>
    );
}
