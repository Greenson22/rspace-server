// rspace_server/client/src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
    name: string;
    email: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
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

                if (!res.ok) {
                    throw new Error('Gagal mengambil data profil');
                }

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Memuat...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-indigo-600">Dasbor Saya</h1>
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
                    <div className="p-8 bg-white rounded-lg shadow">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Selamat Datang, {user?.name || 'Pengguna'}!
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Ini adalah halaman dasbor pribadi Anda.
                        </p>
                        <p className="mt-1 text-gray-600">
                            Email Anda terdaftar sebagai: {user?.email}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}