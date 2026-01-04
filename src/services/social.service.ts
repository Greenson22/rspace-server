// src/services/social.service.ts
import db from './database.service';

export const getAllPosts = (currentUserId: number): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        // Query ini mengambil post beserta info user, jumlah like, dan apakah user yg login sudah like
        const sql = `
            SELECT 
                p.id, p.content, p.createdAt, p.userId,
                u.name, u.username, u.profile_picture_path,
                (SELECT COUNT(*) FROM post_likes WHERE postId = p.id) as likeCount,
                (SELECT COUNT(*) FROM post_comments WHERE postId = p.id) as commentCount,
                EXISTS (SELECT 1 FROM post_likes WHERE postId = p.id AND userId = ?) as isLiked
            FROM posts p
            JOIN users u ON p.userId = u.id
            ORDER BY p.createdAt DESC
        `;
        
        db.all(sql, [currentUserId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

export const createPost = (userId: number, content: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString();
        db.run('INSERT INTO posts (userId, content, createdAt) VALUES (?, ?, ?)', 
            [userId, content, createdAt], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

export const toggleLike = (userId: number, postId: number): Promise<{liked: boolean}> => {
    return new Promise((resolve, reject) => {
        // Cek apakah sudah like
        db.get('SELECT * FROM post_likes WHERE userId = ? AND postId = ?', [userId, postId], (err, row) => {
            if (err) return reject(err);
            
            if (row) {
                // Jika ada, hapus (Unlike)
                db.run('DELETE FROM post_likes WHERE userId = ? AND postId = ?', [userId, postId], function(err) {
                    if (err) return reject(err);
                    resolve({ liked: false });
                });
            } else {
                // Jika tidak ada, tambah (Like)
                db.run('INSERT INTO post_likes (userId, postId) VALUES (?, ?)', [userId, postId], function(err) {
                    if (err) return reject(err);
                    resolve({ liked: true });
                });
            }
        });
    });
};

export const getComments = (postId: number): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT c.id, c.content, c.createdAt, u.name, u.username, u.profile_picture_path
            FROM post_comments c
            JOIN users u ON c.userId = u.id
            WHERE c.postId = ?
            ORDER BY c.createdAt ASC
        `;
        db.all(sql, [postId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

export const addComment = (userId: number, postId: number, content: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString();
        db.run('INSERT INTO post_comments (userId, postId, content, createdAt) VALUES (?, ?, ?, ?)', 
            [userId, postId, content, createdAt], function(err) {
            if (err) return reject(err);
            // Kembalikan ID komentar baru
            resolve({ id: this.lastID, createdAt });
        });
    });
};