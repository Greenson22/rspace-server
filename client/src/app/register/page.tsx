// src/app/register/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { InputField } from '@/components/fragments/InputField';
import { Button } from '@/components/elements/Button';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState(''); // Pastikan state username ada
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError('Konfigurasi API URL tidak ditemukan.');
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, email, password }),
            });

            const data = await res.json();
            
            if (!res.ok) {
                if (data.errors && Array.isArray(data.errors)) {
                     throw new Error(data.errors[0].msg);
                }
                throw new Error(data.message || 'Gagal untuk mendaftar');
            }
            
            // PERUBAHAN: Pesan notifikasi yang jelas untuk user
            setSuccess('Registrasi berhasil! Akun Anda sedang menunggu verifikasi dari Admin sebelum dapat digunakan.');
            
            // Opsional: Perpanjang waktu redirect agar user sempat membaca pesan
            setTimeout(() => {
                router.push('/login');
            }, 4000); 
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Terjadi kesalahan yang tidak terduga');
            }
        }
    };

    return (
        <AuthLayout>
            <h1 className="text-2xl font-bold text-center text-gray-900">Buat Akun Baru</h1>
            <p className="text-center text-gray-600">Bergabunglah bersama kami sekarang!</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                    id="name"
                    label="Nama Lengkap"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                 {/* Input Username (Wajib ada) */}
                <InputField
                    id="username"
                    label="Username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <InputField
                    id="email"
                    label="Alamat Email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <InputField
                    id="password"
                    label="Kata Sandi"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                
                {/* Tampilan pesan sukses yang lebih menonjol */}
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-700 font-medium text-center">{success}</p>
                    </div>
                )}
                
                <Button type="submit">Daftar</Button>
            </form>
            <p className="text-sm text-center text-gray-600">
                Sudah punya akun?{' '}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Masuk di sini
                </Link>
            </p>
        </AuthLayout>
    );
}