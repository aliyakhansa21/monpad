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
                // Sementara menggunakan data dari dashboard mahasiswa
                const response = await api.get('/dashboard/mahasiswa');
                const apiData = response.data.data;

                let parsedNilai = {
                    nilaiAkhir: 'N/A',
                    scores: {
                        project: 'N/A',
                        uts: 'N/A',
                        uas: 'N/A',
                        personal: 'N/A',
                        skill: 'N/A',
                        keadilan: 'N/A',
                        kerjasama: 'N/A',
                        kredibilitas: 'N/A'
                    }
                };

                if (apiData.grades && typeof apiData.grades === 'string' && apiData.grades.length > 0) {
                    try {
                        const gradesJson = JSON.parse(apiData.grades);
                        if (gradesJson) {
                            parsedNilai = {
                                nilaiAkhir: gradesJson.finalScore || 'N/A',
                                scores: {
                                    project: gradesJson.project || 'N/A',
                                    uts: gradesJson.uts || 'N/A',
                                    uas: gradesJson.uas || 'N/A',
                                    personal: gradesJson.personal || 'N/A',
                                    skill: gradesJson.skill || 'N/A',
                                    keadilan: gradesJson.keadilan || 'N/A',
                                    kerjasama: gradesJson.kerjasama || 'N/A',
                                    kredibilitas: gradesJson.kredibilitas || 'N/A',
                                }
                            };
                        }
                    } catch (e) {
                        console.warn("Gagal parsing grades JSON:", e);
                    }
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
                <div className="p-4 text-center">Memuat data nilai...</div>
            </>
        );
    }

    if (error || !nilaiData) {
        return (
            <>
                <DashboardHeader title="Nilai Akhir Mahasiswa" />
                <div className="p-4 text-center text-red-600">
                    Error: {error || "Data tidak tersedia."}
                </div>
            </>
        );
    }

    return (
        <>
            <DashboardHeader title="Nilai Akhir Mahasiswa" />
            <main className="mt-6 space-y-8 p-4">
                {/* Card Nilai Akhir */}
                <div className="bg-gradient-to-br from-purple-200 via-purple-300 to-blue-200 p-8 rounded-2xl shadow-lg">
                    {/* Nilai Akhir Utama */}
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

                    {/* Grid Komponen Utama */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatDetail title="Nilai Proyek" value={nilaiData.scores.project} />
                        <StatDetail title="UTS" value={nilaiData.scores.uts} />
                        <StatDetail title="UAS" value={nilaiData.scores.uas} />
                        <StatDetail title="Nilai Personal" value={nilaiData.scores.personal} />
                    </div>

                    {/* Grid Komponen Detail */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatDetail title="Skill" value={nilaiData.scores.skill} />
                        <StatDetail title="Keadilan" value={nilaiData.scores.keadilan} />
                        <StatDetail title="Kerjasama" value={nilaiData.scores.kerjasama} />
                        <StatDetail title="Kredibilitas" value={nilaiData.scores.kredibilitas} />
                    </div>
                </div>
            </main>
        </>
    );
}