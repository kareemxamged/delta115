import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import {
    User, Mail, Phone, Calendar, Shield, Settings, BarChart2,
    Edit2, Save, LogOut, Globe, Bell, Moon, Award, Clock,
    BookOpen, CheckCircle, Camera, ChevronRight, Lock, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './StudentProfile.module.css';

type Tab = 'info' | 'security' | 'preferences' | 'stats';

export default function StudentProfile() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        full_name: '',
        student_id: '',
        major: '',
        level: '',
        mobile: '+20 123 456 7890', // Mock data
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) throw error;

            setProfileData(data);
            setFormData({
                full_name: data.full_name || '',
                student_id: data.student_id || '',
                major: data.major || '',
                level: data.level ? String(data.level) : '', // Ensure it's a string for the Select input
                mobile: '+20 123 456 7890'
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // 1. Update Public Profile Table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    student_id: formData.student_id,
                    major: formData.major,
                    level: formData.level,
                })
                .eq('id', user?.id);

            if (profileError) throw profileError;

            // 2. Update Auth Metadata (Essential for keeping session data in sync)
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.full_name,
                    student_id: formData.student_id,
                    major: formData.major,
                    level: formData.level,
                }
            });

            if (authError) {
                console.warn('Metadata update failed (non-critical):', authError);
            }

            toast.success('Profile updated successfully');
            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.headerCard}>
                <div className={styles.avatarWrapper}>
                    <div className={styles.avatarContainer}>
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className={styles.avatarImage} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#334155', color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}>
                                {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
                            </div>
                        )}
                        <div className={styles.avatarOverlay}>
                            <Camera size={24} color="white" />
                            <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 'bold', marginTop: '4px', textTransform: 'uppercase' }}>Change</span>
                        </div>
                    </div>
                    <div className={styles.onlineBadge} title="Online" />
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.userNameRow}>
                        <h1 className={styles.userName}>{profileData?.full_name || 'Student Name'}</h1>
                        <span className={styles.roleBadge}>
                            <Shield size={12} /> Student
                        </span>
                    </div>

                    <div className={styles.userMeta}>
                        <div className={styles.metaItem}>
                            <Mail size={16} className={styles.metaIcon} />
                            {user?.email}
                        </div>
                        <div className={styles.metaItem}>
                            <Phone size={16} className={styles.metaIcon} />
                            {formData.mobile}
                        </div>
                        <div className={styles.metaItem}>
                            <Calendar size={16} className={styles.metaIcon} />
                            Joined {formatDate(user?.created_at || null)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabsContainer}>
                {[
                    { id: 'info', label: 'Personal Info', icon: User },
                    { id: 'security', label: 'Security', icon: Shield },
                    { id: 'preferences', label: 'Preferences', icon: Settings },
                    { id: 'stats', label: 'Statistics', icon: BarChart2 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className={styles.contentWrapper}>

                {/* 1. Information Tab */}
                {activeTab === 'info' && (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h3 className={styles.cardTitle}>Personal Information</h3>
                                <p className={styles.cardSubtitle}>Manage your personal details and public profile.</p>
                            </div>
                            <button
                                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                                className={`${styles.actionBtn} ${isEditing ? styles.primaryBtn : ''}`}
                            >
                                {isEditing ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Save size={16} /> Save Changes
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Edit2 size={16} /> Edit Profile
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    <User size={14} /> Full Name
                                </label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className={`${styles.input} ${!isEditing ? styles.inputDisabled : ''}`}
                                        disabled={!isEditing}
                                        placeholder="Enter your full name"
                                    />
                                    {!isEditing && <Lock size={14} className={styles.lockIcon} />}
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    <Shield size={14} /> Student ID
                                </label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        value={formData.student_id}
                                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                        className={`${styles.input} ${!isEditing ? styles.inputDisabled : ''}`}
                                        disabled={!isEditing}
                                        placeholder="Enter your student ID"
                                    />
                                    {!isEditing && <Lock size={14} className={styles.lockIcon} />}
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    <BookOpen size={14} /> Major
                                </label>
                                <div className={styles.inputWrapper}>
                                    <select
                                        value={formData.major}
                                        onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                        className={`${styles.input} ${!isEditing ? styles.inputDisabled : ''}`}
                                        disabled={!isEditing}
                                        style={{ appearance: 'none' }} // Remove default arrow to keep style clean
                                    >
                                        <option value="">Select Major</option>
                                        <option value="cs">Computer Science</option>
                                        <option value="it">Information Technology</option>
                                    </select>
                                    {!isEditing && <Lock size={14} className={styles.lockIcon} />}
                                    {isEditing && <ChevronRight size={14} className={styles.lockIcon} style={{ transform: 'rotate(90deg)' }} />}
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    <BarChart2 size={14} /> Level
                                </label>
                                <div className={styles.inputWrapper}>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        className={`${styles.input} ${!isEditing ? styles.inputDisabled : ''}`}
                                        disabled={!isEditing}
                                        style={{ appearance: 'none' }}
                                    >
                                        <option value="">Select Level</option>
                                        <option value="1">Level 1</option>
                                        <option value="2">Level 2</option>
                                        <option value="3">Level 3</option>
                                        <option value="4">Level 4</option>
                                    </select>
                                    {!isEditing && <Lock size={14} className={styles.lockIcon} />}
                                    {isEditing && <ChevronRight size={14} className={styles.lockIcon} style={{ transform: 'rotate(90deg)' }} />}
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    <Mail size={14} /> Email Address
                                </label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className={`${styles.input} ${styles.inputDisabled}`}
                                    />
                                    <Lock size={14} className={styles.lockIcon} />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>
                                    <Phone size={14} /> Mobile Number
                                </label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        value={formData.mobile}
                                        disabled
                                        className={`${styles.input} ${styles.inputDisabled}`}
                                    />
                                    <Lock size={14} className={styles.lockIcon} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Security Tab */}
                {activeTab === 'security' && (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h3 className={styles.cardTitle}>Security & Login</h3>
                                <p className={styles.cardSubtitle}>Manage your password and security preferences.</p>
                            </div>
                        </div>

                        <div className={styles.securityGrid}>
                            <div className={styles.securityCard}>
                                <div className={styles.securityContent}>
                                    <div className={`${styles.securityIconBox} ${styles.iconRed}`}>
                                        <Lock size={24} />
                                    </div>
                                    <div className={styles.securityInfo}>
                                        <h4>Login Password</h4>
                                        <p>Last updated 3 months ago</p>
                                    </div>
                                </div>
                                <button className={styles.actionBtn}>Update Password</button>
                            </div>

                            <div className={styles.securityCard}>
                                <div className={styles.securityContent}>
                                    <div className={`${styles.securityIconBox} ${styles.iconBlue}`}>
                                        <Shield size={24} />
                                    </div>
                                    <div className={styles.securityInfo}>
                                        <h4>Two-Factor Authentication</h4>
                                        <p>Add an extra layer of security to your account</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span className={styles.roleBadge} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Disabled</span>
                                    <button className={`${styles.actionBtn} ${styles.primaryBtn}`}>Enable 2FA</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Preferences Tab */}
                {activeTab === 'preferences' && (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h3 className={styles.cardTitle}>Global Preferences</h3>
                                <p className={styles.cardSubtitle}>Customize your viewing experience.</p>
                            </div>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.securityCard} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                                    <div className={styles.securityIconBox} style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'white', margin: 0 }}>Language</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Interface language</p>
                                    </div>
                                </div>
                                <select className={styles.input} style={{ width: '100%' }}>
                                    <option value="en">English (US)</option>
                                    <option value="ar">العربية</option>
                                </select>
                            </div>

                            <div className={styles.securityCard} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                                    <div className={styles.securityIconBox} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                                        <Moon size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'white', margin: 0 }}>Appearance</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Theme customization</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', width: '100%', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <button style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>Dark</button>
                                    <button style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'transparent', color: 'gray', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>Light</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Statistics Tab */}
                {activeTab === 'stats' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className={styles.statsGrid}>
                            {[
                                { label: 'Total Exams', value: '18', sub: '+2 this week', icon: BookOpen, color: '#60a5fa' },
                                { label: 'Average Score', value: '88%', sub: 'Top 5% of class', icon: BarChart2, color: '#34d399' },
                                { label: 'Study Time', value: '42h', sub: 'Last 30 days', icon: Clock, color: '#fb923c' },
                                { label: 'Attendance', value: '96%', sub: 'Excellent', icon: CheckCircle, color: '#a78bfa' },
                            ].map((stat, i) => (
                                <div key={i} className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <div className={styles.statIcon} style={{ background: `${stat.color}20`, color: stat.color }}>
                                            <stat.icon size={22} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px', color: '#94a3b8' }}>{stat.sub}</span>
                                    </div>
                                    <div className={styles.statValue}>{stat.value}</div>
                                    <div className={styles.statLabel}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Recent Achievements</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                {[
                                    { title: "Mathematics Master", desc: "Scored 100% in Advanced Calculus", date: "2 days ago", icon: Award, color: "#eab308" },
                                    { title: "Speedster", desc: "Finished the exam in record time", date: "1 week ago", icon: Clock, color: "#3b82f6" },
                                ].map((badge, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${badge.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: badge.color }}>
                                            <badge.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '1rem' }}>{badge.title}</h4>
                                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>{badge.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
