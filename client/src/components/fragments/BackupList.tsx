// src/components/fragments/BackupList.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card } from '../elements/Card';

interface BackupFile {
    uniqueName: string;
    originalName: string;
    createdAt: string;
}

export const BackupList = () => {
    const [rspaceBackups, setRspaceBackups] = useState<BackupFile[]>([]);
    const [perpuskuBackups, setPerpuskuBackups] = useState<BackupFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchBackups = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Autentikasi gagal.');
                setLoading(false);
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                setError('Konfigurasi API URL tidak ditemukan.');
                setLoading(false);
                return;
            }

            try {
                const [rspaceRes, perpuskuRes] = await Promise.all([
                    fetch(`${apiUrl}/backups/rspace`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${apiUrl}/backups/perpusku`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (!rspaceRes.ok || !perpuskuRes.ok) {
                    throw new Error('Gagal memuat data cadangan.');
                }

                const rspaceData = await rspaceRes.json();
                const perpuskuData = await perpuskuRes.json();

                setRspaceBackups(rspaceData);
                setPerpuskuBackups(perpuskuData);

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
        fetchBackups();
    }, []);

    const renderBackupList = (title: string, backups: BackupFile[]) => (
        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
            {backups.length > 0 ? (
                <ul className="space-y-2">
                    {backups.map(file => (
                        <li key={file.uniqueName} className="p-3 bg-gray-50 rounded-md border flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-700">{file.originalName}</p>
                                <p className="text-sm text-gray-500">Dibuat pada: {file.createdAt}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">Tidak ada data cadangan.</p>
            )}
        </div>
    );

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Cadangan</h2>
            {loading && <p>Memuat data...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
                <div className="space-y-8">
                    {renderBackupList("Cadangan RSpace", rspaceBackups)}
                    {renderBackupList("Cadangan PerpusKu", perpuskuBackups)}
                </div>
            )}
        </Card>
    );
};