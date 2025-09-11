// src/routes/discussion_file.routes.ts

import { Router } from 'express';
import { getDiscussionMetadata } from '../controllers/discussion_file.controller';

const router = Router();

// Endpoint untuk mendapatkan metadata unggahan terakhir
router.get('/discussion-metadata', getDiscussionMetadata);

export default router;