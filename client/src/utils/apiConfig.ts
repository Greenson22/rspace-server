// src/utils/apiConfig.ts

export const getApiUrl = (): string => {
    // Cek apakah kode berjalan di browser (client-side)
    if (typeof window !== 'undefined') {
        const customUrl = localStorage.getItem('custom_api_url');
        if (customUrl) {
            return customUrl;
        }
    }
    
    // Jika tidak ada custom URL, gunakan default dari .env
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};