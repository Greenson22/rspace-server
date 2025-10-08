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
        const { email, password, name, username } = req.body; // <-- Ambil username
        const result = await authService.registerUser(email, password, name, username); // <-- Kirim username ke service
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
        const { loginIdentifier, password } = req.body; // <-- Ambil loginIdentifier
        const result = await authService.loginUser(loginIdentifier, password); // <-- Kirim loginIdentifier
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// ... (fungsi verify dan resend tidak berubah) ...
export const verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params;
        const result = await authService.verifyUser(token);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-success`);
    } catch (error) {
        const err = error as Error;
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-failed?error=${encodeURIComponent(err.message)}`);
    }
};

export const resend = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email dibutuhkan.' });
        }
        const result = await authService.resendVerification(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};