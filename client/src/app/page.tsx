"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  // State untuk Modal Pengaturan
  const [showSettings, setShowSettings] = useState(false);
  const [useManual, setUseManual] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [currentEnvUrl, setCurrentEnvUrl] = useState('');

  // Saat halaman dimuat, cek LocalStorage dan Env
  useEffect(() => {
    // Ambil URL dari env
    const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    setCurrentEnvUrl(envUrl);

    // Cek apakah ada settingan tersimpan
    const storedUrl = localStorage.getItem('custom_api_url');
    if (storedUrl) {
      setUseManual(true);
      setManualUrl(storedUrl);
    } else {
      setUseManual(false);
      setManualUrl(envUrl);
    }
  }, []);

  // Fungsi Simpan Pengaturan
  const handleSaveSettings = () => {
    if (useManual) {
      // Validasi sederhana
      let urlToSave = manualUrl.trim();
      // Pastikan tidak diakhiri slash agar konsisten
      if (urlToSave.endsWith('/')) {
        urlToSave = urlToSave.slice(0, -1);
      }
      
      localStorage.setItem('custom_api_url', urlToSave);
      alert(`Berhasil! Aplikasi sekarang menggunakan API: ${urlToSave}`);
    } else {
      // Hapus dari storage agar kembali menggunakan env
      localStorage.removeItem('custom_api_url');
      alert(`Berhasil! Aplikasi kembali menggunakan Default (.env): ${currentEnvUrl}`);
    }
    setShowSettings(false);
    // Reload halaman agar perubahan efeknya terasa (opsional, tapi disarankan)
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center p-6 relative">
      
      {/* Tombol Pengaturan di Pojok Kanan Atas */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-full shadow-md hover:bg-gray-100 transition-colors text-sm font-medium border border-gray-200"
        >
          <span>⚙️</span> Pengaturan API
        </button>
      </div>

      {/* MODAL PENGATURAN */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Konfigurasi Server API</h3>
            
            <div className="space-y-4">
              {/* Pilihan 1: Default Env */}
              <label className="flex items-start space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="api_source" 
                  className="mt-1"
                  checked={!useManual}
                  onChange={() => setUseManual(false)}
                />
                <div>
                  <span className="font-semibold text-gray-800">Gunakan Default (.env)</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Menggunakan konfigurasi bawaan laptop/server.<br/>
                    <span className="font-mono bg-gray-100 px-1 rounded">{currentEnvUrl}</span>
                  </p>
                </div>
              </label>

              {/* Pilihan 2: Manual Input */}
              <label className="flex items-start space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="api_source" 
                  className="mt-1"
                  checked={useManual}
                  onChange={() => setUseManual(true)}
                />
                <div className="w-full">
                  <span className="font-semibold text-gray-800">Input Manual (IP Address)</span>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    Gunakan ini jika akses dari HP/Device lain.
                  </p>
                  <input 
                    type="text" 
                    disabled={!useManual}
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="http://192.168.1.X:3001/api"
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none ${!useManual ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-900'}`}
                  />
                </div>
              </label>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md text-sm font-medium"
              >
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KONTEN UTAMA HALAMAN (Tidak berubah banyak) */}
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-indigo-600 tracking-tight">
            RSpace
          </h1>
          <p className="text-2xl text-gray-700 font-medium">
            Manajemen Arsip & Data Terpusat
          </p>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Platform all-in-one untuk mengelola arsip diskusi, mencadangkan file penting dari berbagai sumber, 
            dan manajemen pengguna yang efisien.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Masuk Sekarang
          </Link>
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-3 bg-white text-indigo-600 border border-indigo-200 font-semibold rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Buat Akun Baru
          </Link>
        </div>

        <div className="pt-12 mt-12 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <span className="block text-2xl mb-2">📂</span>
            <strong className="block text-gray-900 mb-1">Arsip Diskusi</strong>
            Simpan dan telusuri riwayat diskusi dengan mudah.
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <span className="block text-2xl mb-2">💾</span>
            <strong className="block text-gray-900 mb-1">Cadangan Data</strong>
            Integrasi backup dari berbagai sumber data.
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <span className="block text-2xl mb-2">🔒</span>
            <strong className="block text-gray-900 mb-1">Aman & Terkontrol</strong>
            Sistem login aman dengan verifikasi pengguna.
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} RSpace System. All rights reserved.
        </p>
      </div>
    </div>
  );
}