// src/config/path.ts

import path from 'path';
import fs from 'fs-extra'; // Import fs-extra

// __dirname akan berada di 'dist/config' setelah kompilasi.
// Kita naik dua level ('..', '..') untuk mencapai root proyek.
export const rootPath = path.resolve(__dirname, '..', '..');


// ==========================================================
// == FUNGSI HELPER BARU UNTUK PATH PENGGUNA ==
// ==========================================================
type StorageType = 'Archive_data' | 'RSpace_data' | 'PerpusKu_data' | 'temp_uploads';

/**
 * Membuat dan memastikan direktori penyimpanan untuk pengguna tertentu.
 * @param userId - ID pengguna.
 * @param storageType - Tipe penyimpanan (e.g., 'Archive_data').
 * @returns Path absolut ke direktori penyimpanan pengguna.
 */
export const getUserStoragePath = (userId: number, storageType: StorageType): string => {
    // Membuat path seperti: /path/to/project/storage/user_1/Archive_data
    const userStoragePath = path.join(rootPath, 'storage', `user_${userId}`, storageType);
    
    // Pastikan direktori tersebut ada, jika tidak, buat secara sinkron.
    // Ini aman dilakukan di middleware sebelum file di-handle.
    fs.ensureDirSync(userStoragePath);

    return userStoragePath;
};
// ==========================================================