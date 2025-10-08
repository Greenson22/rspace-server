// src/services/auth.service.ts

import db from './database.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // <-- Import crypto
import { sendVerificationEmail } from './email.service'; // <-- Import email service

interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    createdAt: string;
    isVerified: number; // <-- Tambahkan ini
}

export const registerUser = (email: string, password: string, name: string): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, async (err, hash) => { // <-- Jadikan async
            if (err) {
                return reject(new Error('Gagal mengenkripsi password.'));
            }

            const createdAt = new Date().toISOString();
            
            // 1. Buat token verifikasi
            const verificationToken = crypto.randomBytes(20).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
            const tokenExpires = new Date(Date.now() + 3600000).toISOString(); // 1 jam dari sekarang

            // 2. Simpan user dengan status belum diverifikasi dan token
            const sql = 'INSERT INTO users (email, password, name, createdAt, verificationToken, tokenExpires) VALUES (?, ?, ?, ?, ?, ?)';
            
            db.run(sql, [email, hash, name, createdAt, hashedToken, tokenExpires], async function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return reject(new Error('Email sudah terdaftar.'));
                    }
                    return reject(new Error('Gagal mendaftarkan pengguna.'));
                }
                
                try {
                    // 3. Kirim email verifikasi
                    await sendVerificationEmail(email, verificationToken);
                    resolve({ message: 'Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.' });
                } catch (emailError) {
                    console.error("Gagal mengirim email verifikasi:", emailError);
                    reject(new Error('Registrasi berhasil, tetapi gagal mengirim email verifikasi.'));
                }
            });
        });
    });
};

export const verifyUser = (token: string): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const sql = `
            UPDATE users 
            SET isVerified = 1, verificationToken = NULL, tokenExpires = NULL 
            WHERE verificationToken = ? AND tokenExpires > ?
        `;

        db.run(sql, [hashedToken, new Date().toISOString()], function(err) {
            if (err) {
                return reject(new Error('Gagal memverifikasi akun.'));
            }
            if (this.changes === 0) {
                return reject(new Error('Token verifikasi tidak valid atau sudah kedaluwarsa.'));
            }
            resolve({ message: 'Akun Anda telah berhasil diverifikasi!' });
        });
    });
};

export const loginUser = (email: string, password: string): Promise<{ message: string, token: string }> => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';

        db.get(sql, [email], (err, user: User) => {
            if (err) {
                return reject(new Error('Error pada server.'));
            }
            if (!user) {
                return reject(new Error('Email atau password salah.'));
            }

            // ==> TAMBAHKAN PENGECEKAN VERIFIKASI DI SINI <==
            if (user.isVerified === 0) {
                return reject(new Error('Akun Anda belum diverifikasi. Silakan periksa email Anda.'));
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return reject(new Error('Error pada server saat membandingkan password.'));
                }
                if (!isMatch) {
                    return reject(new Error('Email atau password salah.'));
                }

                const payload = { userId: user.id, email: user.email, name: user.name };
                const secret = process.env.JWT_SECRET || 'default_secret';
                const token = jwt.sign(payload, secret, { expiresIn: '7d' });

                resolve({ message: 'Login berhasil.', token });
            });
        });
    });
};