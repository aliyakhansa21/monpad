"use client";
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; 
import apiAuth from '@/lib/apiAuth'; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null); 
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    const detectRoleAndRedirect = async (tokenData) => {
        if (!tokenData) {
            setRole(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const dosenCheck = await api.get("/dosen", {
                validateStatus: (status) => status >= 200 && status < 500, 
            });

            if (dosenCheck.status === 200) {
                setRole("dosen");
                localStorage.setItem("role", "dosen");
                console.log("🔍 Role terdeteksi: dosen. Redirecting...");
                router.push("/dashboard/dosen");
                return;
            }

            const asistenCheck = await api.get("/week", {
                validateStatus: (status) => status >= 200 && status < 500,
            });

            if (asistenCheck.status === 200) {
                setRole("asisten");
                localStorage.setItem("role", "asisten");
                console.log("🔍 Role terdeteksi: asisten. Redirecting...");
                router.push("/dashboard/asisten");
                return;
            }
        
            setRole("mahasiswa");
            localStorage.setItem("role", "mahasiswa");
            console.log("🔍 Role default: mahasiswa. Redirecting...");
            router.push("/dashboard/mahasiswa");

        } catch (error) {
            console.error("❌ Error saat deteksi role:", error);
            logout(false); 
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));            
            detectRoleAndRedirect(savedToken); 
        } else {
            setToken(null);
            setUser(null);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && !error.config.url.includes('login')) {
                    console.error("❌ 401 Unauthorized Global: Token expired/invalid. Logging out.");
                    logout(true); 
                }
                return Promise.reject(error);
            }
        );
        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [router]);


    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const res = await apiAuth.post("/login", credentials);

            const userData = res.data.data.user;
            const tokenData = res.data.data.token;

            setUser(userData);
            setToken(tokenData);

            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("token", tokenData);

            await detectRoleAndRedirect(tokenData);
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const logout = (doRedirect = true) => {
        setUser(null);
        setToken(null);
        setRole(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        if (doRedirect) {
            router.push("/login");
        }
    };

    const value = useMemo (
        () => ({
            user,
            token,
            role,
            isLoading,
            isLoggedIn: !!user,
            login,
            logout,
        }),
        [user, token, role, isLoading]
    );

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Memeriksa sesi...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider');
    }
    return context;
};