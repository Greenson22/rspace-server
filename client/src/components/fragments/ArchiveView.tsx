// rspace_server/client/src/components/fragments/ArchiveView.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card } from '../elements/Card';

// Definisikan tipe data sesuai dengan data dari API
interface Topic {
    name: string;
    icon: string;
    title: string;
    description: string;
}

interface Subject {
    name: string;
    icon: string;
}

interface Discussion {
    discussion: string;
    finish_date: string;
    filePath: string | null;
}

const ArchiveView = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Efek untuk memuat topik awal
    useEffect(() => {
        const fetchTopics = async () => {
            if (!token) {
                setError('Anda harus login untuk melihat arsip.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const res = await fetch('/api/archive/topics', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Gagal memuat topik arsip.');
                const data = await res.json();
                setTopics(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, [token]);

    // Handler untuk memilih topik
    const handleTopicSelect = async (topic: Topic) => {
        setSelectedTopic(topic);
        setSelectedSubject(null);
        setDiscussions([]);
        setHtmlContent(null);
        setLoading(true);
        try {
            const res = await fetch(`/api/archive/topics/${topic.name}/subjects`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Gagal memuat subjek.');
            const data = await res.json();
            setSubjects(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handler untuk memilih subjek
    const handleSubjectSelect = async (subject: Subject) => {
        if (!selectedTopic) return;
        setSelectedSubject(subject);
        setHtmlContent(null);
        setLoading(true);
        try {
            const res = await fetch(`/api/archive/topics/${selectedTopic.name}/subjects/${subject.name}/discussions`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Gagal memuat diskusi.');
            const data = await res.json();
            setDiscussions(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Handler untuk melihat konten diskusi
    const handleDiscussionSelect = async (discussion: Discussion) => {
        if (!discussion.filePath) return;
        setLoading(true);
        setHtmlContent(null);
        try {
            const res = await fetch(`/api/archive/file?path=${encodeURIComponent(discussion.filePath)}`, {
                 headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Gagal mengunduh file konten.');
            const html = await res.text();
            setHtmlContent(html);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Navigasi Breadcrumb
    const Breadcrumb = () => (
        <div className="mb-4 text-sm text-gray-500">
            <span className="cursor-pointer hover:underline" onClick={() => {
                setSelectedTopic(null);
                setSelectedSubject(null);
                setDiscussions([]);
                setHtmlContent(null);
            }}>Arsip</span>
            {selectedTopic && (
                <>
                    <span> &gt; </span>
                    <span className="cursor-pointer hover:underline" onClick={() => handleTopicSelect(selectedTopic)}>
                        {selectedTopic.name}
                    </span>
                </>
            )}
            {selectedSubject && (
                <>
                    <span> &gt; </span>
                    <span className="font-semibold text-gray-700">{selectedSubject.name}</span>
                </>
            )}
        </div>
    );

    // Tampilan Konten
    const renderContent = () => {
        if (loading) return <div className="text-center p-8"><p>Memuat...</p></div>;
        if (error) return <div className="text-center p-8 text-red-500"><p>{error}</p></div>;
        
        if(htmlContent) {
            return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
        }

        if(selectedSubject) {
             return (
                <ul className="space-y-2">
                    {discussions.map(d => (
                        <li key={d.discussion} className={`p-3 rounded-md ${d.filePath ? 'cursor-pointer hover:bg-gray-100' : 'text-gray-400'}`} onClick={() => handleDiscussionSelect(d)}>
                           <p className="font-semibold">{d.discussion}</p>
                           <p className="text-xs text-gray-500">Selesai: {d.finish_date}</p>
                        </li>
                    ))}
                </ul>
            );
        }

        if (selectedTopic) {
            return (
                 <ul className="space-y-2">
                    {subjects.map(s => (
                        <li key={s.name} className="p-3 rounded-md cursor-pointer hover:bg-gray-100" onClick={() => handleSubjectSelect(s)}>
                           <span className="mr-2">{s.icon || '📄'}</span> {s.name}
                        </li>
                    ))}
                </ul>
            );
        }

        return (
            <ul className="space-y-2">
                {topics.map(t => (
                    <li key={t.name} className="p-3 rounded-md cursor-pointer hover:bg-gray-100" onClick={() => handleTopicSelect(t)}>
                        <span className="mr-2">{t.icon || '📁'}</span> {t.name}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Jelajahi Arsip Online
            </h2>
            <Breadcrumb />
            <div className="mt-4 border-t pt-4">
                {renderContent()}
            </div>
        </Card>
    );
};

export default ArchiveView;