"use client";
import React, { useState, useEffect } from 'react'; 
import DashboardHeader from '@/components/organism/DashboardHeader';
import { useAuth } from '@/context/AuthContext'; 
import StatCard from '@/components/molecules/StatCard';
import NavCardAsisten from '@/components/molecules/NavCardAsisten';
import api from '@/lib/api';

export default function DashboardAsistenPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        jumlah_mahasiswa: '...',
        rata_rata: '...',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/dashboard/asisten');                 
                const apiData = response.data.data;

                setStats({
                    jumlah_mahasiswa: apiData.jumlah_mahasiswa || 0,
                    rata_rata: apiData.rata_rata || "0%", 
                });
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching Asisten dashboard data:", err);
                setError(err.response?.data?.message || "Gagal memuat data dashboard. Token mungkin invalid.");
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className="p-4 text-center">Memuat data statistik...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-600">Error: {error}</div>;
    }
    
    return (
        <>
            <DashboardHeader title={`Dashboard Asisten`}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <StatCard
                    title="Jumlah Mahasiswa"
                    value={stats.jumlah_mahasiswa} 
                    iconColor='bg-secondary'
                    gradientStart='from-primary'
                    gradientEnd='to-secondary'
                />

                <StatCard
                    title="Rata-rata Progres"
                    value={stats.rata_rata} 
                    iconColor='bg-secondary'
                    gradientStart='from-primary'
                    gradientEnd='to-secondary'
                />
            </div>

            <div className="m-2">
                <div className="bg-transparent grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-12 rounded-lg">
                    
                    {/* Card 1: List Proyek */}
                    <NavCardAsisten
                        title="List Proyek"
                        href="/dashboard/list-proyek"    
                        buttonColorClass="bg-primary"
                        buttonHoverHexColor="#291b3e"
                    />

                    {/* Card 2: Presensi Peserta */}
                    <NavCardAsisten
                        title="Presensi Peserta"
                        href="/dashboard/presensi-peserta"
                        buttonColorClass="bg-secondary"
                        buttonHoverHexColor="#32475a"
                    />

                    {/* Card 3: Penilaian Progres */}
                    <NavCardAsisten
                        title="Penilaian Progres"
                        href="/dashboard/penilaian-progres"
                        buttonColorClass="bg-secondary"
                        buttonHoverHexColor="#32475a"
                    />

                    {/* Card 4: Laporan Mingguan */}
                    <NavCardAsisten
                        title="Laporan Mingguan"
                        href="/dashboard/laporan-mingguan"
                        buttonColorClass="bg-primary"
                        buttonHoverHexColor="#291b3e"
                    />
                </div>
            </div>
        </>
    )
}