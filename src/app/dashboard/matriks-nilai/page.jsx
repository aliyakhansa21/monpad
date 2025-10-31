// src/app/dashboard/matriks-nilai/page.jsx

"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppSidebar } from "@/components/organism/app-sidebar";
import DashboardHeader from "@/components/organism/DashboardHeader";
import MatrixTable from "@/components/organism/MatrixTable";
import ParameterPenilaianModal from "@/components/organism/ParameterPenilaianModal"; 
import MatrixHeaderButton from "@/components/molecules/MatrixHeaderButton";
import Footer from "@/components/organism/Footer"; 

const LARAVEL_API_BASE_URL = 'http://localhost:8000/api';

// const STATIC_COLUMNS = [
//     { key: 'kelompok_id', label: 'Kelompok' },
//     { key: 'nama_proyek', label: 'Nama Proyek' },
//     // Kolom Kanan
//     { key: 'total_skor', label: 'Total Skor', render: (item) => `${item.total_skor || 0}%` },
//     { key: 'catatan', label: 'Catatan' },
//     { key: 'review_dosen', label: 'Review Dosen' },
//     { key: 'aksi', label: 'Aksi' },
// ];


export default function MatriksNilaiPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [gradeTypeData, setGradeTypeData] = useState([]); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gradeTypesList, setGradeTypesList] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); 
    const [dynamicHeaders, setDynamicHeaders] = useState([]);
    const [totalWeekWeight, setTotalWeekWeight] = useState(0); 
    
    // --- FUNGSI FETCH WEEK TYPE (BARU/DIPERBAIKI) ---
    const fetchWeekTypeData = useCallback(async () => {
        try {
            const weekTypeResponse = await fetch(`${LARAVEL_API_BASE_URL}/week-type`);
            if (!weekTypeResponse.ok) throw new Error("Gagal mengambil struktur penilaian.");
            const weekTypeData = await weekTypeResponse.json();
            
            // 1. Hitung total bobot dari semua WeekType yang sudah ada
            const total = (weekTypeData.data || []).reduce((sum, wt) => sum + wt.percentage, 0);
            setTotalWeekWeight(total);
            
            // 2. Membangun DYNAMIC_HEADERS
            const newHeaders = (weekTypeData.data || []).map(wt => ({
                key: `nilai_${wt.id}`, // Gunakan ID WeekType untuk key nilai
                label: `${wt.name}\n${wt.percentage}%`, 
            }));
            setDynamicHeaders(newHeaders);
            
            return weekTypeData; // Mengembalikan data jika perlu
        } catch (error) {
            console.error("Error fetching week types:", error);
            return null;
        }
    }, [setTotalWeekWeight, setDynamicHeaders]); // Masukkan dependencies
        
    
    // --- FUNGSI FETCH MATRIX DATA (DATA BARIS) ---
    const fetchMatrixData = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Ambil data WeekType (untuk headers dan total bobot)
            await fetchWeekTypeData(); // <<< Panggil fungsi yang baru di sini

            // 2. Ambil data utama Matriks (yang berisi nilai per proyek)
            const matrixResponse = await fetch(`${LARAVEL_API_BASE_URL}/grade-type`); 
            if (!matrixResponse.ok) throw new Error("Gagal mengambil data baris matriks.");

            const matrixData = await matrixResponse.json();
            setGradeTypeData(matrixData.data || matrixData);

        } catch (error) {
            console.error("Error fetching matrix data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchWeekTypeData, setGradeTypeData]); // Masukkan fetchWeekTypeData sebagai dependency

    const fetchGradeTypesList = useCallback(async () => {
        try {
            const response = await fetch(`${LARAVEL_API_BASE_URL}/grade-type`); 
            if (!response.ok) throw new Error('Gagal mengambil daftar aspek penilaian');
            const data = await response.json();
            setGradeTypesList(data.data || []); 
        } catch (error) {
            console.error("Error fetching reusable aspects:", error.message);
        }
    }, []);

    // Gunakan useMemo untuk membuat kolom statis agar di-update saat state berubah
    const STATIC_COLUMNS = useMemo(() => {
        
        // Definisikan kolom Total Skor di sini
        // const TOTAL_SCORE_COLUMN = { 
        //     key: 'total_skor', 
        //     // label: 'TOTAL SKOR',
        //     // Menggunakan nilai dari state totalWeekWeight
        //     render: () => `${totalWeekWeight}%` 
        // };

        return [
            { key: 'kelompok_id', label: 'KELOMPOK' },
            { key: 'nama_proyek', label: 'NAMA PROYEK' },
            // TOTAL_SCORE_COLUMN, 
            { key: 'catatan', label: 'CATATAN' },
            { key: 'review_dosen', label: 'REVIEW DOSEN' },
            { key: 'aksi', label: 'AKSI' },
        ];
        
    // Dependency array harus mencakup totalWeekWeight
    }, [totalWeekWeight]);

    useEffect(() => {
        fetchMatrixData();
        fetchGradeTypesList();
    }, [fetchMatrixData, fetchGradeTypesList]);



    const handleModalSubmit = async (payload) => { 
        try {
            const response = await fetch(`${LARAVEL_API_BASE_URL}/week-type`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorMessage = `Gagal menyimpan data: ${response.status}.`;
                const errorText = await response.text();
                
                if (response.status === 422) {
                    try {
                        const errorData = JSON.parse(errorText);
                        if (errorData.errors) {
                            const firstErrorKey = Object.keys(errorData.errors)[0];
                            const firstErrorMessage = errorData.errors[firstErrorKey][0];
                            errorMessage = `Validasi Gagal: ${firstErrorMessage}`; 
                        } else {
                            errorMessage = errorData.message || errorMessage;
                        }
                    } catch (e) {
                        errorMessage = `Validasi Gagal. Detail: ${errorText.substring(0, 50)}...`;
                    }
                } else if (response.status >= 500) {
                    errorMessage = "Internal Server Error (500). Mohon periksa autentikasi atau log backend.";
                } else {
                    errorMessage = `Gagal menyimpan data: ${response.status}.`;
                }

                throw new Error(errorMessage);
            }

            await fetchMatrixData();
            await fetchGradeTypesList(); 
            alert(`Parameter Minggu ${payload.name} berhasil ditambahkan!`);
        } catch (error) {
            console.error('Error saat menambahkan parameter:', error);
            alert(error.message); 
        }
    };

    
    const handleInputParameter = () => {
        setIsModalOpen(true);
    };

    const handleSearch = (term) => {
        console.log("Searching for:", term);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleReview = (item) => {
        console.log("Membuka review untuk proyek:", item.nama_proyek);
    };
    
    const handleSidebarToggle = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const mainContentMargin = isSidebarExpanded ? "ml-[256px]" : "ml-[72px]" ;


    return (
        <div className="flex h-screen bg-background-light">
            <div className="fixed z-50 md:z-30">
                <AppSidebar isExpanded={isSidebarExpanded} onToggle={handleSidebarToggle}/>
            </div>
            
            <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                <div className='p-3 flex-1 bg-background-light'>
                    <div className={'pl-6'}>
                        <DashboardHeader title="Matriks Nilai"/>                        
                        <main className="p-4">                            
                            <MatrixHeaderButton onClick={handleInputParameter} />
                            <MatrixTable
                                data={gradeTypeData} 
                                columns={STATIC_COLUMNS}
                                totalWeekWeight={totalWeekWeight}
                                dynamicHeaders={dynamicHeaders}
                                onSearch={handleSearch}
                                onReview={handleReview}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />
                        </main>
                    </div>
                </div>
                <Footer/>
            </div>

            {/* Modal Input Parameter */}
            <ParameterPenilaianModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                existingGradeTypes={gradeTypesList}
                totalWeekWeight={totalWeekWeight}
            />
        </div>
    );
}