// src/components/fragments/SharingView.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '../elements/Card';
import { Button } from '../elements/Button';
import { Input } from '../elements/Input';
import { getApiUrl } from '@/utils/apiConfig';

// --- Tipe Data ---
interface FileItem {
    name: string;
    type: 'file' | 'folder';
    size: number;
    updatedAt: string;
}

// --- Komponen Pembantu: SecureImage ---
// Mengambil gambar dengan header Authorization agar bisa tampil
const SecureImage = ({ src, alt, token }: { src: string, alt: string, token: string }) => {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        
        fetch(src, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(async (res) => {
                if (!res.ok) throw new Error('Gagal memuat gambar');
                const blob = await res.blob();
                if (isMounted) {
                    const objectUrl = URL.createObjectURL(blob);
                    setImgSrc(objectUrl);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
            if (imgSrc) URL.revokeObjectURL(imgSrc);
        };
    }, [src, token]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) return <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center text-gray-400">Memuat...</div>;
    if (error || !imgSrc) return <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">Gagal memuat</div>;

    return (
        <img 
            src={imgSrc} 
            alt={alt} 
            className="w-full h-48 object-cover rounded-t-md hover:opacity-90 transition-opacity cursor-pointer" 
        />
    );
};

export const SharingView = () => {
    const [currentPath, setCurrentPath] = useState('');
    const [items, setItems] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Mode Tampilan: 'list' (Tabel) atau 'grid' (Sosial/Galeri)
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const apiUrl = getApiUrl();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // --- Helpers ---
    const isImageFile = (name: string) => {
        return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);
    };

    const getDownloadUrl = (fileName: string) => {
        const itemPath = currentPath ? `${currentPath}/${fileName}` : fileName;
        return `${apiUrl}/sharing/download?path=${encodeURIComponent(itemPath)}`;
    };

    // --- Fetch Data ---
    const fetchItems = async () => {
        if (!token) return;
        setLoading(true);
        setError('');
        try {
            const encodedPath = encodeURIComponent(currentPath);
            const res = await fetch(`${apiUrl}/sharing/list?path=${encodedPath}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Gagal memuat konten.');
            const data = await res.json();
            setItems(data);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPath]);

    // --- Actions ---
    const handleNavigate = (folderName: string) => {
        const nextPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        setCurrentPath(nextPath);
    };

    const handleGoBack = () => {
        if (!currentPath) return;
        const segments = currentPath.split('/');
        segments.pop();
        setCurrentPath(segments.join('/'));
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim() || !token) return;
        try {
            const res = await fetch(`${apiUrl}/sharing/folder`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ parentPath: currentPath, folderName: newFolderName })
            });
            if (!res.ok) throw new Error('Gagal membuat folder');
            setNewFolderName('');
            setIsCreatingFolder(false);
            fetchItems();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error');
        }
    };

    const handleDelete = async (itemName: string) => {
        if(!confirm(`Hapus ${itemName}?`) || !token) return;
        const itemPath = currentPath ? `${currentPath}/${itemName}` : itemName;
        
        try {
            const res = await fetch(`${apiUrl}/sharing/delete?path=${encodeURIComponent(itemPath)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Gagal menghapus item.');
            fetchItems();
        } catch (err) {
            alert('Gagal menghapus');
        }
    };

    const handleDownload = async (fileName: string) => {
        if (!token) return;
        const url = getDownloadUrl(fileName);
        
        try {
             const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if(!res.ok) throw new Error("Gagal download");
            
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (e) {
            alert("Error saat mengunduh file.");
        }
    };

    const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${apiUrl}/sharing/upload?path=${encodeURIComponent(currentPath)}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error('Gagal upload');
            
            fetchItems(); 
        } catch (err) {
            alert('Gagal mengunggah file.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // --- Renderers ---
    const renderBreadcrumb = () => (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-gray-50 rounded text-sm text-gray-600">
            <button 
                onClick={() => setCurrentPath('')}
                className={`hover:text-indigo-600 font-medium ${!currentPath ? 'text-gray-900' : ''}`}
            >
                🏠 Home
            </button>
            {currentPath.split('/').map((segment, index, arr) => {
                if (!segment) return null;
                const pathUpToHere = arr.slice(0, index + 1).join('/');
                return (
                    <div key={pathUpToHere} className="flex items-center">
                        <span className="mx-1 text-gray-400">/</span>
                        <button onClick={() => setCurrentPath(pathUpToHere)} className="hover:text-indigo-600">
                            {segment}
                        </button>
                    </div>
                );
            })}
        </div>
    );

    // Render Tampilan Grid (Social Style)
    const renderGridView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentPath && (
                <div 
                    onClick={handleGoBack}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-500 h-48"
                >
                    <span className="text-3xl mb-2">↩️</span>
                    <span className="font-medium">Kembali</span>
                </div>
            )}

            {items.map((item) => {
                // Jika Folder
                if (item.type === 'folder') {
                    return (
                        <div 
                            key={item.name}
                            onClick={() => handleNavigate(item.name)}
                            className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center justify-center h-full min-h-[150px] p-4"
                        >
                            <span className="text-5xl mb-3">📁</span>
                            <span className="font-semibold text-gray-700 text-center truncate w-full px-2">{item.name}</span>
                            <span className="text-xs text-gray-400 mt-1">Folder</span>
                        </div>
                    );
                }
                
                // Jika File
                const isImg = isImageFile(item.name);
                return (
                    <div key={item.name} className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
                        {/* Area Preview */}
                        <div className="bg-gray-100 flex items-center justify-center" style={{ minHeight: '12rem' }}>
                            {isImg && token ? (
                                <SecureImage 
                                    src={getDownloadUrl(item.name)} 
                                    alt={item.name} 
                                    token={token} 
                                />
                            ) : (
                                <div className="py-8 flex flex-col items-center text-gray-400">
                                    <span className="text-5xl mb-2">
                                        {item.name.endsWith('.zip') ? '📦' : '📄'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Area Info & Aksi */}
                        <div className="p-4 flex flex-col flex-grow">
                            <h4 className="font-medium text-gray-800 truncate mb-1" title={item.name}>
                                {item.name}
                            </h4>
                            <p className="text-xs text-gray-500 mb-4">
                                {(item.size / 1024).toFixed(1)} KB • {new Date(item.updatedAt).toLocaleDateString()}
                            </p>
                            
                            <div className="mt-auto flex space-x-2">
                                <button 
                                    onClick={() => handleDownload(item.name)}
                                    className="flex-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded hover:bg-indigo-100"
                                >
                                    Unduh
                                </button>
                                <button 
                                    onClick={() => handleDelete(item.name)}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded hover:bg-red-100"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <Card className="min-h-[80vh]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Feed & Penyimpanan</h2>
                    <p className="text-sm text-gray-500">Posting foto, arsip, dan dokumen tim.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="flex border rounded-md overflow-hidden mr-2">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            title="Tampilan Grid/Sosial"
                        >
                            ▦ Grid
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            title="Tampilan List"
                        >
                            ≣ List
                        </button>
                    </div>

                    <Button onClick={() => setIsCreatingFolder(!isCreatingFolder)} variant="secondary" style={{ width: 'auto' }}>
                        {isCreatingFolder ? 'Batal' : '+ Folder'}
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ width: 'auto' }}>
                        {uploading ? 'Mengunggah...' : '+ Posting File'}
                    </Button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleUploadFile} 
                    />
                </div>
            </div>

            {renderBreadcrumb()}

            {/* Form Buat Folder */}
            {isCreatingFolder && (
                <div className="mb-6 flex gap-2 items-end p-4 border border-indigo-100 bg-indigo-50 rounded-lg animate-fade-in">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Folder Baru</label>
                        <Input 
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Contoh: Dokumentasi Acara"
                            autoFocus
                        />
                    </div>
                    <Button onClick={handleCreateFolder} style={{ width: 'auto' }}>Buat</Button>
                </div>
            )}

            {/* Error & Loading */}
            {error && <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-md border border-red-200">{error}</div>}
            
            {/* Content Area */}
            {loading ? (
                <div className="py-12 text-center text-gray-500">Sedang memuat konten...</div>
            ) : items.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed rounded-lg bg-gray-50">
                    <p className="text-gray-500 text-lg mb-2">Belum ada postingan atau file di sini.</p>
                    <p className="text-sm text-gray-400">Unggah foto atau dokumen untuk memulai.</p>
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? renderGridView() : (
                        // Fallback ke List View jika user memilih mode List
                        <div className="border rounded-md overflow-hidden">
                             <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ukuran</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentPath && (
                                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={handleGoBack}>
                                            <td className="px-6 py-4" colSpan={3}>
                                                <span className="mr-2">↩️</span> Kembali
                                            </td>
                                        </tr>
                                    )}
                                    {items.map((item) => (
                                        <tr key={item.name} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 flex items-center cursor-pointer" onClick={() => item.type === 'folder' && handleNavigate(item.name)}>
                                                <span className="text-xl mr-3">{item.type === 'folder' ? '📁' : (isImageFile(item.name) ? '🖼️' : '📄')}</span>
                                                <span className={`${item.type === 'folder' ? 'font-semibold text-indigo-700' : 'text-gray-900'}`}>{item.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{(item.size / 1024).toFixed(1)} KB</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {item.type === 'file' && <button onClick={() => handleDownload(item.name)} className="text-indigo-600 hover:underline text-sm">Download</button>}
                                                <button onClick={() => handleDelete(item.name)} className="text-red-600 hover:underline text-sm">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};