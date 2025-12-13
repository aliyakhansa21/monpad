"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; 
import api from "@/lib/api";

export default function GoogleCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { handleGoogleCallback } = useAuth(); 

    useEffect(() => {
        const fullTokenString = searchParams.get("token");

        if (!fullTokenString) {
            router.replace("/login");
            return;
        }

        const handleLogin = async () => {
            let actualToken = null;
            try {
                const tokenParts = fullTokenString.split('|');
                actualToken = tokenParts.length > 1 ? tokenParts[1] : fullTokenString;
                
                if (!actualToken) throw new Error("Token tidak dapat diekstrak.");

                localStorage.setItem("token", actualToken); 
                
                const res = await api.get("/profile");                 
                const { user, role, token: finalToken } = res.data.data;

                handleGoogleCallback({ user, token: finalToken, role });              

            } catch (err) {
                console.error("Kesalahan dalam Proses Google Callback / Profile:", err);
                localStorage.clear();
                router.replace("/login");
            }
        };

        handleLogin();
        
    }, [searchParams, router, handleGoogleCallback]); 
    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-lg font-semibold text-blue-600">
                Login dengan Google berhasil, memuat sesi...
            </p>
        </div>
    );
}