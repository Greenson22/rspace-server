// src/routes/user.routes.ts

import { Router } from 'express';
import { getAllUsers, getUserProfile, deleteUser, updateProfile } from '../controllers/user.controller';
import { adminAuth } from '../middleware/admin.middleware';

const router = Router();

router.get('/profile', getUserProfile);
router.put('/profile', updateProfile); // <-- TAMBAHKAN ENDPOINT INI

// Endpoint di bawah ini hanya bisa diakses oleh admin
router.get('/users', adminAuth, getAllUsers);
router.delete('/users/:id', adminAuth, deleteUser);

export default router;