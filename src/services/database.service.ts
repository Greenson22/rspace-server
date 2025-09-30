// src/services/database.service.ts

import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs'; // <-- 1. Impor bcrypt
import { rootPath } from '../config/path';

const dbPath = path.join(rootPath, 'storage', 'rspace.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error saat membuka database', err.message);
    } else {
        console.log('Terhubung ke database SQLite.');
        initializeDb();
    }
});

const initializeDb = () => {
    db.serialize(() => {
        // Buat tabel users jika belum ada
        const createUserTableSql = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                createdAt TEXT NOT NULL
            )
        `;
        db.run(createUserTableSql, (err) => {
            if (err) {
                console.error('Error saat membuat tabel users', err.message);
            } else {
                console.log('Tabel "users" siap digunakan.');
                // ==> 2. Tambahkan blok kode di bawah ini untuk membuat user default <==
                // Cek apakah sudah ada user di dalam tabel
                db.get('SELECT COUNT(*) as count FROM users', (err, row: { count: number }) => {
                    if (err) {
                        console.error('Gagal memeriksa data pengguna:', err.message);
                        return;
                    }
                    // Jika tabel kosong, buat user default
                    if (row.count === 0) {
                        console.log('Tabel pengguna kosong, membuat akun Admin default...');
                        const defaultEmail = 'admin@rspace.com';
                        const defaultPassword = 'admin123';
                        const createdAt = new Date().toISOString();

                        // Hash password default
                        bcrypt.hash(defaultPassword, 10, (err, hash) => {
                            if (err) {
                                console.error('Gagal hash password default:', err.message);
                                return;
                            }
                            const insertSql = 'INSERT INTO users (email, password, createdAt) VALUES (?, ?, ?)';
                            db.run(insertSql, [defaultEmail, hash, createdAt], (err) => {
                                if (err) {
                                    console.error('Gagal membuat pengguna default:', err.message);
                                } else {
                                    console.log(`Pengguna default 'admin@rspace.com' berhasil dibuat.`);
                                }
                            });
                        });
                    }
                });
            }
        });
    });
};

export default db;