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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Mengambil URL API dari environment variable
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError('Konfigurasi API URL tidak ditemukan.');
            return;
        }

        try {
            // Menggunakan URL lengkap untuk request
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Gagal untuk mendaftar');
            }
            
            setSuccess('Registrasi berhasil! Anda akan dialihkan ke halaman login.');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
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
                {success && <p className="text-sm text-green-600">{success}</p>}
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