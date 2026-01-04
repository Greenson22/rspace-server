// src/components/fragments/UserManagement.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card } from '../elements/Card';
import { Button } from '../elements/Button';

interface User {
    id: number;
    name: string;
    email: string;
    isVerified: number;
    createdAt: string;
}

export const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (!token || !apiUrl) return;

        try {
            // Menggunakan endpoint admin yang sudah ada di backend
            const res = await fetch(`${apiUrl}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Gagal memuat daftar pengguna.');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleVerifyUser = async (userId: number) => {
        const token = localStorage.getItem('token');
        if (!confirm("Apakah Anda yakin ingin memverifikasi user ini secara manual?")) return;

        try {
            const res = await fetch(`${apiUrl}/admin/users/${userId}/verify`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Gagal memverifikasi pengguna.');
            
            setActionMessage('User berhasil diverifikasi.');
            fetchUsers(); // Refresh data
        } catch (err) {
            alert('Gagal: ' + (err instanceof Error ? err.message : 'Error tidak diketahui'));
        }
    };

    const handleDeleteUser = async (userId: number) => {
        const token = localStorage.getItem('token');
        if (!confirm("PERINGATAN: Tindakan ini akan menghapus user secara permanen. Lanjutkan?")) return;

        try {
            const res = await fetch(`${apiUrl}/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Gagal menghapus pengguna.');

            setActionMessage('User berhasil dihapus.');
            fetchUsers(); // Refresh data
        } catch (err) {
            alert('Gagal: ' + (err instanceof Error ? err.message : 'Error tidak diketahui'));
        }
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Pengguna (Admin)</h2>
            
            {actionMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {actionMessage}
                </div>
            )}
            
            {loading && <p>Memuat data...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.isVerified ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Terverifikasi
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Belum
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {!user.isVerified && (
                                            <button 
                                                onClick={() => handleVerifyUser(user.id)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-2"
                                            >
                                                Verifikasi
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <p className="text-center mt-4 text-gray-500">Tidak ada pengguna lain.</p>}
                </div>
            )}
        </Card>
    );
};