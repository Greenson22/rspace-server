// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { InputField } from '@/components/fragments/InputField';
import { Button } from '@/components/elements/Button';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        // ... (logika login tetap sama) ...
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal untuk login');
            }
            const data = await res.json();
            localStorage.setItem('token', data.token);
            router.push('/dashboard');
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
            <h1 className="text-2xl font-bold text-center text-gray-900">Selamat Datang Kembali</h1>
            <p className="text-center text-gray-600">Silakan masuk untuk melanjutkan</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                    id="email"
                    label="Alamat Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <InputField
                    id="password"
                    label="Kata Sandi"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit">Masuk</Button>
            </form>
            <p className="text-sm text-center text-gray-600">
                Belum punya akun?{' '}
                <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Daftar di sini
                </Link>
            </p>
        </AuthLayout>
    );
}