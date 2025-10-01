// src/components/fragments/ProfileView.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card } from '../elements/Card';
import Image from 'next/image';

// Perbarui interface untuk mencakup semua data profil
interface UserProfile {
    name: string | null;
    email: string;
    birth_date: string | null;
    bio: string | null;
    profile_picture_path: string | null;
    createdAt: string;
}

export const ProfileView = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Autentikasi gagal. Silakan login kembali.');
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error('Gagal memuat data profil.');
                }

                const data: UserProfile = await res.json();
                setProfile(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Terjadi kesalahan yang tidak terduga');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Fungsi untuk memformat tanggal
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Tidak diatur';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profil Pengguna</h2>
            {loading && <p>Memuat profil...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && profile && (
                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                    <div className="flex-shrink-0">
                        <Image
                            src={profile.profile_picture_path ? `/storage/${profile.profile_picture_path}` : '/default-avatar.png'}
                            alt="Foto Profil"
                            width={150}
                            height={150}
                            className="rounded-full object-cover border-4 border-gray-200"
                            onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }} // Fallback jika gambar gagal dimuat
                        />
                    </div>
                    <div className="flex-grow">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Nama Lengkap</h3>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{profile.name || 'Belum diatur'}</p>
                            </div>
                             <div>
                                <h3 className="text-sm font-medium text-gray-500">Alamat Email</h3>
                                <p className="mt-1 text-gray-800">{profile.email}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Tanggal Lahir</h3>
                                <p className="mt-1 text-gray-800">{formatDate(profile.birth_date)}</p>
                            </div>
                             <div>
                                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                                <p className="mt-1 text-gray-800 italic">{profile.bio || 'Bio belum diatur.'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Bergabung Sejak</h3>
                                <p className="mt-1 text-gray-800">{formatDate(profile.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};