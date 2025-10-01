// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArchiveList } from '@/components/fragments/ArchiveList';
import { BackupList } from '@/components/fragments/BackupList';
import { AboutContent } from '@/components/fragments/AboutContent';
import { Card } from '@/components/elements/Card';

interface UserProfile { name: string; email: string; }
type ActiveView = 'dashboard' | 'archive' | 'backup' | 'about';

export default function DashboardPage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<ActiveView>('dashboard');
    const router = useRouter();

    useEffect(() => {
        // ... (logika fetch profil tetap sama) ...
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            try {
                const res = await fetch('/api/profile', {
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

    const renderContent = () => {
        switch (activeView) {
            case 'archive': return <ArchiveList />;
            case 'backup': return <BackupList />;
            case 'about': return <AboutContent />;
            default:
                return (
                    <Card>
                        <h2 className="text-2xl font-bold text-gray-900">Selamat Datang, {user?.name || 'Pengguna'}!</h2>
                        <p className="mt-2 text-gray-600">Ini adalah halaman dasbor utama Anda. Pilih menu di atas untuk memulai.</p>
                        <p className="mt-1 text-gray-600">Email Anda terdaftar sebagai: {user?.email}</p>
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

    // Layout halaman dasbor diimplementasikan langsung di sini
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-6">
                             <h1 className="text-xl font-bold text-indigo-600">RSpace</h1>
                             <div className="flex items-center space-x-2">
                                <a onClick={() => setActiveView('dashboard')} className={getNavClass('dashboard')}>Dasbor</a>
                                <a onClick={() => setActiveView('archive')} className={getNavClass('archive')}>Arsip</a>
                                <a onClick={() => setActiveView('backup')} className={getNavClass('backup')}>Cadangan</a>
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