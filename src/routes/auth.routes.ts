// src/routes/auth.routes.ts

import { Router } from 'express';
// ==> Tambahkan 'verify' dari controller
import { register, login, verify } from '../controllers/auth.controller'; 
import { validateRegistration, validateLogin } from '../middleware/validators.middleware';

const router = Router();

// Endpoint untuk registrasi user baru
router.post('/auth/register', validateRegistration, register);

// Endpoint untuk login user
router.post('/auth/login', validateLogin, login);

// ==> Endpoint BARU untuk verifikasi token dari email
router.get('/auth/verify/:token', verify);

export default router;