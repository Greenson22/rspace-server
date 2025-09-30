// src/routes/user.routes.ts

import { Router } from 'express';
import { getAllUsers, getUserProfile, deleteUser } from '../controllers/user.controller';
import { adminAuth } from '../middleware/admin.middleware';

const router = Router();

// Endpoint untuk mendapatkan profil user yang sedang login
router.get('/profile', getUserProfile);

// Endpoint di bawah ini hanya bisa diakses oleh admin
router.get('/users', adminAuth, getAllUsers);
router.delete('/users/:id', adminAuth, deleteUser);

export default router;