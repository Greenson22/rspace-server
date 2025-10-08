// src/routes/admin.routes.ts
import { Router } from 'express';
import { getAllUsers, updateUserPassword, manuallyVerifyUser } from '../controllers/admin.controller';
import { validatePasswordUpdate } from '../middleware/validators.middleware';

const router = Router();

// Rute untuk mendapatkan semua pengguna
router.get('/users', getAllUsers);

// Rute untuk mengubah password pengguna
router.put('/users/:id/password', validatePasswordUpdate, updateUserPassword);

// ==> RUTE BARU UNTUK VERIFIKASI MANUAL <==
router.put('/users/:id/verify', manuallyVerifyUser);

export default router;