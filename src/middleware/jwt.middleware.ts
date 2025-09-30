// src/middleware/jwt.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Tambahkan properti 'user' ke interface Request Express
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
    // Ambil token dari header 'Authorization'
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Akses ditolak. Tidak ada token yang disediakan.' });
    }

    const token = authHeader.substring(7); // Hapus "Bearer " dari string
    const secret = process.env.JWT_SECRET || 'default_secret';

    try {
        // Verifikasi token
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // Simpan payload token (misal: { userId: 1, email: '...' }) di request
        next(); // Lanjutkan ke request berikutnya
    } catch (error) {
        res.status(400).json({ message: 'Token tidak valid.' });
    }
};