import { Request, Response, NextFunction } from 'express';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header('x-api-key'); // Klien harus mengirim key di header 'x-api-key'

    // Periksa apakah API Key ada dan cocok dengan yang ada di .env
    if (apiKey && apiKey === process.env.API_KEY) {
        next(); // Kunci cocok, lanjutkan ke request berikutnya
    } else {
        // Kunci tidak ada atau salah, kirim response error
        res.status(401).json({ message: 'Unauthorized: API Key tidak valid atau tidak disertakan.' });
    }
};