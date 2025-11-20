"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import apiAuth from "@/lib/apiAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        const savedRole = localStorage.getItem("role");

        if (savedToken && savedUser && savedRole) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setRole(savedRole);
        }

        setIsLoading(false); 
    }, []);  

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            res => res,
            err => {
                if (err.response?.status === 401) {
                    logout(true);
                }
                return Promise.reject(err);
            }
        );
        return () => api.interceptors.response.eject(interceptor);
    }, []);


    const login = async (credentials) => {
        try {
            const res = await apiAuth.post("/login", credentials);
            const { token, user, role } = res.data.data;

            setUser(user);
            setToken(token);
            setRole(role);

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            const redirect = {
                dosen: "/dashboard/dosen",
                mahasiswa: "/dashboard/mahasiswa",
                asisten: "/dashboard/asisten",
            }[role] || "/dashboard";

            router.push(redirect);
        } 
        catch (err) {
            const msg = err.response?.data?.message || "Login gagal";
            throw new Error(msg);
        }
    };

    const logout = (redirect = true) => {
        setUser(null);
        setToken(null);
        setRole(null);

        localStorage.clear();

        if (redirect) router.push("/login");
    };

    const value = useMemo(() => ({
        user,
        token,
        role,
        isLoggedIn: !!token,
        login,
        logout,
    }), [user, token, role]);

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <div className="animate-spin h-10 w-10 border-b-4 border-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600 mt-3">Memeriksa sesi...</p>
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
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth harus di dalam AuthProvider");
    return ctx;
};
