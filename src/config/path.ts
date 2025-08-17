// src/config/path.ts

import path from 'path';

// __dirname akan berada di 'dist/config' setelah kompilasi.
// Kita naik dua level ('..', '..') untuk mencapai root proyek.
export const rootPath = path.resolve(__dirname, '..', '..');