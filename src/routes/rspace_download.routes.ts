// src/routes/rspace_download.routes.ts

import { Router } from 'express';
// ## PERUBAHAN 1: Impor controller baru ##
import { handleDownloadSrc, handleDownloadClientSrc, handleDownloadFile } from '../controllers/rspace_download.controller';

const publicRouter = Router();
const privateRouter = Router();

// Endpoint PUBLIK untuk download folder server src
publicRouter.get('/download-src', handleDownloadSrc);

// ## PERUBAHAN 2: Tambahkan endpoint PUBLIK baru untuk download client/src ##
publicRouter.get('/download-client-src', handleDownloadClientSrc);

// Endpoint PRIVAT yang tetap memerlukan autentikasi
privateRouter.get('/download/:uniqueName', handleDownloadFile);

export { publicRouter as publicRspaceDownloadRoutes, privateRouter as privateRspaceDownloadRoutes };