// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BackupList } from '@/components/fragments/BackupList';
import { AboutContent } from '@/components/fragments/AboutContent';
import { ProfileView } from '@/components/fragments/ProfileView';
import { Card } from '@/components/elements/Card';
import ArchiveView from '@/components/fragments/ArchiveView';
import { UserManagement } from '@/components/fragments/UserManagement';
import { SharingView } from '@/components/fragments/SharingView';
// Impor helper
import { getApiUrl } from '@/utils/apiConfig';

interface UserProfile { 
    id: number;
    name: string; 
    email: string; 
}

type ActiveView = 'dashboard' | 'archive' | 'backup' | 'about' | 'profile' | 'users' | 'sharing';

export default function DashboardPage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<ActiveView>('archive');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchProfile = async () => {
            // Gunakan getApiUrl
            const apiUrl = getApiUrl();
            
            try {
                const res = await fetch(`${apiUrl}/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Gagal mengambil data profil');
                const data: UserProfile = await res.json();
                setUser(data);
            } catch (error) {
                console.error(error);
                localStorage.removeItem('token');
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const isAdmin = user?.id === 1;

    const renderContent = () => {
        switch (activeView) {
            case 'archive': return <ArchiveView />;
            case 'backup': return <BackupList />;
            case 'profile': return <ProfileView />;
            case 'about': return <AboutContent />;
            case 'sharing': return <SharingView />;
            case 'users': 
                return isAdmin ? <UserManagement /> : <Card><p>Akses Ditolak</p></Card>;
            default:
                return (
                    <Card>
                        <h2 className="text-2xl font-bold text-gray-900">Selamat Datang, {user?.name || 'Pengguna'}!</h2>
                        <p className="mt-2 text-gray-600">Ini adalah halaman dasbor utama Anda.</p>
                        <p className="mt-1 text-gray-600">Email Anda terdaftar sebagai: {user?.email}</p>
                        {isAdmin && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="font-semibold text-yellow-800">Status Admin Aktif</p>
                                <p className="text-sm text-yellow-700">Anda memiliki akses ke menu Manajemen User.</p>
                            </div>
                        )}
                    </Card>
                );
        }
    };

    const getNavClass = (viewName: ActiveView) => 
        `px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
            activeView === viewName
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-200'
        }`;

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><p>Memuat...</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-6">
                             <h1 className="text-xl font-bold text-indigo-600">RSpace</h1>
                             <div className="flex items-center space-x-2 overflow-x-auto">
                                <a onClick={() => setActiveView('dashboard')} className={getNavClass('dashboard')}>Dasbor</a>
                                <a onClick={() => setActiveView('archive')} className={getNavClass('archive')}>Arsip</a>
                                <a onClick={() => setActiveView('sharing')} className={getNavClass('sharing')}>Sharing</a>
                                <a onClick={() => setActiveView('backup')} className={getNavClass('backup')}>Cadangan</a>
                                <a onClick={() => setActiveView('profile')} className={getNavClass('profile')}>Profil</a>
                                
                                {isAdmin && (
                                    <a onClick={() => setActiveView('users')} className={getNavClass('users')}>
                                        Manajemen User
                                    </a>
                                )}
                                
                                <a onClick={() => setActiveView('about')} className={getNavClass('about')}>Tentang</a>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="py-10">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}