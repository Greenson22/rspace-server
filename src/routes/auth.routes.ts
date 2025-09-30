// src/routes/auth.routes.ts

import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateRegistration, validateLogin } from '../middleware/validators.middleware';

const router = Router();

// Endpoint untuk registrasi user baru
router.post('/auth/register', validateRegistration, register);

// Endpoint untuk login user
router.post('/auth/login', validateLogin, login);

export default router;