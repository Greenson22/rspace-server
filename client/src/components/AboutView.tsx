// rspace_server/client/src/components/AboutView.tsx
"use client";

const AboutView = () => {
    return (
        <div className="p-8 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tentang Aplikasi RSpace
            </h2>
            <div className="space-y-4 text-gray-700">
                <p>
                    Selamat datang di RSpace, platform terpusat Anda untuk manajemen data dan arsip.
                </p>
                <p>
                    Aplikasi ini dirancang untuk menyederhanakan cara Anda berinteraksi dengan berbagai jenis data, mulai dari arsip diskusi hingga cadangan file penting. Dengan antarmuka yang bersih dan fungsionalitas yang kuat, kami bertujuan untuk meningkatkan produktivitas dan efisiensi alur kerja Anda.
                </p>
                <p>
                    Versi: <strong>1.0.0</strong>
                </p>
            </div>
        </div>
    );
};

export default AboutView;