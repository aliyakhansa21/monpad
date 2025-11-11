"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppSidebar } from "@/components/organism/app-sidebar";
import DashboardHeader from "@/components/organism/DashboardHeader";
import MatrixTable from "@/components/organism/MatrixTable";
import ParameterPenilaianModal from "@/components/organism/ParameterPenilaianModal"; 
import MatrixHeaderButton from "@/components/molecules/MatrixHeaderButton";
import Footer from "@/components/organism/Footer"; 
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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
    const { isLoggedIn, isLoading: authLoading } = useAuth();
    
    const fetchWeekTypeData = useCallback(async () => {
        try {
            console.log("📡 Fetching week types...");
            const weekTypeResponse = await api.get('/week-type');

            if (weekTypeResponse.status !== 200) {
                throw new Error("Gagal mengambil struktur penilaian.");
            }
            
            const weekTypeData = weekTypeResponse.data;
            console.log("✅ Week types fetched:", weekTypeData);
            
            // Hitung total bobot minggu
            const total = (weekTypeData.data || []).reduce((sum, wt) => sum + wt.percentage, 0);
            setTotalWeekWeight(total);
            
            // Generate dynamic headers
            const newHeaders = (weekTypeData.data || []).map(wt => ({
                key: `nilai_${wt.id}`, 
                label: `${wt.name}\n${wt.percentage}%`, 
            }));
            setDynamicHeaders(newHeaders);
            
            return weekTypeData; 
        } catch (error) {
            console.error("❌ Error fetching week types:", error.message);
            
            // Jika error 401, biarkan interceptor global yang handle
            if (error.response?.status !== 401) {
                alert("Gagal memuat struktur penilaian. Silakan refresh halaman.");
            }
            
            return null;
        }
    }, []); 
    
    const fetchGradeTypesList = useCallback(async () => {
        try {
            console.log("📡 Fetching grade types list...");
            const response = await api.get('/grade-type');
            
            if (response.status !== 200) {
                throw new Error('Gagal mengambil daftar aspek penilaian');
            }
            
            const data = response.data;
            console.log("✅ Grade types list fetched:", data);
            setGradeTypesList(data.data || []);
            
            return data;
        } catch (error) {
            console.error("❌ Error fetching grade types list:", error.message);
            
            // Jika error 401, biarkan interceptor global yang handle
            if (error.response?.status !== 401) {
                alert("Gagal memuat daftar aspek penilaian.");
            }            
            return null;
        }
    }, []);
        
    const fetchMatrixData = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log("📡 Fetching matrix data...");
            
            await fetchWeekTypeData(); 
            
            const matrixResponse = await api.get('/grade-type');
            
            if (matrixResponse.status !== 200) {
                throw new Error("Gagal mengambil data baris matriks.");
            }

            const matrixData = matrixResponse.data;
            console.log("✅ Matrix data fetched:", matrixData);
            setGradeTypeData(matrixData.data || matrixData);

        } catch (error) {
            console.error("❌ Error fetching matrix data:", error.message);
            
            if (error.response?.status !== 401) {
                alert("Gagal memuat data matriks. Silakan refresh halaman.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [fetchWeekTypeData]); 

    const STATIC_COLUMNS = useMemo(() => {
        return [
            { key: 'kelompok_id', label: 'KELOMPOK' },
            { key: 'nama_proyek', label: 'NAMA PROYEK' },
            { key: 'catatan', label: 'CATATAN' },
            { key: 'review_dosen', label: 'REVIEW DOSEN' },
            { key: 'aksi', label: 'AKSI' },
        ];        
    }, []);

    useEffect(() => {
        // Hanya fetch data jika user sudah login dan auth loading sudah selesai
        if (isLoggedIn && !authLoading) {
            console.log("🔄 User logged in, fetching data...");
            fetchGradeTypesList();
            fetchMatrixData();
        } else if (!isLoggedIn && !authLoading) {
            // Jika tidak login dan auth loading sudah selesai, redirect ke login
            console.log("⚠️ User not logged in, data fetch skipped");
        }
    }, [isLoggedIn, authLoading, fetchGradeTypesList, fetchMatrixData]);

    const handleModalSubmit = async (payload) => { 
        try {
            console.log("📤 Submitting week type:", payload);            
            const response = await api.post('/week-type', payload);

            if (response.status !== 200 && response.status !== 201) {
                throw new Error(`Permintaan gagal dengan status ${response.status}`);
            }
            
            console.log("✅ Week type berhasil ditambahkan:", response.data);
            
            await fetchMatrixData();
            await fetchGradeTypesList(); 
            
            alert(`✅ Parameter Minggu ${payload.name} berhasil ditambahkan!`);
            
        } catch (error) {
            console.error('❌ Error saat menambahkan parameter:', error.response?.data || error.message);
            
            let errorMessage = 'Terjadi kesalahan tidak terduga saat menyimpan data.';
            
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;

                if (status === 422 && errorData.errors) {
                    const firstErrorKey = Object.keys(errorData.errors)[0];
                    const firstErrorMessage = errorData.errors[firstErrorKey][0];
                    errorMessage = `Validasi Gagal: ${firstErrorMessage}`;
                } else if (status === 401) {
                    errorMessage = "Sesi kadaluarsa. Mohon login ulang.";
                } else if (status >= 500) {
                    errorMessage = "Internal Server Error (500). Silakan hubungi administrator.";
                } else {
                    errorMessage = errorData.message || `Gagal menyimpan data (Status: ${status})`;
                }
            } else if (error.request) {
                errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
            }
            
            alert(errorMessage);
        }
    };

    const handleInputParameter = () => {
        setIsModalOpen(true);
    };

    const handleSearch = (term) => {
        console.log("🔍 Searching for:", term);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleReview = (item) => {
        console.log("📝 Membuka review untuk proyek:", item.nama_proyek);
    };
    
    const handleSidebarToggle = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const mainContentMargin = isSidebarExpanded 
        ? "md:ml-[256px]" 
        : "md:ml-[72px]";

    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background-light">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4 mx-auto"></div>
                    <p className="text-gray-600">Memuat halaman...</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background-light">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Anda harus login terlebih dahulu</p>
                    <p className="text-sm text-gray-500">Mengarahkan ke halaman login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background-light">
            <div className="fixed z-50 md:z-30">
                <AppSidebar isExpanded={isSidebarExpanded} onToggle={handleSidebarToggle}/>
            </div>
            
            <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                <div className='p-3 flex-1 bg-background-light'>
                    <div className={'p-4 md:pl-6'}>
                        <DashboardHeader title="Matriks Nilai"/>                        
                        <main className="p-0 md:p-4">
                            <MatrixHeaderButton onClick={handleInputParameter} />                            
                            {isLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-3 mx-auto"></div>
                                        <p className="text-gray-600">Memuat data matriks...</p>
                                    </div>
                                </div>
                            ) : (
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
                            )}
                        </main>
                    </div>
                </div>
                <Footer/>
            </div>

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