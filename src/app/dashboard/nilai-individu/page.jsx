"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardHeader from "@/components/organism/DashboardHeader";
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import NilaiIndividuTable from '@/components/organism/NilaiIndividuTable'; 

const INDIVIDU_COLUMNS = [
    { key: 'username', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { key: 'nim', label: 'NIM' },
    { key: 'angkatan', label: 'Angkatan' },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'jabatan', label: 'Jabatan' },
    { key: 'final_grade', label: 'Nilai Total' }, 
    { key: 'actions', label: 'Finalisasi' },
];

export default function NilaiIndividuPage() {
    const [mahasiswaData, setMahasiswaData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPagesCount, setTotalPagesCount] = useState(1);
    const { isLoggedIn, isLoading: authLoading, role } = useAuth(); 
    const userRole = role;

    const transformData = useCallback((mhsData, finalizationData) => {
        console.log("📄 Menggabungkan data mahasiswa dan finalisasi...");
        console.log("Raw Finalization:", finalizationData);
        
        const finalizationMap = new Map();
        finalizationData.forEach((f) => {
            const userId = f.user?.id;
            if (userId) {
                finalizationMap.set(userId, {
                    confirmed: f.confirmed || 0,
                    final_grade: f.final_grade || 0,
                    _rawFinalization: f
                });
            }
        });

        const transformed = mhsData.map(mhs => {
            const finalData = finalizationMap.get(mhs.id) || { 
                confirmed: 0, 
                final_grade: 0,
                _rawFinalization: null
            };
            
            return {
                ...mhs,
                confirmed: finalData.confirmed,
                final_grade: finalData.final_grade,
                _rawFinalization: finalData._rawFinalization, 
            };
        });

        console.log("✅ Data transformed:", transformed);
        return transformed;
    }, []);

    const fetchIndividuData = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log("📡 Mengambil semua data individu...");
            
            const [mahasiswaResponse, finalizationResponse] = await Promise.all([
                api.get('/mahasiswa'),
                api.get('/finalization'), 
            ]);

            const mhsData = mahasiswaResponse.data.data || [];
            const finalizationData = finalizationResponse.data.data || [];

            const transformed = transformData(mhsData, finalizationData);
            setMahasiswaData(transformed);

        } catch (error) {
            console.error("❌ Gagal memuat data:", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memuat data.";
            window.alert(`Gagal memuat data: ${errorMessage}`);
            setMahasiswaData([]);
        } finally {
            setIsLoading(false);
        }
    }, [transformData]);

    useEffect(() => {
        if (isLoggedIn && !authLoading) {
            fetchIndividuData();
        }
    }, [isLoggedIn, authLoading, fetchIndividuData]);

    const handleToggleFinalization = async (item) => {
        console.log("🔄 Toggle Finalization untuk:", item.username);
        
        const finalizationRecord = item._rawFinalization;

        if (!finalizationRecord || !finalizationRecord.id) {
            window.alert(`❌ Gagal finalisasi. Data nilai (ID Finalization) untuk ${item.username} belum tersedia. Pastikan penilaian sudah selesai.`);
            return;
        }

        const finalizationId = finalizationRecord.id; 

        const isCurrentlyConfirmed = item.confirmed === 1;
        const actionText = isCurrentlyConfirmed ? 'membatalkan finalisasi' : 'memfinalisasi';
        
        if (!window.confirm(`Apakah Anda yakin ingin ${actionText} nilai untuk ${item.username}?`)) {
            return;
        }
        
        try {           
            const endpoint = `/finalization/${finalizationId}`;
            console.log(`📡 Calling: POST ${endpoint} (Finalization ID: ${finalizationId})`);
            
            const response = await api.post(endpoint, {}); 
            
            if (response.status === 200 || response.status === 201) {
                console.log("✅ Success:", response.data);
                await fetchIndividuData(); 
                window.alert(`✅ Nilai berhasil ${isCurrentlyConfirmed ? 'dibatalkan' : 'difinalisasi'}!`);
            } else {
                throw new Error(response.data?.message || `Gagal dengan status ${response.status}`);
            }
        } catch (error) {
            console.error("❌ Error updating finalization:", error);
            
            let errorMessage = 'Gagal mengubah status finalisasi.';
            
            if (error.response) {
                console.error("Error response:", error.response.data);
                errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
                
                if (error.response.status === 404) {
                    errorMessage = `❌ Data Finalisasi dengan ID ${finalizationId} tidak ditemukan.`;
                } else if (error.response.status === 405) {
                    errorMessage = `❌ Method tidak diizinkan. Pastikan endpoint POST /finalization/{id} aktif.`;
                }
            }

            window.alert(errorMessage);
        }
    };
    
    const itemsPerPage = 10;
    
    const filteredData = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return mahasiswaData.filter(mhs => 
            mhs.username.toLowerCase().includes(lowerCaseSearchTerm) ||
            mhs.nim.toLowerCase().includes(lowerCaseSearchTerm) ||
            mhs.email.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [mahasiswaData, searchTerm]);

    const paginatedData = useMemo(() => {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        setTotalPagesCount(totalPages > 0 ? totalPages : 1);
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);
    
    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1); 
    };
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4 mx-auto"></div>
                    <p className="text-gray-600">Memuat sesi...</p>
                </div>
            </div>
        );
    }
    
    if (!isLoggedIn) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Akses ditolak. Mohon login.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <DashboardHeader title="Nilai Individu Mahasiswa"/>
            <main className="p-4">
                <NilaiIndividuTable
                    data={paginatedData}
                    columns={INDIVIDU_COLUMNS}
                    title="Data Nilai Individu"
                    onSearch={handleSearch}
                    onToggleFinalization={handleToggleFinalization}
                    userRole={userRole}
                    totalPages={totalPagesCount} 
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    isLoading={isLoading} 
                />
            </main>
        </>
    );
}