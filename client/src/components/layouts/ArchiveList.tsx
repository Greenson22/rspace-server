// src/components/fragments/ArchiveList.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card } from '../elements/Card';

interface Topic { name: string; title: string; description: string; }

export const ArchiveList = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchArchives = async () => {
            // ... (logika fetch data tetap sama seperti di ArchiveView sebelumnya) ...
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Autentikasi gagal. Silakan login kembali.');
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('/api/archive/topics', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Gagal memuat data arsip.');
                const data: Topic[] = await res.json();
                setTopics(data);
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
        fetchArchives();
    }, []);

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Arsip Diskusi</h2>
            {loading && <p>Memuat data arsip...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
                 <div className="space-y-4">
                    {topics.length > 0 ? (
                        topics.map((topic) => (
                            <div key={topic.name} className="p-4 border rounded-md">
                                <h3 className="font-semibold text-lg text-indigo-700">{topic.title}</h3>
                                <p className="text-gray-600">{topic.description}</p>
                            </div>
                        ))
                    ) : (
                        <p>Belum ada data arsip yang tersedia.</p>
                    )}
                </div>
            )}
        </Card>
    );
};