// src/services/admin.service.ts
import db from './database.service';
import bcrypt from 'bcryptjs';

interface User {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    isVerified: number; // Tambahkan properti ini
}

// Mengambil semua pengguna kecuali admin yang sedang login
export const findAllUsers = (adminId: number): Promise<User[]> => {
    return new Promise((resolve, reject) => {
        // Ambil juga kolom 'isVerified'
        const sql = 'SELECT id, email, name, createdAt, isVerified FROM users WHERE id != ?';
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

// ==> FUNGSI BARU UNTUK VERIFIKASI MANUAL <==
export const verifyUserById = (userId: number): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE users 
            SET isVerified = 1, verificationToken = NULL, tokenExpires = NULL 
            WHERE id = ? AND isVerified = 0
        `;
        db.run(sql, [userId], function(err) {
            if (err) {
                return reject(new Error('Gagal memverifikasi pengguna.'));
            }
            if (this.changes === 0) {
                // Ini bisa terjadi jika pengguna sudah diverifikasi atau tidak ditemukan
                return reject(new Error('Pengguna tidak ditemukan atau sudah diverifikasi.'));
            }
            resolve({ message: 'Pengguna berhasil diverifikasi secara manual.' });
        });
    });
};