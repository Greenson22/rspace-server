import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import uploadRoutes from './routes/upload.routes'; // Impor rute

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Gunakan Rute
app.use('/api', uploadRoutes); // Prefix '/api' adalah praktik umum

// Penanganan Error Global (untuk menangkap error dari multer, dll)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(400).json({ error: err.message });
});


app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});