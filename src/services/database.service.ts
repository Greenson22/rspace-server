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
                username TEXT NOT NULL UNIQUE, -- Kolom baru
                password TEXT NOT NULL,
                name TEXT,
                birth_date TEXT,
                bio TEXT,
                profile_picture_path TEXT,
                createdAt TEXT NOT NULL,
                isVerified INTEGER DEFAULT 0,
                verificationToken TEXT,
                tokenExpires TEXT
            )
        `;
        db.run(createUserTableSql, (err) => {
            if (err) {
                console.error('Error saat membuat tabel users', err.message);
                return;
            }
            console.log('Tabel "users" siap digunakan.');

            // Logika migrasi untuk menambahkan kolom jika belum ada
            db.all("PRAGMA table_info(users)", (err, columns: { name: string }[]) => {
                if (err) {
                    console.error("Error saat memeriksa skema tabel users:", err.message);
                    return;
                }

                const columnNames = columns.map(col => col.name);

                if (!columnNames.includes('username')) {
                    db.run("ALTER TABLE users ADD COLUMN username TEXT UNIQUE", (alterErr) => {
                        if (alterErr) {
                           console.log("Kolom 'username' sudah ada atau gagal ditambahkan.");
                        } else {
                           console.log("Migrasi berhasil: Kolom 'username' telah ditambahkan.");
                        }
                    });
                }
                if (!columnNames.includes('isVerified')) {
                    db.run("ALTER TABLE users ADD COLUMN isVerified INTEGER DEFAULT 0");
                }
                if (!columnNames.includes('verificationToken')) {
                    db.run("ALTER TABLE users ADD COLUMN verificationToken TEXT");
                }
                if (!columnNames.includes('tokenExpires')) {
                    db.run("ALTER TABLE users ADD COLUMN tokenExpires TEXT");
                }
            });


            // Logika membuat admin default
            db.get('SELECT COUNT(*) as count FROM users', (err, row: { count: number }) => {
                if (err) {
                    console.error('Gagal memeriksa data pengguna:', err.message);
                    return;
                }
                if (row.count === 0) {
                    console.log('Tabel pengguna kosong, membuat akun Admin default...');
                    const defaultEmail = 'admin@rspace.com';
                    const defaultUsername = 'admin';
                    const defaultPassword = 'admin123';
                    const defaultName = 'Admin RSpace';
                    const createdAt = new Date().toISOString();

                    bcrypt.hash(defaultPassword, 10, (err, hash) => {
                        if (err) {
                            console.error('Gagal hash password default:', err.message);
                            return;
                        }
                        // Admin default langsung diverifikasi
                        const insertSql = 'INSERT INTO users (email, username, password, name, createdAt, isVerified) VALUES (?, ?, ?, ?, ?, 1)';
                        db.run(insertSql, [defaultEmail, defaultUsername, hash, defaultName, createdAt], (err) => {
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