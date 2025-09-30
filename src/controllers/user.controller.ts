// src/controllers/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import path from 'path';
import { rootPath } from '../config/path';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const user = await userService.findUserById(userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.findAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userIdToDelete = parseInt(req.params.id, 10);
        if (req.user.userId === userIdToDelete) {
            return res.status(400).json({ message: 'Admin tidak dapat menghapus dirinya sendiri.' });
        }
        const result = await userService.deleteUserById(userIdToDelete);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const { name, birth_date, bio } = req.body;
        const result = await userService.updateUserProfile(userId, name, birth_date, bio);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// CONTROLLER BARU UNTUK UPLOAD FOTO PROFIL (DIPERBARUI)
export const uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Tidak ada file gambar yang diunggah.' });
        }

        const userId = req.user.userId;
        
        // ==> PERBAIKAN DI SINI: Hapus '/storage' dari path yang disimpan <==
        // Sekarang path-nya akan menjadi: user_1/profile_pictures/namafile.jpg
        const relativePath = path.join(`user_${userId}`, 'profile_pictures', req.file.filename);

        await userService.updateUserPicturePath(userId, relativePath);

        res.status(200).json({ 
            message: 'Foto profil berhasil diunggah.',
            filePath: relativePath 
        });

    } catch (error) {
        next(error);
    }
};