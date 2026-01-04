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
        
        // Mengambil URL API dari environment variable
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError('Konfigurasi API URL tidak ditemukan.');
            return;
        }

        try {
            // Menggunakan URL lengkap untuk request
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            // PERBAIKAN: Cek status dulu sebelum mencoba parsing JSON
            if (!res.ok) {
                // Ambil respons sebagai teks mentah untuk menghindari crash jika isinya HTML
                const errorText = await res.text();
                
                try {
                    // Coba parse teks tersebut sebagai JSON (jika backend mengirim error JSON valid)
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || 'Gagal untuk login');
                } catch (jsonError) {
                    // Jika gagal diparse (berarti isinya HTML atau string biasa),
                    // Tampilkan pesan error yang aman berdasarkan status code
                    console.error("Server Error Response (Raw):", errorText); // Log untuk debugging developer
                    
                    if (res.status === 404) {
                        throw new Error('URL API tidak ditemukan (404). Cek konfigurasi NEXT_PUBLIC_API_URL.');
                    } else if (res.status === 500) {
                        throw new Error('Terjadi kesalahan internal pada server (500).');
                    } else {
                        throw new Error(`Terjadi kesalahan server (Status: ${res.status}).`);
                    }
                }
            }

            // Jika status OK, aman untuk parsing JSON
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
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <InputField
                    id="password"
                    label="Kata Sandi"
                    type="password"
                    required
                    autoComplete="current-password"
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