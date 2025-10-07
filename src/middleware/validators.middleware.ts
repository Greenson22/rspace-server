// src/middleware/validators.middleware.ts

import { body } from 'express-validator';

export const validateRegistration = [
    body('name') // <-- TAMBAHKAN INI
        .trim()
        .notEmpty()
        .withMessage('Nama tidak boleh kosong.'),
    body('email')
        .isEmail()
        .withMessage('Format email tidak valid.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password minimal harus 6 karakter.')
];

export const validateLogin = [
    // ... (tidak ada perubahan di sini)
    body('email')
        .isEmail()
        .withMessage('Format email tidak valid.')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password tidak boleh kosong.')
];

export const validatePasswordUpdate = [
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Password baru minimal harus 6 karakter.')
];