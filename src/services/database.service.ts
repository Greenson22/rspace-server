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
        // --- TABEL USERS (Eksisting) ---
        const createUserTableSql = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL UNIQUE,
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

            // Logika migrasi untuk kolom user (Eksisting)
            db.all("PRAGMA table_info(users)", (err, columns: { name: string }[]) => {
                if (err) return;
                const columnNames = columns.map(col => col.name);
                if (!columnNames.includes('username')) {
                    db.run("ALTER TABLE users ADD COLUMN username TEXT UNIQUE");
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

            // Logika Admin Default (Eksisting)
            db.get('SELECT COUNT(*) as count FROM users', (err, row: { count: number }) => {
                if (!err && row.count === 0) {
                    console.log('Tabel pengguna kosong, membuat akun Admin default...');
                    const defaultEmail = 'admin@rspace.com';
                    const defaultUsername = 'admin';
                    const defaultPassword = 'admin123';
                    const defaultName = 'Admin RSpace';
                    const createdAt = new Date().toISOString();

                    bcrypt.hash(defaultPassword, 10, (err, hash) => {
                        if (!err) {
                            db.run('INSERT INTO users (email, username, password, name, createdAt, isVerified) VALUES (?, ?, ?, ?, ?, 1)', 
                                [defaultEmail, defaultUsername, hash, defaultName, createdAt]);
                            console.log(`Pengguna default '${defaultEmail}' berhasil dibuat.`);
                        }
                    });
                }
            });
        });

        // --- TABEL SOSIAL MEDIA (BARU) ---
        
        // 1. Tabel Postingan
        db.run(`CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            content TEXT NOT NULL,
            imagePath TEXT,
            createdAt TEXT NOT NULL,
            FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
        )`);

        // 2. Tabel Likes
        db.run(`CREATE TABLE IF NOT EXISTS post_likes (
            userId INTEGER NOT NULL,
            postId INTEGER NOT NULL,
            PRIMARY KEY (userId, postId),
            FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE
        )`);

        // 3. Tabel Komentar
        db.run(`CREATE TABLE IF NOT EXISTS post_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            postId INTEGER NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE
        )`, (err) => {
            if (err) console.error("Gagal membuat tabel sosial media:", err.message);
            else console.log('Tabel Sosial Media (Posts, Likes, Comments) siap.');
        });

    });
};

export default db;