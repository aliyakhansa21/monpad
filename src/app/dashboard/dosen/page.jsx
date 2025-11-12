"use client";
import React from 'react';
import DashboardHeader from '@/components/organism/DashboardHeader';
import { useAuth } from '@/context/AuthContext'; 
import StatCard from '@/components/molecules/StatCard';
import NavCard from '@/components/molecules/NavCard';

export default function DashboardDosenPage() {
    const { user } = useAuth();    
    return (
        <>
            <DashboardHeader title={`Dashboard Dosen`}/>                        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <StatCard 
                    title="Mahasiswa Terdaftar" 
                    value={100}
                    iconColor="bg-primary"
                    gradientStart="from-primary" 
                    gradientEnd="to-secondary"    
                />
                
                <StatCard 
                    title="Jumlah Asisten Praktikum" 
                    value={8}
                    iconColor="bg-secondary"
                    gradientStart="from-primary" 
                    gradientEnd="to-secondary"    
                />
                
                <StatCard 
                    title="Total Proyek" 
                    value={24}
                    iconColor="bg-primary"
                    gradientStart="from-secondary" 
                    gradientEnd="to-primary"    
                />

                <StatCard 
                    title="Rata-rata Progres" 
                    value="76%"
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