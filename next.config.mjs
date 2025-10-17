/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan fungsi rewrites di sini
    async rewrites() {
        return [
        {
            // Source: Alamat yang dipanggil di kode Next.js (frontend)
            source: '/api/backend/:path*', 
            
            // Destination: Alamat tujuan di server Laravel (backend)
            // PASTIKAN ini adalah HTTP dan port 8000
            destination: 'http://127.0.0.1:8000/api/:path*', 
        },
        ];
    },
    };

export default nextConfig;