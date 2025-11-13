"use client";
import React from 'react';
import DashboardHeader from '@/components/organism/DashboardHeader';
import { useAuth } from '@/context/AuthContext'; 
import NilaiAkhirCard from '@/components/organism/NilaiAkhirCard';
import ProjectInfoCard from '@/components/molecules/ProjectInfoCard';
import TeamMemberCard from '@/components/molecules/TeamMemberCard';


export default function DashboardMahasiswaPage() {
    const { user } = useAuth();
    
    const nilaiData = {
        // Data untuk NilaiAkhirCard
        nilaiAkhir: 'XX',
        scores: {
            project: 'XX',
            uts: 'XX',
            uas: 'XX',
            personal: 'XX',
        }
    };

    const projectData = {
        // Data untuk ProjectInfoCard
        currentScore: 95,
        projectTitle: 'Nama Proyek',
        projectDesc: 'Deskripsi tentang proyek',
        deadline: 'Deadline / Tanggal',
        weeksLeft: '4/14',
        status: 'On Track',
        lastUpdate: 'X Hari lalu',
        
        // Data Anggota Tim
        teamName: 'Kelompok XX',
        teamMembers: [
            { name: 'Nama Lengkap 1', position: 'Ketua Tim', rating: 5, isSelf: true }, 
            { name: 'Nama Lengkap 2', position: 'Anggota', rating: 4, isSelf: false },
            { name: 'Nama Lengkap 3', position: 'Anggota', rating: 5, isSelf: false },
            { name: 'Nama Lengkap 4', position: 'Anggota', rating: 3, isSelf: false },
        ],
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