import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../services/supabase';
import {
    User, Mail, Phone, Calendar,
    Shield, Settings, Camera, Loader2, Trash2
} from 'lucide-react';
import UserAvatar from '../../../components/UserAvatar';
import { toast } from 'react-hot-toast';
import styles from '../../student/StudentProfile.module.css';
import LoadingSpinner from '../../../components/LoadingSpinner';

// ─── Lazy Tab Components ──────────────────────────────────────────────────────
const TeacherPersonalTab = lazy(() => import('./ProfileTabs/TeacherPersonalTab'));
const TeacherProfessionalTab = lazy(() => import('./ProfileTabs/TeacherProfessionalTab'));
const SecurityTab = lazy(() => import('../../student/ProfileTabs/SecurityTab'));
const PreferencesTab = lazy(() => import('../../student/ProfileTabs/PreferencesTab'));

type Tab = 'info' | 'professional' | 'security' | 'preferences';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'info', label: 'Personal', icon: User },
    { id: 'professional', label: 'Professional', icon: Shield },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
];

export default function TeacherProfile() {
    const { user, updateLocalUser } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [profileData, setProfileData] = useState<any>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatDate = (d: string | null) =>
        d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    useEffect(() => {
        if (!user) return;
        supabase.from('profiles').select('*').eq('id', user.id).single()
            .then(({ data, error }: { data: any; error: any }) => {
                if (error) { toast.error('Failed to load profile'); return; }
                setProfileData(data);
                setAvatarUrl(data?.avatar_url ?? null);
            });
    }, [user]);

    const handleProfileSaved = (saved: Record<string, unknown>) => {
        setProfileData((prev: any) => ({ ...prev, ...saved }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (!file.type.match(/image\/(jpeg|png|webp)/)) {
            toast.error('Only JPEG, PNG, or WEBP images are allowed.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB.');
            return;
        }

        const localUrl = URL.createObjectURL(file);
        setAvatarUrl(localUrl);
        setAvatarUploading(true);

        try {
            const img = new Image();
            img.src = localUrl;
            await new Promise(res => { img.onload = res; });
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            canvas.getContext('2d')!.drawImage(img, 0, 0, 256, 256);
            const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/webp', 0.85));

            const path = `${user.id}/avatar.webp`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(path, blob, { upsert: true, contentType: 'image/webp' });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
            await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

            setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
            updateLocalUser({ avatar_url: publicUrl });
            toast.success('Avatar updated ✓');
        } catch {
            toast.success('Avatar preview updated (storage not configured)');
        } finally {
            setAvatarUploading(false);
            URL.revokeObjectURL(localUrl);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveAvatar = async () => {
        if (!user || !avatarUrl) return;

        try {
            setAvatarUploading(true);
            const path = `${user.id}/avatar.webp`;
            await supabase.storage.from('avatars').remove([path]);
            await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
            await supabase.auth.updateUser({ data: { avatar_url: null } });

            setAvatarUrl(null);
            setProfileData((prev: any) => ({ ...prev, avatar_url: null }));
            updateLocalUser({ avatar_url: undefined });
            toast.success('Avatar removed successfully');
        } catch {
            toast.error('Failed to remove avatar');
        } finally {
            setAvatarUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={styles.container}>
            <input ref={fileInputRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleAvatarChange} />

            <div className={styles.headerCard}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarWrapper}
                        onClick={() => !avatarUploading && fileInputRef.current?.click()}
                        style={{ cursor: avatarUploading ? 'wait' : 'pointer' }}>
                        <div className={styles.avatarContainer}>
                            <UserAvatar
                                url={avatarUrl}
                                name={profileData?.full_name || user?.email}
                                size={132}
                                className={styles.avatarImage}
                                style={{ opacity: avatarUploading ? 0.5 : 1, transition: 'opacity 0.3s' }}
                            />
                            <div className={styles.avatarOverlay}>
                                {avatarUploading ? (
                                    <Loader2 size={22} color="white" className={styles.spin} />
                                ) : (
                                    <Camera size={22} color="white" />
                                )}
                                <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase' }}>
                                    {avatarUploading ? 'Uploading…' : 'Change'}
                                </span>
                            </div>
                        </div>
                        <div className={styles.onlineBadge} title="Online" />
                    </div>

                    {avatarUrl && !avatarUploading && (
                        <button onClick={handleRemoveAvatar} className={styles.removeAvatarBtn}>
                            <Trash2 size={14} />
                            <span>Remove Photo</span>
                        </button>
                    )}
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.userNameRow}>
                        <h1 className={styles.userName}>{profileData?.full_name || 'Teacher Name'}</h1>
                        <span className={styles.roleBadge}><Shield size={12} /> Instructor</span>
                    </div>
                    {profileData?.headline && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1rem', fontWeight: 500 }}>
                            {profileData.headline}
                        </div>
                    )}
                    <div className={styles.userMeta}>
                        <div className={styles.metaItem}><Mail size={15} className={styles.metaIcon} />{user?.email}</div>
                        {profileData?.mobile && (
                            <div className={styles.metaItem}><Phone size={15} className={styles.metaIcon} />{profileData.mobile}</div>
                        )}
                        <div className={styles.metaItem}><Calendar size={15} className={styles.metaIcon} />Joined {formatDate(user?.created_at || null)}</div>
                    </div>
                </div>
            </div>

            <div className={styles.tabsContainer}>
                {TABS.map(tab => (
                    <button key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}>
                        <tab.icon size={17} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.contentWrapper}>
                <Suspense fallback={<LoadingSpinner text="Loading…" />}>
                    {activeTab === 'info' && user && (
                        <TeacherPersonalTab
                            userId={user.id}
                            email={user.email ?? ''}
                            studentId={profileData?.employee_id || profileData?.student_id || ''}
                            initialData={{
                                full_name: profileData?.full_name ?? '',
                                mobile: profileData?.mobile ?? '',
                                date_of_birth: profileData?.date_of_birth ?? '',
                                headline: profileData?.headline ?? '',
                                bio: profileData?.bio ?? ''
                            }}
                            onSaved={handleProfileSaved}
                        />
                    )}
                    {activeTab === 'professional' && user && (
                        <TeacherProfessionalTab
                            userId={user.id}
                            initialData={{
                                employee_id: profileData?.employee_id ?? '',
                                department: profileData?.department ?? '',
                                specialization: profileData?.specialization ?? '',
                                academic_degree: profileData?.academic_degree ?? '',
                                years_of_experience: profileData?.years_of_experience ?? 0
                            }}
                            onSaved={handleProfileSaved}
                        />
                    )}
                    {activeTab === 'security' && <SecurityTab />}
                    {activeTab === 'preferences' && <PreferencesTab />}
                </Suspense>
            </div>
        </div>
    );
}
