// src/controllers/admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as adminService from '../services/admin.service';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await adminService.findAllUsers(req.user!.userId);
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const updateUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userIdToUpdate = parseInt(req.params.id, 10);
        const { newPassword } = req.body;
        const result = await adminService.updateUserPasswordById(userIdToUpdate, newPassword);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// ==> CONTROLLER BARU UNTUK VERIFIKASI MANUAL <==
export const manuallyVerifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userIdToVerify = parseInt(req.params.id, 10);
        const result = await adminService.verifyUserById(userIdToVerify);
        res.json(result);
    } catch (error) {
        next(error);
    }
};