// app/auth/google/callback/page.jsx
"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function GoogleCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuth } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleGoogleCallback = async () => {
            // Ambil token dari URL parameter
            const token = searchParams.get('token');

            if (!token) {
                setError('Token tidak ditemukan. Login gagal.');
                setTimeout(() => router.push('/login'), 3000);
                return;
            }

            try {
                // Set token ke header untuk request profile
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Fetch user profile dari backend
                const response = await api.get('/profile');
                const { user } = response.data.data;

                // Tentukan role dari user data
                const role = user.role; // atau sesuaikan dengan struktur response backend-mu

                // Simpan ke state global
                const newAuth = { user, token, role };
                setAuth(newAuth);

                // Simpan ke localStorage
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);

                // Redirect berdasarkan role
                const redirect = {
                    dosen: '/dashboard/dosen',
                    mahasiswa: '/dashboard/mahasiswa',
                    asisten: '/dashboard/asisten',
                }[role] || '/dashboard';

                router.push(redirect);

            } catch (err) {
                console.error('Error saat fetch profile:', err);
                setError('Gagal memuat data user. Silakan login kembali.');
                setTimeout(() => router.push('/login'), 3000);
            }
        };

        handleGoogleCallback();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-gradient-to-b to-login-end from-login-start flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                {error ? (
                    <>
                        <div className="mb-4">
                            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Gagal</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <p className="text-sm text-gray-500">Mengalihkan ke halaman login...</p>
                    </>
                ) : (
                    <>
                        <div className="mb-6">
                            <div className="animate-spin h-16 w-16 border-b-4 border-primary rounded-full mx-auto"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Memproses Login</h2>
                        <p className="text-gray-600">Mohon tunggu sebentar...</p>
                    </>
                )}
            </div>
        </div>
    );
}