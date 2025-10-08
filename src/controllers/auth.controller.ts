// src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password, name } = req.body;
        const result = await authService.registerUser(email, password, name);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// ==> Controller BARU untuk verifikasi
export const verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params;
        const result = await authService.verifyUser(token);
        // Redirect ke halaman sukses di frontend Anda
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-success`);
    } catch (error) {
        // Redirect ke halaman gagal di frontend Anda
        const err = error as Error;
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-failed?error=${encodeURIComponent(err.message)}`);
    }
};