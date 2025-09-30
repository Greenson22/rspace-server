// src/controllers/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

// ... (getUserProfile, getAllUsers, deleteUser tidak berubah) ...
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

// CONTROLLER BARU
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