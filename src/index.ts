// src/index.ts

import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MulterError } from 'multer';

// Impor Database Service (agar inisialisasi berjalan)
import './services/database.service'; 

// Rute
import authRoutes from './routes/auth.routes';
import rspaceUploadRoutes from './routes/rspace_upload.routes';
import rspaceDownloadRoutes from './routes/rspace_download.routes';
import rspaceFileRoutes from './routes/rspace_file.routes';
import perpuskuUploadRoutes from './routes/perpusku_upload.routes';
import perpuskuDownloadRoutes from './routes/perpusku_download.routes';
import perpuskuFileRoutes from './routes/perpusku_file.routes';
import finishedDiscussionUploadRoutes from './routes/discussion_upload.routes';
import finishedDiscussionFileRoutes from './routes/discussion_file.routes';
import archiveRoutes from './routes/archive.routes';

// Middleware
import { jwtAuth } from './middleware/jwt.middleware';

const app = express();
const PORT = 3000;

// Middleware global
app.use(cors());
app.use(express.json());


// ==========================================================
// == HALAMAN LOGIN (ENDPOINT ROOT) - DIPERBARUI DENGAN LINK REGISTRASI ==
// ==========================================================
app.get('/', (req: Request, res: Response) => {
    res.status(200).send(`
        <html lang="id">
            <head>
                <title>RSpace Server - Login</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f4f7f9; }
                    .form-container { width: 100%; max-width: 400px; padding: 40px; background-color: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                    h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
                    .input-group { margin-bottom: 20px; }
                    label { display: block; margin-bottom: 8px; color: #34495e; font-weight: 500; }
                    input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 1em; }
                    button { width: 100%; padding: 15px; background: linear-gradient(90deg, #2c3e50, #3498db); color: white; border: none; border-radius: 8px; font-size: 1.1em; font-weight: bold; cursor: pointer; transition: opacity 0.2s; }
                    button:hover { opacity: 0.9; }
                    .message { margin-top: 20px; padding: 10px; border-radius: 5px; text-align: center; word-wrap: break-word; font-size: 0.9em; }
                    .success { background-color: #e8f5e9; color: #2e7d32; }
                    .error { background-color: #ffebee; color: #c62828; }
                    .footer-link { text-align: center; margin-top: 20px; }
                    a { color: #3498db; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="form-container">
                    <h1>🚀 RSpace Server</h1>
                    <form id="login-form">
                        <div class="input-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="input-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <button type="submit">Login</button>
                    </form>
                    <div id="result-message" class="message"></div>
                    <div class="footer-link">
                        <p>Belum punya akun? <a href="/register">Daftar di sini</a></p>
                    </div>
                </div>

                <script>
                    const form = document.getElementById('login-form');
                    const resultDiv = document.getElementById('result-message');

                    form.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        resultDiv.innerHTML = '';
                        resultDiv.className = 'message';

                        const email = form.email.value;
                        const password = form.password.value;

                        try {
                            const response = await fetch('/api/auth/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password })
                            });

                            const data = await response.json();

                            if (response.ok) {
                                resultDiv.className = 'message success';
                                resultDiv.innerHTML = '<strong>Login Berhasil!</strong><br><br>Token:<br>' + data.token;
                            } else {
                                resultDiv.className = 'message error';
                                const errorMessage = data.message || (data.errors ? data.errors[0].msg : 'Terjadi kesalahan.');
                                resultDiv.innerText = errorMessage;
                            }
                        } catch (error) {
                            resultDiv.className = 'message error';
                            resultDiv.innerText = 'Tidak dapat terhubung ke server.';
                        }
                    });
                </script>
            </body>
        </html>
    `);
});

