// src/middleware/admin.middleware.ts

import { Request, Response, NextFunction } from 'express';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    // Pastikan middleware jwtAuth sudah dijalankan sebelumnya
    if (!req.user) {
        return res.status(401).send('Akses ditolak.');
    }

    // Kita asumsikan user dengan id=1 adalah admin
    if (req.user.userId !== 1) {
        return res.status(403).send('Forbidden: Anda bukan admin.');
    }

    next();
};