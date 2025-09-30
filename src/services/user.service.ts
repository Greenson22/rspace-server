// src/services/user.service.ts

import db from './database.service';

interface UserProfile {
    id: number;
    email: string;
    createdAt: string;
}

export const findUserById = (id: number): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, email, createdAt FROM users WHERE id = ?';
        db.get(sql, [id], (err, row: UserProfile) => {
            if (err) {
                return reject(new Error('Error server saat mencari pengguna.'));
            }
            if (!row) {
                return reject(new Error('Pengguna tidak ditemukan.'));
            }
            resolve(row);
        });
    });
};

export const findAllUsers = (): Promise<UserProfile[]> => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, email, createdAt FROM users';
        db.all(sql, [], (err, rows: UserProfile[]) => {
            if (err) {
                return reject(new Error('Error server saat mengambil daftar pengguna.'));
            }
            resolve(rows);
        });
    });
};

export const deleteUserById = (id: number): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM users WHERE id = ?';
        db.run(sql, id, function (err) {
            if (err) {
                return reject(new Error('Gagal menghapus pengguna.'));
            }
            if (this.changes === 0) {
                return reject(new Error('Pengguna tidak ditemukan untuk dihapus.'));
            }
            resolve({ message: 'Pengguna berhasil dihapus.' });
        });
    });
};