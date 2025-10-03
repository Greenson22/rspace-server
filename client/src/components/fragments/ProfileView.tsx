// src/components/fragments/ProfileView.tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { Card } from '../elements/Card';
import Image from 'next/image';
import { Button } from '../elements/Button';

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
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    
    const [imageError, setImageError] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Mengambil URL API dari environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Mendapatkan base URL server untuk gambar
    const serverBaseUrl = apiUrl ? apiUrl.replace('/api', '') : '';

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Autentikasi gagal. Silakan login kembali.');
            setLoading(false);
            return;
        }
        if (!apiUrl) {
            setError('Konfigurasi API URL tidak ditemukan.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/profile?v=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Gagal memuat data profil.');
            
            const data: UserProfile = await res.json();
            setProfile(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Terjadi kesalahan yang tidak terduga');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setImageError(false);
        fetchProfile();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setUploadError('');
            setImageError(false);
        }
    };

    const handleCancelUpload = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setUploadError('Sesi Anda telah berakhir. Silakan login kembali.');
            return;
        }
        if (!apiUrl) {
            setUploadError('Konfigurasi API URL tidak ditemukan.');
            return;
        }

        setIsUploading(true);
        setUploadError('');

        const formData = new FormData();
        formData.append('profilePicture', selectedFile);

        try {
            const res = await fetch(`${apiUrl}/profile/picture`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Gagal mengunggah gambar.');
            }

            handleCancelUpload();
            await fetchProfile();
            setImageError(false);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setUploadError(err.message);
            } else {
                setUploadError('Terjadi kesalahan yang tidak terduga');
            }
        } finally {
            setIsUploading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Tidak diatur';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    
    // Gunakan base URL dari server untuk gambar
    const profileImageUrl = profile?.profile_picture_path && serverBaseUrl
        ? `${serverBaseUrl}/storage/${profile.profile_picture_path}` 
        : null;

    const profileImagePath = previewUrl || profileImageUrl;
    const showImage = profileImagePath && !imageError;
    const userInitial = profile?.name?.[0]?.toUpperCase() || 'U';

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profil Pengguna</h2>
            {loading && <p>Memuat profil...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && profile && (
                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                    <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
                        <div className="relative group w-[150px] h-[150px]">
                            {showImage ? (
                                <Image
                                    key={profileImagePath}
                                    src={profileImagePath}
                                    alt="Foto Profil"
                                    width={150}
                                    height={150}
                                    className="rounded-full object-cover border-4 border-gray-200"
                                    onError={() => setImageError(true)}
                                    unoptimized={true} 
                                />
                            ) : (
                                <div className="w-[150px] h-[150px] rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                                    <span className="text-5xl font-bold text-gray-500">
                                        {userInitial}
                                    </span>
                                </div>
                            )}
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-transparent flex items-center justify-center rounded-full"
                            >
                                <span 
                                    className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}
                                >
                                    ✏️
                                </span>
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                        />
                        {selectedFile && (
                            <div className="mt-4 w-40 space-y-2">
                                <Button onClick={handleUpload} disabled={isUploading}>
                                    {isUploading ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                                <Button onClick={handleCancelUpload} variant="secondary" disabled={isUploading}>
                                    Batal
                                </Button>
                                {uploadError && <p className="text-xs text-red-600 text-center mt-1">{uploadError}</p>}
                            </div>
                        )}
                    </div>

                    <div className="flex-grow w-full">
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