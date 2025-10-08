// src/middleware/validators.middleware.ts

import { body } from 'express-validator';

export const validateRegistration = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nama tidak boleh kosong.'),
    body('username') // <-- Validasi baru untuk username
        .trim()
        .notEmpty()
        .withMessage('Username tidak boleh kosong.')
        .isLength({ min: 3 })
        .withMessage('Username minimal harus 3 karakter.')
        .isAlphanumeric()
        .withMessage('Username hanya boleh berisi huruf dan angka.'),
    body('email')
        .isEmail()
        .withMessage('Format email tidak valid.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password minimal harus 6 karakter.')
];

export const validateLogin = [
    // Ubah dari 'email' menjadi 'loginIdentifier'
    body('loginIdentifier')
        .trim()
        .notEmpty()
        .withMessage('Username atau Email tidak boleh kosong.'),
    body('password')
        .notEmpty()
        .withMessage('Password tidak boleh kosong.')
];

export const validatePasswordUpdate = [
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Password baru minimal harus 6 karakter.')
];