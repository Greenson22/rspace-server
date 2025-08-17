import { Request, Response } from 'express';
import archiver from 'archiver';
import path from 'path';
import { rootPath } from '../config/path';

export const handleDownloadSrc = (req: Request, res: Response) => {
    const sourceDir = path.join(rootPath, 'src');
    const zipFileName = 'src-archive.zip';

    // Set header agar browser tahu ini adalah file download
    res.attachment(zipFileName);

    const archive = archiver('zip', {
        zlib: { level: 9 } // Level kompresi (opsional)
    });

    // Tangani error saat proses pembuatan arsip
    archive.on('error', (err) => {
        throw err;
    });

    // Pipe (salurkan) output arsip ke response HTTP
    // Ini sangat efisien karena tidak menyimpan file zip di server
    archive.pipe(res);

    // Tambahkan folder 'src' ke dalam arsip
    // Argumen kedua (false) berarti isi dari 'src' akan ada di root zip,
    // bukan di dalam folder 'src' di dalam zip.
    archive.directory(sourceDir, false);

    // Selesaikan proses pengarsipan dan kirim
    archive.finalize();
};