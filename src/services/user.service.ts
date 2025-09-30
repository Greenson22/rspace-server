// src/services/user.service.ts

import db from './database.service';

interface UserProfile {
    id: number;
    email: string;
    name: string | null;
    birth_date: string | null;
    bio: string | null;
    createdAt: string;
}

export const findUserById = (id: number): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
        // PERBARUI SQL SELECT
        const sql = 'SELECT id, email, name, birth_date, bio, createdAt FROM users WHERE id = ?';
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
        // PERBARUI SQL SELECT
        const sql = 'SELECT id, email, name, createdAt FROM users';
        db.all(sql, [], (err, rows: UserProfile[]) => {
            if (err) {
                return reject(new Error('Error server saat mengambil daftar pengguna.'));
            }
            resolve(rows);
        });
    });
};

// ... (deleteUserById tidak berubah) ...
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


// FUNGSI BARU UNTUK UPDATE PROFIL
export const updateUserProfile = (id: number, name: string, birth_date: string, bio: string): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET name = ?, birth_date = ?, bio = ? WHERE id = ?';
        db.run(sql, [name, birth_date, bio, id], function(err) {
            if (err) {
                return reject(new Error('Gagal memperbarui profil.'));
            }
            resolve({ message: 'Profil berhasil diperbarui.' });
        });
    });
};