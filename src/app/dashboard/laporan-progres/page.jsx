"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import DashboardHeader from "@/components/organism/DashboardHeader";
import MatrixTable from "@/components/organism/MatrixTable";
import Footer from "@/components/organism/Footer"; 
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function PenilaianProgressPage() { 
    const [matrixData, setMatrixData] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); 
    const [dynamicHeaders, setDynamicHeaders] = useState([]);
    const [totalWeekWeight, setTotalWeekWeight] = useState(0); 
    const { isLoggedIn, isLoading: authLoading, role } = useAuth(); 
    
    const userRole = role === 'asisten' ? 'asisten' : 'dosen'; 

    const isInitialMount = useRef(true);
    const isFetching = useRef(false);
    
    const fetchWeekTypeData = useCallback(async () => {
        try {
            const weekTypeResponse = await api.get('/week-type');

            if (weekTypeResponse.status !== 200) {
                throw new Error("Gagal mengambil struktur penilaian.");
            }
            
            const weekTypeData = weekTypeResponse.data;
            
            const total = (weekTypeData.data || []).reduce((sum, wt) => sum + wt.percentage, 0);
            setTotalWeekWeight(total);
            
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
    
    // Transform data untuk table 
    const transformMatrixData = (weekData, groupData, projectData, headers) => { 
        try {
            const transformedData = groupData.map(group => {
                const project = projectData.find(p => p.id === group.project_id);
                
                const weekGrades = {};
                weekData
                    .filter(w => w.project_id === project?.id)
                    .forEach(week => {
                        weekGrades[`week_${week.week_type.id}`] = week.total_grade || 0;
                    });

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

            return transformedData;
        } catch (error) {
            // console.error("❌ Error transforming data:", error);
            return [];
        }
    };
        
    const fetchMatrixData = useCallback(async () => {
        if (isFetching.current) {
            return;
        }

        isFetching.current = true;
        setIsLoading(true);
        
        try {
            const [weekTypes, groups, projects, weekData] = await Promise.all([
                fetchWeekTypeData(),
                api.get('/group').then(r => r.data.data || []),
                api.get('/project').then(r => r.data.data || []),
                api.get('/week').then(r => r.data.data || []),
            ]);

            const headers = (weekTypes?.data || []).map(wt => ({
                key: `week_${wt.id}`, 
                label: `${wt.name}\n${wt.percentage}%`,
                weekId: wt.id,
            }));

            const transformed = transformMatrixData(
                weekData,
                groups,
                projects,
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
            isInitialMount.current = false;
            fetchMatrixData();
        }
    }, [isLoggedIn, authLoading, fetchMatrixData]); 

    const handleSearch = (term) => {
        console.log("🔍 Searching for:", term);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
            <DashboardHeader title="Penilaian Progres"/> 
            <main className="p-0 md:p-4">
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
        </>
    );
}