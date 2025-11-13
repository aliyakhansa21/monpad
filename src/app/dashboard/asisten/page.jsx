"use client";
import React from 'react';
import DashboardHeader from '@/components/organism/DashboardHeader';
import { useAuth } from '@/context/AuthContext'; 
import StatCard from '@/components/molecules/StatCard';
import NavCardAsisten from '@/components/molecules/NavCardAsisten';

export default function DashboardAsistenPage() {
    const { user } = useAuth();
    return (
        <>
            <DashboardHeader title={`Dashboard Asisten`}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <StatCard
                    title="Jumlah Mahasiswa"
                    value={100}
                    iconColor='bg-secondary'
                    gradientStart='from-primary'
                    gradientEnd='to-secondary'
                />

                <StatCard
                    title="Rata-rata Progres"
                    value="52%"
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