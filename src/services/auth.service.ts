// src/services/auth.service.ts

import db from './database.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    createdAt: string;
}

export const registerUser = (email: string, password: string, name: string): Promise<{ message: string }> => { // <-- TAMBAHKAN 'name'
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return reject(new Error('Gagal mengenkripsi password.'));
            }

            const createdAt = new Date().toISOString();
            // PERBARUI SQL DAN PARAMETER
            const sql = 'INSERT INTO users (email, password, name, createdAt) VALUES (?, ?, ?, ?)';
            
            db.run(sql, [email, hash, name, createdAt], function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return reject(new Error('Email sudah terdaftar.'));
                    }
                    return reject(new Error('Gagal mendaftarkan pengguna.'));
                }
                resolve({ message: 'Pengguna berhasil didaftarkan.' });
            });
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

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return reject(new Error('Error pada server saat membandingkan password.'));
                }
                if (!isMatch) {
                    return reject(new Error('Email atau password salah.'));
                }

                // Sertakan 'name' dalam payload token
                const payload = { userId: user.id, email: user.email, name: user.name };
                const secret = process.env.JWT_SECRET || 'default_secret';
                const token = jwt.sign(payload, secret, { expiresIn: '7d' });

                resolve({ message: 'Login berhasil.', token });
            });
        });
    });
};