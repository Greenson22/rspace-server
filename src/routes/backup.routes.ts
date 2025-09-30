// src/routes/backup.routes.ts

import { Router } from 'express';
import { listRspaceBackups, listPerpuskuBackups } from '../controllers/backup.controller';

const router = Router();

// Endpoint untuk mendapatkan daftar backup RSpace
router.get('/backups/rspace', listRspaceBackups);

// Endpoint untuk mendapatkan daftar backup PerpusKu
router.get('/backups/perpusku', listPerpuskuBackups);

export default router;