#!/bin/bash

# Nama folder tujuan
TARGET_DIR="sementara"

echo "--- Memulai proses penyalinan ---"

# 1. Reset folder tujuan (Hapus jika ada, lalu buat baru)
# Ini memastikan folder 'sementara' selalu bersih sebelum diisi
if [ -d "$TARGET_DIR" ]; then
    rm -rf "$TARGET_DIR"
fi
mkdir -p "$TARGET_DIR"

# 2. Menyalin folder 'src' (yang ada di root)
if [ -d "src" ]; then
    echo "Menyalin folder 'src'..."
    cp -r "src" "$TARGET_DIR/"
else
    echo "⚠️  Peringatan: Folder 'src' tidak ditemukan."
fi

# 3. Menyalin folder 'client/src'
if [ -d "client/src" ]; then
    echo "Menyalin folder 'client/src'..."
    
    # Kita perlu membuat folder 'client' dulu di dalam 'sementara'
    # agar strukturnya tetap terjaga (sementara/client/src)
    mkdir -p "$TARGET_DIR/client"
    
    cp -r "client/src" "$TARGET_DIR/client/"
else
    echo "⚠️  Peringatan: Folder 'client/src' tidak ditemukan."
fi

echo "--- Selesai! Cek folder '$TARGET_DIR' ---"