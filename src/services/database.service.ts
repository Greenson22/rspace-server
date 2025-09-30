// src/services/database.service.ts

import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
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
        const createUserTableSql = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                name TEXT,
                birth_date TEXT,
                bio TEXT,
                profile_picture_path TEXT,
                createdAt TEXT NOT NULL
            )
        `;
        db.run(createUserTableSql, (err) => {
            if (err) {
                console.error('Error saat membuat tabel users', err.message);
                return;
            }
            console.log('Tabel "users" siap digunakan.');

            // ==> LOGIKA MIGRASI DIMULAI DI SINI <==
            // Cek apakah kolom 'profile_picture_path' sudah ada
            db.all("PRAGMA table_info(users)", (err, columns: { name: string }[]) => {
                if (err) {
                    console.error("Error saat memeriksa skema tabel users:", err.message);
                    return;
                }

                const columnExists = columns.some(col => col.name === 'profile_picture_path');

                if (!columnExists) {
                    console.log("Menjalankan migrasi: Menambahkan kolom 'profile_picture_path' ke tabel 'users'...");
                    db.run("ALTER TABLE users ADD COLUMN profile_picture_path TEXT", (alterErr) => {
                        if (alterErr) {
                            console.error("Gagal menjalankan migrasi:", alterErr.message);
                        } else {
                            console.log("Migrasi berhasil: Kolom 'profile_picture_path' telah ditambahkan.");
                        }
                    });
                }
            });
            // ==> LOGIKA MIGRASI SELESAI <==


            // Logika untuk membuat admin default (tidak berubah)
            db.get('SELECT COUNT(*) as count FROM users', (err, row: { count: number }) => {
                if (err) {
                    console.error('Gagal memeriksa data pengguna:', err.message);
                    return;
                }
                if (row.count === 0) {
                    console.log('Tabel pengguna kosong, membuat akun Admin default...');
                    const defaultEmail = 'admin@rspace.com';
                    const defaultPassword = 'admin123';
                    const defaultName = 'Admin RSpace';
                    const createdAt = new Date().toISOString();

                    bcrypt.hash(defaultPassword, 10, (err, hash) => {
                        if (err) {
                            console.error('Gagal hash password default:', err.message);
                            return;
                        }
                        const insertSql = 'INSERT INTO users (email, password, name, createdAt) VALUES (?, ?, ?, ?)';
                        db.run(insertSql, [defaultEmail, hash, defaultName, createdAt], (err) => {
                            if (err) {
                                console.error('Gagal membuat pengguna default:', err.message);
                            } else {
                                console.log(`Pengguna default '${defaultEmail}' berhasil dibuat.`);
                            }
                        });
                    });
                }
            });
        });
    });
};

export default db;