// src/controllers/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.user diisi oleh middleware jwtAuth
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
        // Mencegah admin menghapus dirinya sendiri
        if (req.user.userId === userIdToDelete) {
            return res.status(400).json({ message: 'Admin tidak dapat menghapus dirinya sendiri.' });
        }
        const result = await userService.deleteUserById(userIdToDelete);
        res.json(result);
    } catch (error) {
        next(error);
    }
};