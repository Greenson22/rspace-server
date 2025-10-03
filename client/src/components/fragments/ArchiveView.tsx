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
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Terjadi kesalahan yang tidak terduga');
                }
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
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Terjadi kesalahan yang tidak terduga');
            }
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
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Terjadi kesalahan yang tidak terduga');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Handler untuk melihat konten diskusi
    const handleDiscussionSelect = async (discussion: Discussion) => {
        // === PERBAIKAN UTAMA ADA DI SINI ===
        if (!discussion.filePath || !selectedTopic || !selectedSubject) {
            setError('Informasi tidak lengkap untuk membuka file.');
            return;
        }

        setLoading(true);
        setHtmlContent(null);
        setError('');

        try {
            // Rekonstruksi path relatif yang benar: "NamaTopik/NamaSubjek/namafile.html"
            const fullRelativePath = `${selectedTopic.name}/${selectedSubject.name}/${discussion.filePath}`;
            
            const res = await fetch(`/api/archive/file?path=${encodeURIComponent(fullRelativePath)}`, {
                 headers: { 'Authorization': `Bearer ${token}` },
            });

            if (res.status === 500) {
                 const errorData = await res.json();
                 throw new Error(errorData.message || 'Server error saat mengambil file.');
            }
            if (!res.ok) {
                 throw new Error(`Gagal mengunduh file konten (Status: ${res.status}).`);
            }

            const html = await res.text();
            setHtmlContent(html);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Terjadi kesalahan yang tidak terduga');
            }
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
                 setError('');
            }}>Arsip</span>
            {selectedTopic && (
                <>
                    <span> &gt; </span>
                    <span className="cursor-pointer hover:underline" onClick={() => {
                        handleTopicSelect(selectedTopic);
                         setError('');
                    }}>
                        {selectedTopic.name}
                    </span>
                </>
            )}
            {selectedSubject && !htmlContent && (
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
        if (error) return <div className="text-center p-8 text-red-500"><p>Error: {error}</p></div>;
        
        if(htmlContent) {
            // Gunakan iframe untuk isolasi gaya (styling)
            return (
                 <iframe
                    srcDoc={htmlContent}
                    className="w-full h-[60vh] border rounded-md"
                    title="Konten Arsip"
                />
            );
        }

        if(selectedSubject) {
             return (
                <ul className="space-y-2">
                    {discussions.map(d => (
                        <li key={d.discussion} 
                            className={`p-3 rounded-md border ${d.filePath ? 'cursor-pointer hover:bg-gray-100' : 'text-gray-400 bg-gray-50'}`} 
                            onClick={() => d.filePath && handleDiscussionSelect(d)}>
                           <p className="font-semibold flex items-center">
                               <Icon type={d.filePath ? 'link' : 'link_off'} />
                               {d.discussion}
                           </p>
                           <p className="text-xs text-gray-500 mt-1 ml-8">Selesai: {d.finish_date}</p>
                        </li>
                    ))}
                </ul>
            );
        }

        if (selectedTopic) {
            return (
                 <ul className="space-y-2">
                    {subjects.map(s => (
                        <li key={s.name} className="p-3 rounded-md cursor-pointer hover:bg-gray-100 border" onClick={() => handleSubjectSelect(s)}>
                           <span className="mr-3 text-xl">{s.icon || '📄'}</span> 
                           <span className="font-medium">{s.name}</span>
                        </li>
                    ))}
                </ul>
            );
        }

        return (
            <ul className="space-y-2">
                {topics.map(t => (
                    <li key={t.name} className="p-3 rounded-md cursor-pointer hover:bg-gray-100 border" onClick={() => handleTopicSelect(t)}>
                        <span className="mr-3 text-xl">{t.icon || '📁'}</span>
                        <span className="font-medium">{t.name}</span>
                    </li>
                ))}
            </ul>
        );
    };
    
    const Icon = ({type}: {type: 'link' | 'link_off'}) => (
        <span className={`mr-2 text-lg ${type === 'link' ? 'text-blue-500' : 'text-gray-400'}`}>
            {type === 'link' ? '🔗' : '✖️'}
        </span>
    );


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