import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-indigo-600 tracking-tight">
            RSpace
          </h1>
          <p className="text-2xl text-gray-700 font-medium">
            Manajemen Arsip & Data Terpusat
          </p>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Platform all-in-one untuk mengelola arsip diskusi, mencadangkan file penting dari berbagai sumber, 
            dan manajemen pengguna yang efisien. Aman, cepat, dan mudah digunakan.
          </p>
        </div>

        {/* Action Buttons */}
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

        {/* Footer Info */}
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