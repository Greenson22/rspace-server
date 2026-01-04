// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { InputField } from '@/components/fragments/InputField';
import { Button } from '@/components/elements/Button';

export default function LoginPage() {
    // State tetap menggunakan nama 'email' agar sesuai dengan input form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            setError('Konfigurasi API URL tidak ditemukan.');
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // PERBAIKAN DI SINI:
                // Backend mengharapkan field 'loginIdentifier', bukan 'email'.
                // Kita petakan value 'email' dari state ke key 'loginIdentifier'.
                body: JSON.stringify({ 
                    loginIdentifier: email, 
                    password: password 
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    
                    // Handle format error array dari express-validator (seperti di log Anda)
                    if (errorJson.errors && Array.isArray(errorJson.errors)) {
                         // Ambil pesan error pertama dari array
                        throw new Error(errorJson.errors[0].msg);
                    }
                    
                    throw new Error(errorJson.message || 'Gagal untuk login');
                } catch (jsonError) {
                    // Fallback jika error bukan JSON valid
                    console.error("Server Error Response (Raw):", errorText);
                    if (jsonError instanceof Error && jsonError.message !== "Unexpected token..." ) {
                        throw jsonError; // Lempar error yang sudah kita tangkap di atas (dari errorJson)
                    }

                    if (res.status === 404) {
                        throw new Error('Endpoint login tidak ditemukan (404).');
                    } else if (res.status === 500) {
                        throw new Error('Terjadi kesalahan internal pada server (500).');
                    } else {
                        throw new Error(`Gagal Login (Status: ${res.status}).`);
                    }
                }
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
                    label="Alamat Email / Username" 
                    type="text" // Ubah ke text agar bisa terima username juga jika backend mendukung
                    required
                    autoComplete="username"
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