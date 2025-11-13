"use client";
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; // api.js (dengan interceptor)
import apiAuth from '@/lib/apiAuth'; // apiAuth.js (tanpa interceptor, untuk login/register)

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    const loadUserFromStorage = async () => {
        try {
            const token = localStorage.getItem('authToken');
            
            if (token && typeof token === 'string' && token.length > 10) {  
                try {
                    const response = await api.get('auth/me');
                    
                    setUser({ 
                        ...response.data, 
                        isLoggedIn: true, 
                        token 
                    });
                    
                    console.log("✅ User berhasil dimuat dari storage:", response.data);
                } catch (err) {
                    console.error("❌ Token invalid/expired:", err.response?.data?.message || err.message);
                    localStorage.removeItem('authToken');
                    setUser(null);
                }
            } else {
                console.log("⚠️ Token tidak ditemukan atau tidak valid");
                localStorage.removeItem('authToken'); 
                setUser(null);
            }
        } catch (error) {
            console.error("❌ Error loading user:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUserFromStorage();
    }, []); 

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && !error.config.url.includes('login')) {
                    console.error("❌ 401 Unauthorized - Token expired/invalid");                    
                    localStorage.removeItem('authToken');
                    setUser(null);                     
                    router.push('/login');
                }
                return Promise.reject(error);
            }
        );
        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, [router]);

    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const response = await apiAuth.post('login', credentials);            
            console.log("📥 Response dari server:", response.data);            
            let token, userData;
            
            // Cek berbagai struktur response yang mungkin
            if (response.data.token) {
                // Format 1: { token: "xxx", user: {...} }
                token = response.data.token;
                userData = response.data.user || response.data;
            } else if (response.data.data?.token) {
                // Format 2: { data: { token: "xxx", user: {...} } }
                token = response.data.data.token;
                userData = response.data.data.user || response.data.data;
            } else if (response.data.access_token) {
                // Format 3: { access_token: "xxx", user: {...} }
                token = response.data.access_token;
                userData = response.data.user || response.data;
            } else {
                console.error("❌ Struktur response tidak dikenali:", response.data);
                throw new Error('Login gagal: Format response server tidak sesuai.');
            }

            if (!token || typeof token !== 'string' || token.trim().length === 0) {
                console.error("❌ LOGIN GAGAL: Token tidak valid atau kosong");
                console.error("Token yang diterima:", token);
                throw new Error('Login gagal: Server tidak memberikan token yang valid.');
            }
            
            console.log("✅ LOGIN BERHASIL!");
            console.log("✅ Token diterima:", token.substring(0, 30) + "..."); 
            console.log("✅ Data User:", userData);

            localStorage.setItem('authToken', token);
            setUser({ 
                ...(userData || {}), 
                isLoggedIn: true, 
                token 
            });

            //const userRole = userData.role; 
            // const userRole = userData.user?.role || userData.role; 

            // Tambahkan ini untuk melihat semua properti user
            // console.log("✅ USER OBJECT DENGAN ROLE:", userData.user);

            const detectUserRole = async (token) => {
                const headers = {Authorization: `Bearer ${token}`};
                try {
                    await apiAuth.get('/dosen', {headers});
                    console.log("🔍 Role terdeteksi: dosen");
                    return 'dosen';
                } catch (e1) {
                    console.log("🔍 Bukan dosen, mencoba asisten...");
                }

                try {
                    await apiAuth.get('/week', {headers});
                    console.log("🔍 Role terdeteksi: asisten");
                    return 'asisten';
                } catch (e2) {
                    console.log("🔍 Bukan asisten, mencoba mahasiswa...");
                }
                return 'mahasiswa';
            }

            let userRole = userData.user?.role || userData.role;
            let userProfile = userData.user || userData;

            if (!userRole) {
                console.log("Deketeksi role user lewat probing endpoint...");
                
                const roleString = await detectUserRole(token); 
                userRole = roleString;                 
                userProfile = { ...userProfile, role: userRole };
            }

            localStorage.setItem('authToken', token);

            setUser({ 
                ...(userProfile || {}), 
                isLoggedIn: true, 
                token 
            });

            let dashboardPath = '/dashboard/default'; 

            switch (userRole) {
                case 'dosen':
                    dashboardPath = '/dashboard/dosen';
                    break;
                case 'asisten':
                    dashboardPath = '/dashboard/asisten';
                    break;
                case 'mahasiswa':
                    dashboardPath = '/dashboard/mahasiswa';
                    break;
                default:
                    console.warn(`Role '${userRole}' tidak dikenali. Mengarahkan ke default.`);
                    dashboardPath = '/login'; 
                    break;
            }

            router.push(dashboardPath);            
            return response.data;

            // // Redirect ke matriks-nilai (sementara karena dashboard belum dibuat)
            // router.push('/dashboard/mahasiswa');
            
        } catch (error) {
            console.error("❌ Login failed:", error);
            console.error("❌ Error response:", error.response?.data);            
            localStorage.removeItem('authToken');
            
            if (error.message.includes('Format response')) {
                throw error; 
            }
            
            const errorMessage = error.response?.data?.message || 'Login gagal. Periksa email dan password Anda.';
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        console.log("🚪 Logging out...");        
        localStorage.removeItem('authToken');        
        setUser(null);        
        router.push('/login');
    };

    const contextValue = useMemo(() => ({
        user,
        isLoading,
        isLoggedIn: !!user, 
        login,
        logout,
        userName: user?.name || 'Tamu',
        userRole: user?.role || 'tamu',
        userRoleTitle: user?.role_title || user?.role || 'Pengguna'
    }), [user, isLoading]);

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-background-light">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-gray-600">Memuat sesi...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook untuk menggunakan AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider');
    }
    return context;
};