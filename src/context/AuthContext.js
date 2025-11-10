"use client";
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api'; // api.js (dengan interceptor)
import apiAuth from '@/lib/apiAuth'; // apiAuth.js (tanpa interceptor, untuk login/register)

const AuthContext = createContext(null);

const API_BASE_URL = 'https://simpad.novarentech.web.id/api/';

export function AuthProvider({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    const loadUserFromStorage = () => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {                
                api.get('auth/me') 
                    .then(response => {
                        setUser({ 
                            ...response.data, 
                            isLoggedIn: true, 
                            token 
                        });
                    })
                    .catch(err => {
                        localStorage.removeItem('authToken');
                        setUser(null);
                        console.error("Token invalid/expired:", err);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            } else {
                setUser(null);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error loading user:", error);
            setUser(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUserFromStorage();
    }, []);

    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const response = await apiAuth.post('login', credentials);             
            const { token, user: userData } = response.data;

            console.log("LOGIN BERHASIL! Token yang diterima:", token); 
            console.log("Data User:", userData);

            localStorage.setItem('authToken', token);

            setUser({ 
                ...userData, 
                isLoggedIn: true, 
                token 
            });

            router.push('/dashboard');
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Login gagal. Coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
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
    }), [user, isLoading]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Memuat sesi...</p> 
            </div>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
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