// ==========================================================
// == HALAMAN REGISTRASI BARU (ENDPOINT /register) ==
// ==========================================================
app.get('/register', (req: Request, res: Response) => {
    res.status(200).send(`
         <html lang="id">
            <head>
                <title>RSpace Server - Registrasi</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f4f7f9; }
                    .form-container { width: 100%; max-width: 400px; padding: 40px; background-color: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                    h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
                    .input-group { margin-bottom: 20px; }
                    label { display: block; margin-bottom: 8px; color: #34495e; font-weight: 500; }
                    input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 1em; }
                    button { width: 100%; padding: 15px; background: linear-gradient(90deg, #27ae60, #2ecc71); color: white; border: none; border-radius: 8px; font-size: 1.1em; font-weight: bold; cursor: pointer; transition: opacity 0.2s; }
                    button:hover { opacity: 0.9; }
                    .message { margin-top: 20px; padding: 10px; border-radius: 5px; text-align: center; word-wrap: break-word; font-size: 0.9em; }
                    .success { background-color: #e8f5e9; color: #2e7d32; }
                    .error { background-color: #ffebee; color: #c62828; }
                    .footer-link { text-align: center; margin-top: 20px; }
                    a { color: #3498db; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="form-container">
                    <h1>Buat Akun Baru</h1>
                    <form id="register-form">
                        <div class="input-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="input-group">
                            <label for="password">Password (min. 6 karakter)</label>
                            <input type="password" id="password" name="password" required minlength="6">
                        </div>
                         <div class="input-group">
                            <label for="confirmPassword">Konfirmasi Password</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
                        </div>
                        <button type="submit">Daftar</button>
                    </form>
                    <div id="result-message" class="message"></div>
                    <div class="footer-link">
                        <p>Sudah punya akun? <a href="/">Login di sini</a></p>
                    </div>
                </div>

                <script>
                    const form = document.getElementById('register-form');
                    const resultDiv = document.getElementById('result-message');

                    form.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        resultDiv.innerHTML = '';
                        resultDiv.className = 'message';

                        const email = form.email.value;
                        const password = form.password.value;
                        const confirmPassword = form.confirmPassword.value;

                        if (password !== confirmPassword) {
                            resultDiv.className = 'message error';
                            resultDiv.innerText = 'Password dan konfirmasi password tidak cocok.';
                            return;
                        }

                        try {
                            const response = await fetch('/api/auth/register', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password })
                            });

                            const data = await response.json();

                            if (response.ok) {
                                resultDiv.className = 'message success';
                                resultDiv.innerHTML = '<strong>Registrasi Berhasil!</strong><br>Silakan <a href="/">login</a> untuk melanjutkan.';
                                form.reset();
                            } else {
                                resultDiv.className = 'message error';
                                const errorMessage = data.message || (data.errors ? data.errors[0].msg : 'Terjadi kesalahan.');
                                resultDiv.innerText = errorMessage;
                            }
                        } catch (error) {
                            resultDiv.className = 'message error';
                            resultDiv.innerText = 'Tidak dapat terhubung ke server.';
                        }
                    });
                </script>
            </body>
        </html>
    `);
});

// Gunakan Rute Autentikasi (tanpa middleware keamanan)
app.use('/api', authRoutes);

// Terapkan Middleware Keamanan JWT untuk semua rute di bawah ini
app.use('/api', jwtAuth);

// ... (sisa kode tidak berubah) ...
app.use('/api/rspace', rspaceUploadRoutes);
app.use('/api/rspace', rspaceDownloadRoutes);
app.use('/api/rspace', rspaceFileRoutes);
app.use('/api/perpusku', perpuskuUploadRoutes);
app.use('/api/perpusku', perpuskuDownloadRoutes);
app.use('/api/perpusku', perpuskuFileRoutes);
app.use('/api/discussion', finishedDiscussionUploadRoutes);
app.use('/api/discussion', finishedDiscussionFileRoutes);
app.use('/api/archive', archiveRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (err.message === 'Email sudah terdaftar.' || err.message === 'Email atau password salah.') {
        return res.status(400).json({ type: 'AuthError', message: err.message });
    }

    if (err instanceof MulterError) {
        return res.status(400).json({
            type: 'UploadError',
            message: `Terjadi error saat unggah file: ${err.message}`,
            field: err.field,
        });
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    return res.status(500).json({
        type: 'ServerError',
        message: 'Terjadi kesalahan pada server.',
        error: isDevelopment ? { message: err.message, stack: err.stack } : undefined,
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});