// src/routes/user.routes.ts

import { Router } from 'express';
import { getAllUsers, getUserProfile, deleteUser, updateProfile, uploadProfilePicture } from '../controllers/user.controller';
import { adminAuth } from '../middleware/admin.middleware';
// Import middleware upload yang baru
import { uploadProfilePicture as uploadMiddleware } from '../middleware/profile_picture_upload.middleware';

const router = Router();

router.get('/profile', getUserProfile);
router.put('/profile', updateProfile); 

// ENDPOINT BARU UNTUK UPLOAD FOTO PROFIL
router.post('/profile/picture', uploadMiddleware.single('profilePicture'), uploadProfilePicture);

// Endpoint di bawah ini hanya bisa diakses oleh admin
router.get('/users', adminAuth, getAllUsers);
router.delete('/users/:id', adminAuth, deleteUser);

export default router;