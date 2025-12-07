"use client";
import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/organism/DashboardHeader';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const StatDetail = ({ title, value }) => (
    <div className="text-center p-4 rounded-xl bg-white/40 backdrop-blur-sm">
        <p className="text-xs font-medium text-primary mb-1">{title}</p>
        <p className="text-3xl font-bold text-primary">{value}</p>
    </div>
);

export default function NilaiAkhirPage() {
    const { user } = useAuth();
    const [nilaiData, setNilaiData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNilaiData = async () => {
            try {
                const response = await api.get('/dashboard/mahasiswa');
                const apiData = response.data.data;

                let parsedNilai = {
                    nilaiAkhir: 'N/A',
                    scores: {
                        project: 'N/A',
                        personal: 'N/A',
                        skill: 'N/A',
                        keadilan: 'N/A',
                        kerjasama: 'N/A',
                        kredibilitas: 'N/A'
                    },
                    confirmed: false
                };

                // Cek apakah ada data grades
                if (apiData.grades) {
                    const grades = apiData.grades;

                    // Ambil nilai akhir
                    parsedNilai.nilaiAkhir = grades.final_grade || 'N/A';
                    
                    // Ambil nilai project
                    parsedNilai.scores.project = grades.project_grade !== undefined && grades.project_grade !== null 
                        ? grades.project_grade 
                        : 'N/A';
                    
                    // Ambil nilai personal
                    parsedNilai.scores.personal = grades.personal_grade || 'N/A';

                    // Parse member_grade untuk mendapatkan komponen detail
                    if (grades.member_grade && typeof grades.member_grade === 'object') {
                        const memberGrade = grades.member_grade;
                        
                        // Ambil nilai dari member_grade
                        parsedNilai.scores.skill = memberGrade.skill !== undefined && memberGrade.skill !== null
                            ? memberGrade.skill
                            : 'N/A';
                        
                        parsedNilai.scores.keadilan = memberGrade.keadilan !== undefined && memberGrade.keadilan !== null
                            ? memberGrade.keadilan
                            : 'N/A';
                        
                        parsedNilai.scores.kerjasama = memberGrade.kerjasama !== undefined && memberGrade.kerjasama !== null
                            ? memberGrade.kerjasama
                            : 'N/A';
                        
                        parsedNilai.scores.kredibilitas = memberGrade.kredibilitas !== undefined && memberGrade.kredibilitas !== null
                            ? memberGrade.kredibilitas
                            : 'N/A';
                    }

                    // Status konfirmasi
                    parsedNilai.confirmed = grades.confirmed === 1;
                }

                setNilaiData(parsedNilai);
                setIsLoading(false);

            } catch (err) {
                console.error("Error fetching nilai data:", err);
                setError(err.response?.data?.message || "Gagal memuat data nilai.");
                setIsLoading(false);
            }
        };

        fetchNilaiData();
    }, []);

    if (isLoading) {
        return (
            <>
                <DashboardHeader title="Nilai Akhir Mahasiswa" />
                <div className="p-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2">Memuat data nilai...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <DashboardHeader title="Nilai Akhir Mahasiswa" />
                <div className="p-4 text-center text-red-600">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            </>
        );
    }

    if (!nilaiData) {
        return (
            <>
                <DashboardHeader title="Nilai Akhir Mahasiswa" />
                <div className="p-4 text-center text-gray-600">
                    <p>Data nilai belum tersedia.</p>
                    <p className="text-sm mt-2">Silakan hubungi dosen atau asisten jika ada pertanyaan.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <DashboardHeader title="Nilai Akhir Mahasiswa" />
            <main className="mt-6 space-y-8 p-4">
                {nilaiData.confirmed && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                        <p className="font-semibold">✓ Nilai sudah dikonfirmasi</p>
                    </div>
                )}

                <div className="bg-gradient-to-br from-purple-200 via-purple-300 to-blue-200 p-8 rounded-2xl shadow-lg">
                    <div className="flex justify-center items-center mb-6">
                        <div className="text-center">
                            <div className="text-7xl font-bold text-primary mb-2">
                                {nilaiData.nilaiAkhir}
                            </div>
                            <h2 className="text-xl font-semibold text-primary">
                                Nilai Akhir
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <StatDetail title="Nilai Proyek" value={nilaiData.scores.project} />
                        <StatDetail title="Nilai Personal" value={nilaiData.scores.personal} />
                    </div>

                    <div className="border-t-2 border-white/50 my-6"></div>

                    <h3 className="text-lg font-semibold text-primary text-center mb-4">
                        Komponen Penilaian Personal
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatDetail title="Skill" value={nilaiData.scores.skill} />
                        <StatDetail title="Keadilan" value={nilaiData.scores.keadilan} />
                        <StatDetail title="Kerjasama" value={nilaiData.scores.kerjasama} />
                        <StatDetail title="Kredibilitas" value={nilaiData.scores.kredibilitas} />
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-semibold mb-1">Informasi:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Nilai Akhir dihitung dari kombinasi nilai proyek dan nilai personal</li>
                        <li>Nilai personal terdiri dari skill, keadilan, kerjasama, dan kredibilitas</li>
                        <li>Jika ada nilai yang masih N/A, artinya belum dinilai oleh dosen/asisten</li>
                    </ul>
                </div>
            </main>
        </>
    );
}