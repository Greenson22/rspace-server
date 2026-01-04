// src/components/fragments/SharingView.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '../elements/Card';
import { Button } from '../elements/Button';
import { Input } from '../elements/Input';
import { getApiUrl } from '@/utils/apiConfig';

interface FileItem {
    name: string;
    type: 'file' | 'folder';
    size: number;
    updatedAt: string;
}

export const SharingView = () => {
    const [currentPath, setCurrentPath] = useState('');
    const [items, setItems] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const apiUrl = getApiUrl();

    const fetchItems = async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        try {
            const encodedPath = encodeURIComponent(currentPath);
            const res = await fetch(`${apiUrl}/sharing/list?path=${encodedPath}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Gagal memuat file.');
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
        if (!newFolderName.trim()) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/sharing/folder`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ parentPath: currentPath, folderName: newFolderName })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal membuat folder');
            }
            setNewFolderName('');
            setIsCreatingFolder(false);
            fetchItems();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error');
        }
    };

    const handleDelete = async (itemName: string) => {
        if(!confirm(`Hapus ${itemName}?`)) return;
        const token = localStorage.getItem('token');
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
        const token = localStorage.getItem('token');
        const itemPath = currentPath ? `${currentPath}/${fileName}` : fileName;
        
        try {
             const res = await fetch(`${apiUrl}/sharing/download?path=${encodeURIComponent(itemPath)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if(!res.ok) throw new Error("Gagal download");
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            alert("Error saat mengunduh file.");
        }
    };

    const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const token = localStorage.getItem('token');
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

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '-';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card>
            {/* Header Responsif: Flex column di mobile, row di desktop */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Sharing & File Manager</h2>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div className="w-full md:w-auto">
                        <Button onClick={() => setIsCreatingFolder(!isCreatingFolder)} variant="secondary" className="w-full justify-center">
                            {isCreatingFolder ? 'Batal' : '+ Folder'}
                        </Button>
                    </div>
                    <div className="w-full md:w-auto">
                        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full justify-center">
                            {uploading ? 'Mengunggah...' : '+ Upload File'}
                        </Button>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleUploadFile} 
                    />
                </div>
            </div>

            {/* Breadcrumb Responsif: Scrollable horizontal */}
            <div className="overflow-x-auto whitespace-nowrap mb-4 pb-2">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-sm text-gray-600 min-w-max">
                    <button 
                        onClick={() => setCurrentPath('')}
                        className={`hover:text-indigo-600 font-medium ${!currentPath ? 'text-gray-900' : ''}`}
                    >
                        Home
                    </button>
                    {currentPath.split('/').map((segment, index, arr) => {
                        if (!segment) return null;
                        const pathUpToHere = arr.slice(0, index + 1).join('/');
                        return (
                            <div key={pathUpToHere} className="flex items-center">
                                <span className="mx-2">/</span>
                                <button 
                                    onClick={() => setCurrentPath(pathUpToHere)}
                                    className="hover:text-indigo-600"
                                >
                                    {segment}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form Buat Folder Responsif */}
            {isCreatingFolder && (
                <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-end p-4 border border-indigo-100 bg-indigo-50 rounded">
                    <div className="flex-grow w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Folder</label>
                        <Input 
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Contoh: Dokumen Kerja"
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <Button onClick={handleCreateFolder}>Buat</Button>
                    </div>
                </div>
            )}

            {error && <p className="text-red-600 mb-4">{error}</p>}
            {loading && <p className="text-gray-500">Memuat...</p>}

            {!loading && (
                <div className="border rounded-md overflow-hidden">
                    {items.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Folder ini kosong.
                        </div>
                    ) : (
                        /* Wrapper Table Scrollable */
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ukuran</th>
                                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentPath && (
                                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={handleGoBack}>
                                            <td className="px-4 md:px-6 py-4 flex items-center" colSpan={3}>
                                                <span className="text-xl mr-3">📂</span>
                                                <span className="font-medium">.. (Kembali)</span>
                                            </td>
                                        </tr>
                                    )}
                                    {items.map((item) => (
                                        <tr key={item.name} className="hover:bg-gray-50">
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <div 
                                                    className={`flex items-center ${item.type === 'folder' ? 'cursor-pointer text-indigo-700' : 'text-gray-900'}`}
                                                    onClick={() => item.type === 'folder' && handleNavigate(item.name)}
                                                >
                                                    <span className="text-xl mr-3">{item.type === 'folder' ? '📁' : '📄'}</span>
                                                    <span className="font-medium text-sm md:text-base">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatSize(item.size)}
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex flex-col md:flex-row justify-end gap-2 md:gap-4">
                                                    {item.type === 'file' && (
                                                        <button 
                                                            onClick={() => handleDownload(item.name)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Download
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDelete(item.name)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};