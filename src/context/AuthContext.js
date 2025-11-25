"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import apiAuth from "@/lib/apiAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const router = useRouter();

    const [auth, setAuth] = useState({
        user: null,
        token: null,
        role: null,
    });

    const [isLoading, setIsLoading] = useState(true);

    // restore session dari localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");

        if (savedUser && savedToken && savedRole) {
            setAuth({
                user: JSON.parse(savedUser),
                token: savedToken,
                role: savedRole,
            });
        }

        setIsLoading(false);
    }, []);

    // auto logout jika 401
    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (res) => res,
            (err) => {
                if (err.response?.status === 401) {
                    logout(true);
                }
                return Promise.reject(err);
            }
        );

        return () => api.interceptors.response.eject(interceptor);
    }, []);

    // login
    const login = async (credentials) => {
        try {
            const res = await apiAuth.post("/login", credentials);

            const { user, token, role } = res.data.data;

            // simpan state global
            const newAuth = { user, token, role };
            setAuth(newAuth);

            // simpan ke localStorage
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            // redirect berdasar role
            const redirect = {
                dosen: "/dashboard/dosen",
                mahasiswa: "/dashboard/mahasiswa",
                asisten: "/dashboard/asisten",
            }[role] || "/dashboard";

            router.push(redirect);
        } catch (err) {
            const msg = err.response?.data?.message || "Login gagal";
            throw new Error(msg);
        }
    };

    // logout
    const logout = (redirect = true) => {
        setAuth({ user: null, token: null, role: null });
        localStorage.clear();

        if (redirect) router.push("/login");
    };

    // value yang dipake dihalaman lain
    const value = useMemo(
        () => ({
            user: auth.user,
            token: auth.token,
            role: auth.role,
            isLoggedIn: !!auth.token,
            login,
            logout,
        }),
        [auth]
    );

    // loader
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <div className="animate-spin h-10 w-10 border-b-4 border-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600 mt-3">Memeriksa sesi...</p>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth harus di dalam AuthProvider");
    return ctx;
};
