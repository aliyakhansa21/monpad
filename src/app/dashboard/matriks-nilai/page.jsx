"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    const [matrixData, setMatrixData] = useState([]); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gradeTypesList, setGradeTypesList] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); 
    const [dynamicHeaders, setDynamicHeaders] = useState([]);
    const [totalWeekWeight, setTotalWeekWeight] = useState(0);     
    const { isLoggedIn, isLoading: authLoading, role } = useAuth(); 
    const userRole = role;
    
    // Prevent multiple fetches
    const isInitialMount = useRef(true);
    const isFetching = useRef(false);
    
    // fetch week types untuk header kolom
    const fetchWeekTypeData = useCallback(async () => {
        try {
            // console.log("📡 Fetching week types...");
            const weekTypeResponse = await api.get('/week-type');

            if (weekTypeResponse.status !== 200) {
                throw new Error("Gagal mengambil struktur penilaian.");
            }
            
            const weekTypeData = weekTypeResponse.data;
            // console.log("✅ Week types fetched:", weekTypeData);
            
            // Hitung total bobot minggu
            const total = (weekTypeData.data || []).reduce((sum, wt) => sum + wt.percentage, 0);
            setTotalWeekWeight(total);
            
            // Generate dynamic headers dari week types
            const newHeaders = (weekTypeData.data || []).map(wt => ({
                key: `week_${wt.id}`, 
                label: `${wt.name}\n${wt.percentage}%`,
                weekId: wt.id,
            }));
            setDynamicHeaders(newHeaders);
            
            return weekTypeData; 
        } catch (error) {
            // console.error("❌ Error fetching week types:", error.message);
            if (error.response?.status !== 401) {
                alert("Gagal memuat struktur penilaian. Silakan refresh halaman.");
            }
            return null;
        }
    }, []); 
    
    const fetchGradeTypesList = useCallback(async () => {
        try {
            // console.log("📡 Fetching grade types list...");
            const response = await api.get('/grade-type');
            
            if (response.status !== 200) {
                throw new Error('Gagal mengambil daftar aspek penilaian');
            }
            
            const data = response.data;
            // console.log("✅ Grade types list fetched:", data);
            setGradeTypesList(data.data || []);
            
            return data;
        } catch (error) {
            // console.error("❌ Error fetching grade types list:", error.message);
            if (error.response?.status !== 401) {
                alert("Gagal memuat daftar aspek penilaian.");
            }            
            return null;
        }
    }, []);
    
    // Transform data untuk table 
    const transformMatrixData = (weekData, groupData, projectData, finalizationData, headers) => {
        try {
            // console.log("🔄 Transforming data...");
            
            // Transform ke format table
            const transformedData = groupData.map(group => {
                const project = projectData.find(p => p.id === group.project_id);
                
                // Ambil data nilai per minggu untuk group ini
                const weekGrades = {};
                weekData
                    .filter(w => w.project_id === project?.id)
                    .forEach(week => {
                        weekGrades[`week_${week.week_type.id}`] = week.total_grade || 0;
                    });

                // Hitung total skor
                let totalSkor = 0;
                headers.forEach(header => {
                    const grade = weekGrades[header.key] || 0;
                    const percentageString = header.label.split('\n')[1] || '0%';
                    const percentage = parseInt(percentageString.replace('%', '')) || 0;
                    totalSkor += (grade * percentage) / 100;
                });

                return {
                    id: group.id,
                    kelompok_id: group.nama,
                    nama_proyek: project?.nama_projek || '-',
                    project_id: project?.id,
                    ...weekGrades, 
                    total_skor: totalSkor.toFixed(2),                 
                };
            });

            // console.log("✅ Data transformed:", transformedData);
            return transformedData;
        } catch (error) {
            // console.error("❌ Error transforming data:", error);
            return [];
        }
    };
        
    const fetchMatrixData = useCallback(async () => {
        if (isFetching.current) {
            // console.log("⏭️ Fetch already in progress, skipping...");
            return;
        }

        isFetching.current = true;
        setIsLoading(true);
        
        try {
            // console.log("📡 Fetching all matrix data...");
            
            const [weekTypes, groups, projects, weekData] = await Promise.all([
                fetchWeekTypeData(),
                api.get('/group').then(r => r.data.data || []),
                api.get('/project').then(r => r.data.data || []),
                api.get('/week').then(r => r.data.data || []),
            ]);

            // console.log("✅ All data fetched");

            const headers = (weekTypes?.data || []).map(wt => ({
                key: `week_${wt.id}`, 
                label: `${wt.name}\n${wt.percentage}%`,
                weekId: wt.id,
            }));

            // Transform data - PASS headers as parameter
            const transformed = transformMatrixData(
                weekData,
                groups,
                projects,
                [], 
                headers
            );

            setMatrixData(transformed);

        } catch (error) {
            // console.error("❌ Error fetching matrix data:", error.message);
            if (error.response?.status !== 401) {
                alert("Gagal memuat data matriks. Silakan refresh halaman.");
            }
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, [fetchWeekTypeData]); 

    const STATIC_COLUMNS = useMemo(() => {
        return [
            { key: 'kelompok_id', label: 'KELOMPOK' },
            { key: 'nama_proyek', label: 'NAMA PROYEK' },
            { key: 'total_skor', label: 'TOTAL SKOR' },
        ];
    }, []);

    useEffect(() => {
        if (isLoggedIn && !authLoading && isInitialMount.current) {
            // console.log("🔄 Initial data fetch...");
            isInitialMount.current = false;
            
            fetchGradeTypesList();
            fetchMatrixData();
        }
    }, [isLoggedIn, authLoading, fetchGradeTypesList, fetchMatrixData]); 

    const handleModalSubmit = async (payload) => { 
        try {
            // console.log("📤 Submitting week type:", payload);            
            const response = await api.post('/week-type', payload);

            if (response.status !== 200 && response.status !== 201) {
                throw new Error(`Permintaan gagal dengan status ${response.status}`);
            }
            
            // console.log("✅ Week type berhasil ditambahkan:", response.data);
            
            isInitialMount.current = true;
            await fetchMatrixData();
            await fetchGradeTypesList(); 
            
            alert(`Parameter Minggu ${payload.name} berhasil ditambahkan!`);
            
        } catch (error) {
            console.error('Error saat menambahkan parameter:', error.response?.data || error.message);
            
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
    
    const handleSidebarToggle = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background-light">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4 mx-auto"></div>
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
        <>
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
                        data={matrixData} 
                        columns={STATIC_COLUMNS}
                        totalWeekWeight={totalWeekWeight}
                        dynamicHeaders={dynamicHeaders}
                        onSearch={handleSearch}                   
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        userRole={userRole} 
                    />
                )}
            </main>
            <ParameterPenilaianModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                existingGradeTypes={gradeTypesList}
                totalWeekWeight={totalWeekWeight}
            />
        </>
    );
}