"use client";
import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/organism/DashboardHeader';
import { useAuth } from '@/context/AuthContext'; 
import NilaiAkhirCard from '@/components/organism/NilaiAkhirCard';
import ProjectInfoCard from '@/components/molecules/ProjectInfoCard';
import TeamMemberCard from '@/components/molecules/TeamMemberCard';
import api from '@/lib/api'; 

export default function DashboardMahasiswaPage() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/dashboard/mahasiswa'); 
                const apiData = response.data.data;
                
                if (!apiData || !apiData.groups || apiData.groups.length === 0) {
                    throw new Error("Data kelompok atau proyek tidak ditemukan.");
                }
                
                setDashboardData(apiData);
                setIsLoading(false);
                
            } catch (err) {
                console.error("Error fetching Mahasiswa dashboard data:", err);
                setError(err.response?.data?.message || "Gagal memuat data dashboard.");
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className="p-4 text-center">Memuat data Dashboard Mahasiswa...</div>;
    }

    if (error || !dashboardData) {
        return <div className="p-4 text-center text-red-600">Error: {error || "Data tidak tersedia."}</div>;
    }

    const groupData = dashboardData.groups[0];
    const projectDetail = groupData.project;
    const teamMembersApi = groupData.anggota;
    
    let nilaiData = { nilaiAkhir: 'N/A', scores: { project: 'N/A', uts: 'N/A', uas: 'N/A', personal: 'N/A' } };
    
    if (dashboardData.grades && typeof dashboardData.grades === 'string' && dashboardData.grades.length > 0) { 
        try {
            const gradesJson = JSON.parse(dashboardData.grades); 
            
            if (gradesJson) {
                nilaiData = {
                    nilaiAkhir: gradesJson.finalScore || 'N/A',
                    scores: {
                        project: gradesJson.project || 'N/A',
                        uts: gradesJson.uts || 'N/A',
                        uas: gradesJson.uas || 'N/A',
                        personal: gradesJson.personal || 'N/A',
                    }
                };
            }
        } catch (e) {
            console.warn("Gagal parsing grades JSON:", e);
        }
    }

    const projectData = {
        currentScore: projectDetail.grade || 'N/A', 
        projectTitle: projectDetail.nama_projek || 'Proyek Tidak Ada Nama',
        projectDesc: projectDetail.deskripsi || 'Deskripsi proyek belum diisi.',
        deadline: projectDetail.updated_at ? new Date(projectDetail.updated_at).toLocaleDateString() : 'N/A',
        weeksLeft: projectDetail.week_period || 'N/A', 
        status: projectDetail.finalized ? 'Finalized' : 'In Progress',
        lastUpdate: projectDetail.updated_at ? new Date(projectDetail.updated_at).toLocaleString() : 'N/A',
        
        teamName: groupData.nama || 'Kelompok Anonim',
        
        teamMembers: teamMembersApi.map(member => ({
            name: member.username || 'Anonim',
            position: member.jabatan || 'Anggota',
            rating: 4, 
            isSelf: user && user.nim === member.nim, 
        })),
    };

    return (
        <>
            <DashboardHeader title={`Dashboard Mahasiswa`}/>
            <main className="mt-6 space-y-8 p-4">                    
                <NilaiAkhirCard 
                    finalScore={nilaiData.nilaiAkhir}
                    scores={nilaiData.scores}
                />
                
                <div className='bg-white p-4 rounded-lg shadow-lg'>
                    {/* Judul Proyek */}
                    <h2 className="text-xl font-semibold text-primary">Proyek : {projectData.projectTitle}</h2>                        
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">                            
                        <ProjectInfoCard 
                            data={projectData} 
                        />

                        <div className="bg-transparent m-6">
                            <h3 className="text-lg font-semibold text-primary mb-4">Anggota Tim ({projectData.teamName})</h3>
                            <div className="space-y-2">
                                {projectData.teamMembers.map((member, index) => (
                                    <TeamMemberCard
                                        key={index}
                                        name={member.name}
                                        position={member.position}
                                        rating={member.rating}
                                        isSelf={member.isSelf}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>                
            </main>
        </>
    )
}