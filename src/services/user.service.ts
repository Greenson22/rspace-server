// src/services/user.service.ts

import db from './database.service';

interface UserProfile {
    id: number;
    email: string;
    username: string;
    name: string | null;
    birth_date: string | null;
    bio: string | null;
    profile_picture_path?: string; // Jadikan opsional
    createdAt: string;
    isVerified: number; // Tambahkan ini
}

export const findUserById = (id: number): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
        // PERBARUI SQL SELECT untuk mengambil semua kolom yang relevan
        const sql = 'SELECT id, email, username, name, birth_date, bio, profile_picture_path, createdAt, isVerified FROM users WHERE id = ?';
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
        const sql = 'SELECT id, email, name, createdAt FROM users';
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

// FUNGSI BARU UNTUK UPDATE PATH FOTO PROFIL
export const updateUserPicturePath = (id: number, filePath: string): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET profile_picture_path = ? WHERE id = ?';
        db.run(sql, [filePath, id], function(err) {
            if (err) {
                return reject(new Error('Gagal memperbarui foto profil di database.'));
            }
            resolve({ message: 'Foto profil berhasil diperbarui.' });
        });
    });
};