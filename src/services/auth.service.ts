// src/services/auth.service.ts

import db from './database.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail } from './email.service';

interface User {
    id: number;
    email: string;
    username: string;
    password: string;
    name: string;
    createdAt: string;
    isVerified: number;
}

// Perbarui fungsi registerUser untuk menerima 'username'
export const registerUser = (email: string, password: string, name: string, username: string): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                return reject(new Error('Gagal mengenkripsi password.'));
            }

            const createdAt = new Date().toISOString();
            const verificationToken = crypto.randomBytes(20).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
            const tokenExpires = new Date(Date.now() + 3600000).toISOString();

            const sql = 'INSERT INTO users (email, password, name, username, createdAt, verificationToken, tokenExpires) VALUES (?, ?, ?, ?, ?, ?, ?)';
            
            db.run(sql, [email, hash, name, username, createdAt, hashedToken, tokenExpires], async function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed: users.email')) {
                        return reject(new Error('Email sudah terdaftar.'));
                    }
                    if (err.message.includes('UNIQUE constraint failed: users.username')) {
                        return reject(new Error('Username sudah digunakan.'));
                    }
                    return reject(new Error('Gagal mendaftarkan pengguna.'));
                }
                
                try {
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

// Perbarui fungsi loginUser untuk menerima 'loginIdentifier'
export const loginUser = (loginIdentifier: string, password: string): Promise<{ message: string, token: string }> => {
    return new Promise((resolve, reject) => {
        // Cek apakah identifier adalah email atau username
        const isEmail = loginIdentifier.includes('@');
        const column = isEmail ? 'email' : 'username';
        const sql = `SELECT * FROM users WHERE ${column} = ?`;

        db.get(sql, [loginIdentifier], (err, user: User) => {
            if (err) {
                return reject(new Error('Error pada server.'));
            }
            if (!user) {
                return reject(new Error('Username/Email atau password salah.'));
            }

            if (user.isVerified === 0) {
                return reject(new Error('Akun Anda belum diverifikasi. Silakan periksa email Anda.'));
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return reject(new Error('Error pada server saat membandingkan password.'));
                }
                if (!isMatch) {
                    return reject(new Error('Username/Email atau password salah.'));
                }

                const payload = { userId: user.id, email: user.email, name: user.name, username: user.username };
                const secret = process.env.JWT_SECRET || 'default_secret';
                const token = jwt.sign(payload, secret, { expiresIn: '7d' });

                resolve({ message: 'Login berhasil.', token });
            });
        });
    });
};

// ... (fungsi verifyUser dan resendVerification tidak berubah) ...
export const verifyUser = (token: string): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const sql = `
            UPDATE users 
            SET isVerified = 1, verificationToken = NULL, tokenExpires = NULL 
            WHERE verificationToken = ? AND tokenExpires > ?
        `;
        db.run(sql, [hashedToken, new Date().toISOString()], function(err) {
            if (err) { return reject(new Error('Gagal memverifikasi akun.')); }
            if (this.changes === 0) { return reject(new Error('Token verifikasi tidak valid atau sudah kedaluwarsa.')); }
            resolve({ message: 'Akun Anda telah berhasil diverifikasi!' });
        });
    });
};

export const resendVerification = (email: string): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        const sqlFind = 'SELECT * FROM users WHERE email = ?';
        db.get(sqlFind, [email], async (err, user: User) => {
            if (err) { return reject(new Error('Terjadi kesalahan pada server.')); }
            if (!user) { return reject(new Error('Email tidak terdaftar.')); }
            if (user.isVerified) { return reject(new Error('Akun ini sudah terverifikasi.')); }
            const verificationToken = crypto.randomBytes(20).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
            const tokenExpires = new Date(Date.now() + 3600000).toISOString();
            const sqlUpdate = 'UPDATE users SET verificationToken = ?, tokenExpires = ? WHERE email = ?';
            db.run(sqlUpdate, [hashedToken, tokenExpires, email], async function(err) {
                if (err) { return reject(new Error('Gagal memperbarui token verifikasi.')); }
                try {
                    await sendVerificationEmail(email, verificationToken);
                    resolve({ message: 'Email verifikasi baru telah dikirim.' });
                } catch (emailError) {
                    console.error("Gagal mengirim email verifikasi:", emailError);
                    reject(new Error('Gagal mengirim ulang email verifikasi.'));
                }
            });
        });
    });
};