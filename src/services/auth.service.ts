// src/services/auth.service.ts

import db from './database.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import crypto from 'crypto'; // Tidak lagi dibutuhkan untuk registrasi
// import { sendVerificationEmail } from './email.service'; // Tidak lagi dibutuhkan

interface User {
    username: any;
    id: number;
    email: string;
    password: string;
    name: string;
    createdAt: string;
    isVerified: number;
}

export const registerUser = (email: string, password: string, name: string, username: string): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                return reject(new Error('Gagal mengenkripsi password.'));
            }

            const createdAt = new Date().toISOString();
            
            // PERUBAHAN 1: Kita set verificationToken dan tokenExpires menjadi NULL
            // karena kita menggunakan verifikasi manual.
            const sql = 'INSERT INTO users (email, password, name, username, createdAt, verificationToken, tokenExpires) VALUES (?, ?, ?, ?, ?, NULL, NULL)';
            
            db.run(sql, [email, hash, name, username, createdAt], async function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed: users.email')) {
                        return reject(new Error('Email sudah terdaftar.'));
                    }
                    if (err.message.includes('UNIQUE constraint failed: users.username')) {
                        return reject(new Error('Username sudah digunakan.'));
                    }
                    return reject(new Error('Gagal mendaftarkan pengguna.'));
                }
                
                // PERUBAHAN 2: Hapus pengiriman email dan update pesan sukses
                resolve({ message: 'Registrasi berhasil! Mohon tunggu verifikasi manual dari Admin agar akun Anda aktif.' });
            });
        });
    });
};

// ... (fungsi verifyUser tetap ada jika ingin disimpan, atau bisa dihapus) ...
export const verifyUser = (token: string): Promise<{ message: string }> => {
   // ... (kode lama biarkan saja atau hapus jika mau bersih total)
   return Promise.reject(new Error('Fitur verifikasi email dinonaktifkan.'));
};

export const loginUser = (loginIdentifier: string, password: string): Promise<{ message: string, token: string }> => {
    return new Promise((resolve, reject) => {
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
                // PERUBAHAN 3: Update pesan error login
                return reject(new Error('Akun Anda belum diverifikasi oleh Admin. Silakan hubungi Admin untuk aktivasi.'));
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

export const resendVerification = (email: string): Promise<{ message: string }> => {
    // Nonaktifkan fitur resend karena verifikasi manual
    return Promise.reject(new Error('Verifikasi dilakukan secara manual oleh Admin.'));
};