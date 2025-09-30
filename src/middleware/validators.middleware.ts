// src/middleware/validators.middleware.ts

import { body } from 'express-validator';

export const validateRegistration = [
    body('email')
        .isEmail()
        .withMessage('Format email tidak valid.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password minimal harus 6 karakter.')
];

export const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Format email tidak valid.')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password tidak boleh kosong.')
];