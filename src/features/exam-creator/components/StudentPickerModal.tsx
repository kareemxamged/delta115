import { useState, useEffect } from 'react';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '../../../services/supabase';
import styles from '../ExamCreator.module.css';

interface Student {
    id: string;
    full_name: string;
    student_id: string;
    level: string | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    levelFilter: string | null | undefined;
    selectedStudentIds: string[];
    onApplySelection: (ids: string[]) => void;
}

export function StudentPickerModal({ isOpen, onClose, levelFilter, selectedStudentIds, onApplySelection }: Props) {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelected, setTempSelected] = useState<Set<string>>(new Set(selectedStudentIds));

    useEffect(() => {
        if (isOpen) {
            setTempSelected(new Set(selectedStudentIds));
            fetchStudents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, levelFilter, selectedStudentIds]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            let query = supabase.from('profiles').select('id, full_name, student_id, level').eq('role', 'student');

            if (levelFilter && levelFilter !== 'all') {
                query = query.eq('level', levelFilter);
            }

            const { data, error } = await query.order('full_name', { ascending: true }).limit(50);
            if (error) throw error;
            setStudents(data || []);
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id: string) => {
        const next = new Set(tempSelected);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setTempSelected(next);
    };

    const handleApply = () => {
        onApplySelection(Array.from(tempSelected));
        onClose();
    };

    const filteredStudents = students.filter(s => {
        const sterm = searchTerm.toLowerCase();
        return (s.full_name?.toLowerCase().includes(sterm) || s.student_id?.toLowerCase().includes(sterm));
    });

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
            <div style={{ background: '#1e293b', width: '100%', maxWidth: '500px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>

                {/* Header */}
                <div style={{ padding: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>Select Specific Students</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Subheader / Search */}
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                    {levelFilter && levelFilter !== 'all' ? (
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#818cf8', fontWeight: 500 }}>
                            Only showing students in level: {levelFilter}
                        </p>
                    ) : (
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Showing all registered students
                        </p>
                    )}

                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search by name or Academic ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                        />
                    </div>
                </div>

                {/* List */}
                <div style={{ padding: '0', flex: 1, overflowY: 'auto', minHeight: '300px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                            <Loader2 size={24} className={styles.spin} />
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No students found matching your search.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => handleToggle(student.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        cursor: 'pointer', transition: 'background 0.2s',
                                        background: tempSelected.has(student.id) ? 'rgba(129, 140, 248, 0.1)' : 'transparent'
                                    }}
                                >
                                    <div>
                                        <div style={{ color: 'white', fontWeight: 500 }}>{student.full_name || 'Unknown User'}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                                            ID: {student.student_id || 'N/A'} • {student.level || 'No Level'}
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '22px', height: '22px', borderRadius: '6px',
                                        border: tempSelected.has(student.id) ? 'none' : '2px solid rgba(255,255,255,0.2)',
                                        background: tempSelected.has(student.id) ? '#818cf8' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {tempSelected.has(student.id) && <Check size={14} color="white" strokeWidth={3} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <span style={{ color: '#818cf8', fontSize: '0.9rem', fontWeight: 500 }}>
                        {tempSelected.size} selected
                    </span>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button onClick={onClose} style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button onClick={handleApply} style={{ padding: '0.6rem 1.2rem', background: '#818cf8', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            Apply Selection
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default StudentPickerModal;
