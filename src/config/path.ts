// src/config/path.ts

import path from 'path';
import fs from 'fs-extra';

export const rootPath = path.resolve(__dirname, '..', '..');

// TAMBAHKAN 'profile_pictures' KE TIPE
type StorageType = 'Archive_data' | 'RSpace_data' | 'PerpusKu_data' | 'temp_uploads' | 'profile_pictures';

export const getUserStoragePath = (userId: number, storageType: StorageType): string => {
    const userStoragePath = path.join(rootPath, 'storage', `user_${userId}`, storageType);
    fs.ensureDirSync(userStoragePath);
    return userStoragePath;
};