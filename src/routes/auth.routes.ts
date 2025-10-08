// src/routes/auth.routes.ts

import { Router } from 'express';
import { register, login, verify, resend } from '../controllers/auth.controller'; 
import { validateRegistration, validateLogin } from '../middleware/validators.middleware';

const router = Router();

// Endpoint untuk registrasi user baru
router.post('/auth/register', validateRegistration, register);

// Endpoint untuk login user
router.post('/auth/login', validateLogin, login);

// Endpoint untuk verifikasi token dari email
router.get('/auth/verify/:token', verify);

// Endpoint untuk mengirim ulang email verifikasi
router.post('/auth/resend-verification', resend);

export default router;