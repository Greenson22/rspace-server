// src/components/fragments/FeedView.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card } from '../elements/Card';
import { Button } from '../elements/Button';
import { getApiUrl } from '@/utils/apiConfig';
import Image from 'next/image';

interface Comment {
    id: number;
    content: string;
    name: string;
    createdAt: string;
    profile_picture_path: string | null;
}

interface Post {
    id: number;
    userId: number;
    name: string;
    username: string;
    profile_picture_path: string | null;
    content: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    isLiked: number; // 1 or 0 from SQLite
}

export const FeedView = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
    const [comments, setComments] = useState<{[key: number]: Comment[]}>({});
    const [newCommentText, setNewCommentText] = useState('');

    const apiUrl = getApiUrl();
    const serverBaseUrl = apiUrl.replace('/api', '');

    const fetchFeed = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/social/feed`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`${apiUrl}/social/post`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newPostContent })
            });
            setNewPostContent('');
            fetchFeed();
        } catch (err) {
            alert('Gagal memposting');
        }
    };

    const handleLike = async (postId: number) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/social/post/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // Optimistic UI Update
                setPosts(posts.map(p => {
                    if (p.id === postId) {
                        const isLiked = p.isLiked ? 0 : 1;
                        return { 
                            ...p, 
                            isLiked, 
                            likeCount: isLiked ? p.likeCount + 1 : p.likeCount - 1 
                        };
                    }
                    return p;
                }));
            }
        } catch (err) { console.error(err); }
    };

    const loadComments = async (postId: number) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null); // Toggle close
            return;
        }
        setActiveCommentPostId(postId);
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/social/post/${postId}/comments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            const data = await res.json();
            setComments(prev => ({ ...prev, [postId]: data }));
        }
    };

    const handleSendComment = async (postId: number) => {
        if(!newCommentText.trim()) return;
        const token = localStorage.getItem('token');
        try {
             await fetch(`${apiUrl}/social/post/${postId}/comment`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newCommentText })
            });
            setNewCommentText('');
            // Reload comments
            const res = await fetch(`${apiUrl}/social/post/${postId}/comments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) {
                const data = await res.json();
                setComments(prev => ({ ...prev, [postId]: data }));
                // Update comment count on post
                setPosts(posts.map(p => p.id === postId ? {...p, commentCount: p.commentCount + 1} : p));
            }
        } catch(err) { alert('Gagal kirim komentar'); }
    };

    const getProfileImg = (path: string | null) => {
        return path ? `${serverBaseUrl}/storage/${path}` : null;
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Input Postingan Baru */}
            <Card>
                <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                        {/* Placeholder avatar user current */}
                         <span className="flex items-center justify-center h-full text-gray-500 text-sm">You</span>
                    </div>
                    <div className="flex-grow">
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                            rows={3}
                            placeholder="Apa yang Anda pikirkan?"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                        />
                        <div className="mt-2 flex justify-end">
                            <div className="w-32">
                                <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                                    Posting
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Daftar Postingan */}
            {loading ? <p className="text-center">Memuat beranda...</p> : posts.map(post => (
                <Card key={post.id} className="p-0 overflow-hidden">
                    <div className="p-4">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden border">
                                {post.profile_picture_path ? (
                                    <Image 
                                        src={getProfileImg(post.profile_picture_path)!} 
                                        width={40} height={40} 
                                        alt={post.name} 
                                        className="object-cover w-full h-full"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                        {post.name[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{post.name}</h4>
                                <p className="text-xs text-gray-500">
                                    @{post.username} • {new Date(post.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-gray-50 px-4 py-2 border-t flex items-center space-x-6">
                        <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-1 text-sm font-medium ${post.isLiked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                        >
                            <span>{post.isLiked ? '👍 Disukai' : '👍 Suka'}</span>
                            <span>({post.likeCount})</span>
                        </button>
                        <button 
                            onClick={() => loadComments(post.id)}
                            className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-indigo-600"
                        >
                            <span>💬 Komentar</span>
                            <span>({post.commentCount})</span>
                        </button>
                    </div>

                    {/* Komentar Section */}
                    {activeCommentPostId === post.id && (
                        <div className="bg-gray-50 border-t p-4 space-y-4">
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {comments[post.id]?.map(comment => (
                                    <div key={comment.id} className="flex space-x-2">
                                         <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                                            {comment.profile_picture_path ? (
                                                <Image src={getProfileImg(comment.profile_picture_path)!} width={32} height={32} alt="u" className="object-cover" unoptimized/>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-xs">{comment.name[0]}</div>
                                            )}
                                        </div>
                                        <div className="bg-white p-2 rounded-lg shadow-sm flex-grow">
                                            <p className="text-xs font-bold text-gray-900">{comment.name}</p>
                                            <p className="text-sm text-gray-700">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <input 
                                    type="text" 
                                    className="flex-grow px-3 py-2 border rounded-md text-sm"
                                    placeholder="Tulis komentar..."
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                                />
                                <button onClick={() => handleSendComment(post.id)} className="text-indigo-600 text-sm font-semibold">Kirim</button>
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
};