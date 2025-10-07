// src/services/admin.service.ts
import db from './database.service';
import bcrypt from 'bcryptjs';

interface User {
    id: number;
    email: string;
    name: string;
    createdAt: string;
}

// Mengambil semua pengguna kecuali admin yang sedang login
export const findAllUsers = (adminId: number): Promise<User[]> => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, email, name, createdAt FROM users WHERE id != ?';
        db.all(sql, [adminId], (err, rows: User[]) => {
            if (err) {
                return reject(new Error('Gagal mengambil daftar pengguna.'));
            }
            resolve(rows);
        });
    });
};

// Memperbarui password pengguna berdasarkan ID
export const updateUserPasswordById = (userId: number, newPassword: string): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(newPassword, 10, (err, hash) => {
            if (err) {
                return reject(new Error('Gagal mengenkripsi password baru.'));
            }
            const sql = 'UPDATE users SET password = ? WHERE id = ?';
            db.run(sql, [hash, userId], function (err) {
                if (err) {
                    return reject(new Error('Gagal memperbarui password pengguna.'));
                }
                if (this.changes === 0) {
                    return reject(new Error('Pengguna tidak ditemukan.'));
                }
                resolve({ message: 'Password pengguna berhasil diperbarui.' });
            });
        });
    });
};