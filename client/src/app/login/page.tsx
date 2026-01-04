"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { InputField } from '@/components/fragments/InputField';
import { Button } from '@/components/elements/Button';
// 1. Impor helper konfigurasi API
import { getApiUrl } from '@/utils/apiConfig';

export default function LoginPage() {
    // State 'email' tetap digunakan untuk menampung input (bisa email atau username)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        // 2. Ambil URL API secara dinamis (mengikuti settingan localStorage/Env)
        const apiUrl = getApiUrl();

        try {
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Backend mengharapkan 'loginIdentifier' (username/email)
                body: JSON.stringify({ 
                    loginIdentifier: email, 
                    password: password 
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    
                    // Handle format error array dari express-validator
                    if (errorJson.errors && Array.isArray(errorJson.errors)) {
                        throw new Error(errorJson.errors[0].msg);
                    }
                    
                    throw new Error(errorJson.message || 'Gagal untuk login');
                } catch (jsonError) {
                    // Jika error bukan JSON valid (misal 404 HTML page)
                    if (jsonError instanceof Error && !jsonError.message.includes('JSON')) {
                        throw jsonError;
                    }

                    if (res.status === 404) {
                        throw new Error('Endpoint login tidak ditemukan (404). Cek URL API.');
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <h1 className="text-2xl font-bold text-center text-gray-900">Selamat Datang Kembali</h1>
            <p className="text-center text-gray-600">Silakan masuk ke RSpace</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                    id="email"
                    label="Alamat Email / Username" 
                    type="text"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email atau username"
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
                {error && <div className="p-3 bg-red-50 text-sm text-red-600 rounded-md">{error}</div>}
                
                <Button type="submit" disabled={loading}>
                    {loading ? 'Memproses...' : 'Masuk'}
                </Button>
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