"use client";

import { useEffect, useState } from 'react';
import { Card } from '../elements/Card';
// 1. Import helper untuk URL API Dinamis
import { getApiUrl } from '@/utils/apiConfig';

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
    
    // 2. Gunakan getApiUrl() alih-alih process.env langsung
    const apiUrl = getApiUrl();

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
                // Gunakan variable apiUrl yang dinamis
                const res = await fetch(`${apiUrl}/archive/topics`, {
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
    }, [token, apiUrl]);

    // Handler untuk memilih topik
    const handleTopicSelect = async (topic: Topic) => {
        setSelectedTopic(topic);
        setSelectedSubject(null);
        setDiscussions([]);
        setHtmlContent(null);
        setLoading(true);
        
        try {
            const res = await fetch(`${apiUrl}/archive/topics/${topic.name}/subjects`, {
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
            const res = await fetch(`${apiUrl}/archive/topics/${selectedTopic.name}/subjects/${subject.name}/discussions`, {
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
        if (!discussion.filePath || !selectedTopic || !selectedSubject) {
            setError('Informasi tidak lengkap untuk membuka file.');
            return;
        }

        setLoading(true);
        setHtmlContent(null);
        setError('');

        try {
            const fullRelativePath = `${selectedTopic.name}/${selectedSubject.name}/${discussion.filePath}`;
            
            const res = await fetch(`${apiUrl}/archive/file?path=${encodeURIComponent(fullRelativePath)}`, {
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

    // Navigasi Breadcrumb (Dibuat Responsif Scrollable)
    const Breadcrumb = () => (
        <div className="mb-4 text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-2">
            <span className="cursor-pointer hover:underline hover:text-indigo-600" onClick={() => {
                setSelectedTopic(null);
                setSelectedSubject(null);
                setDiscussions([]);
                setHtmlContent(null);
                 setError('');
            }}>Arsip</span>
            {selectedTopic && (
                <>
                    <span className="mx-2"> &gt; </span>
                    <span className="cursor-pointer hover:underline hover:text-indigo-600" onClick={() => {
                        handleTopicSelect(selectedTopic);
                         setError('');
                    }}>
                        {selectedTopic.name}
                    </span>
                </>
            )}
            {selectedSubject && !htmlContent && (
                <>
                    <span className="mx-2"> &gt; </span>
                    <span className="font-semibold text-gray-700">{selectedSubject.name}</span>
                </>
            )}
            {htmlContent && selectedSubject && (
                 <>
                    <span className="mx-2"> &gt; </span>
                    <span 
                        className="cursor-pointer hover:underline hover:text-indigo-600" 
                        onClick={() => handleSubjectSelect(selectedSubject)}
                    >
                        {selectedSubject.name}
                    </span>
                    <span className="mx-2"> &gt; </span>
                    <span className="font-semibold text-gray-700">Detail</span>
                </>
            )}
        </div>
    );

    const Icon = ({type}: {type: 'link' | 'link_off'}) => (
        <span className={`mr-2 text-lg ${type === 'link' ? 'text-blue-500' : 'text-gray-400'}`}>
            {type === 'link' ? '🔗' : '✖️'}
        </span>
    );

    // Tampilan Konten
    const renderContent = () => {
        if (loading) return <div className="text-center p-8 text-gray-500"><p>Memuat...</p></div>;
        if (error) return <div className="text-center p-8 text-red-500 bg-red-50 rounded-md"><p>Error: {error}</p></div>;
        
        if(htmlContent) {
            return (
                 <iframe
                    srcDoc={htmlContent}
                    className="w-full h-[60vh] md:h-[70vh] border rounded-md shadow-inner bg-white"
                    title="Konten Arsip"
                />
            );
        }

        if(selectedSubject) {
             return (
                <ul className="space-y-2">
                    {discussions.map(d => (
                        <li key={d.discussion} 
                            className={`p-3 rounded-md border transition-colors ${d.filePath ? 'cursor-pointer hover:bg-indigo-50 border-gray-200' : 'text-gray-400 bg-gray-50 border-gray-100'}`} 
                            onClick={() => d.filePath && handleDiscussionSelect(d)}>
                           <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                               <p className="font-semibold flex items-center text-gray-800">
                                   <Icon type={d.filePath ? 'link' : 'link_off'} />
                                   <span className="break-words">{d.discussion}</span>
                               </p>
                               <p className="text-xs text-gray-500 mt-1 sm:mt-0 sm:ml-4 whitespace-nowrap">
                                   {d.finish_date}
                               </p>
                           </div>
                        </li>
                    ))}
                    {discussions.length === 0 && <p className="text-gray-500 text-center py-4">Tidak ada diskusi.</p>}
                </ul>
            );
        }

        if (selectedTopic) {
            return (
                 <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjects.map(s => (
                        <li key={s.name} 
                            className="p-4 rounded-md cursor-pointer hover:bg-indigo-50 border hover:border-indigo-200 transition-all flex items-center" 
                            onClick={() => handleSubjectSelect(s)}
                        >
                           <span className="mr-3 text-2xl p-2 bg-indigo-100 rounded-full">{s.icon || '📄'}</span> 
                           <span className="font-medium text-gray-800">{s.name}</span>
                        </li>
                    ))}
                    {subjects.length === 0 && <p className="text-gray-500 col-span-full text-center py-4">Tidak ada subjek.</p>}
                </ul>
            );
        }

        return (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map(t => (
                    <li key={t.name} 
                        className="p-4 rounded-lg cursor-pointer hover:bg-indigo-50 border hover:border-indigo-200 transition-all shadow-sm hover:shadow-md" 
                        onClick={() => handleTopicSelect(t)}
                    >
                        <div className="flex items-center mb-2">
                            <span className="mr-3 text-3xl">{t.icon || '📁'}</span>
                            <span className="font-bold text-lg text-indigo-700">{t.title || t.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{t.description}</p>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Card>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Jelajahi Arsip Online
            </h2>
            <Breadcrumb />
            <div className="mt-2 border-t pt-4">
                {renderContent()}
            </div>
        </Card>
    );
};

export default ArchiveView;