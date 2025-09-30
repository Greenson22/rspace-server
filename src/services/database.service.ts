// src/services/database.service.ts

import sqlite3 from 'sqlite3';
import path from 'path';
import { rootPath } from '../config/path';

const dbPath = path.join(rootPath, 'storage', 'rspace.db');

// Gunakan verbose untuk mendapatkan stack trace yang lebih baik saat debugging
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error saat membuka database', err.message);
    } else {
        console.log('Terhubung ke database SQLite.');
        initializeDb();
    }
});

const initializeDb = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            createdAt TEXT NOT NULL
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error('Error saat membuat tabel users', err.message);
        } else {
            console.log('Tabel "users" siap digunakan.');
        }
    });
};

export default db;