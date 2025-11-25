"use client";
import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/organism/DashboardHeader';
import { useAuth } from '@/context/AuthContext'; 
import StatCard from '@/components/molecules/StatCard';
import NavCard from '@/components/molecules/NavCard';
import api from '@/lib/api'; 

export default function DashboardDosenPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        jumlah_mahasiswa: 0,
        jumlah_asisten: 0,
        jumlah_proyek: 0,
        rata_rata: "0%",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('dashboard/dosen');                 
                const apiData = response.data.data;

                setStats({
                    jumlah_mahasiswa: apiData.jumlah_mahasiswa || 0,
                    jumlah_asisten: apiData.jumlah_asisten || 0,
                    jumlah_proyek: apiData.jumlah_proyek || 0,
                    rata_rata: apiData.rata_rata || "0%", 
                });
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Gagal memuat data dashboard. Mohon coba lagi.");
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className="p-4 text-center">Memuat data dashboard...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-600">{error}</div>;
    }
    
    return (
        <>
            <DashboardHeader title={`Dashboard Dosen`}/>                        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <StatCard 
                    title="Mahasiswa Terdaftar" 
                    value={stats.jumlah_mahasiswa}
                    iconColor="bg-primary"
                    gradientStart="from-primary" 
                    gradientEnd="to-secondary"    
                />
                
                <StatCard 
                    title="Jumlah Asisten Praktikum" 
                    value={stats.jumlah_asisten} 
                    iconColor="bg-secondary"
                    gradientStart="from-primary" 
                    gradientEnd="to-secondary"    
                />
                
                <StatCard 
                    title="Total Proyek" 
                    value={stats.jumlah_proyek} 
                    iconColor="bg-primary"
                    gradientStart="from-secondary" 
                    gradientEnd="to-primary"    
                />

                <StatCard 
                    title="Rata-rata Progres" 
                    value={stats.rata_rata} 
                    iconColor="bg-secondary"
                    gradientStart="from-primary" 
                    gradientEnd="to-secondary"    
                />
            </div>

            <div className="m-4">
                <div className="bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-12 rounded-lg">
                    
                    {/* Card 1: Proyek & Kelompok */}
                    <NavCard 
                        title="Proyek & Kelompok" 
                        href="/dashboard/data-proyek" 
                    />
                    
                    {/* Card 2: Matriks Nilai */}
                    <NavCard 
                        title="Matriks Nilai" 
                        href="/dashboard/matriks-nilai" 
                    />
                    
                    {/* Card 3: Laporan Progres */}
                    <NavCard 
                        title="Laporan Progres" 
                        href="/dashboard/laporan-progres" 
                    />
                    
                </div>
            </div>
        </>
    );
}