// src/routes/admin.routes.ts
import { Router } from 'express';
import { getAllUsers, updateUserPassword } from '../controllers/admin.controller';
import { validatePasswordUpdate } from '../middleware/validators.middleware';

const router = Router();

// Rute untuk mendapatkan semua pengguna
router.get('/users', getAllUsers);

// Rute untuk mengubah password pengguna
router.put('/users/:id/password', validatePasswordUpdate, updateUserPassword);

export default router;