"use client"
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AppSidebar } from "@/components/organism/app-sidebar";
import PenilaianMingguanTable from '@/components/organism/PenilaianMingguanTable'; 
import DashboardHeader from '@/components/organism/DashboardHeader';
import Footer from "@/components/organism/Footer";
import MingguSelect from '@/components/molecules/MingguSelect'; 
import InputNilaiModal from '@/components/organism/InputNilaiModal';
import api from '@/lib/api'; 

const CURRENT_USER_ROLE = 'asisten'; 

const extractUniqueProjects = (allWeeks) => {
    const uniqueProjectsMap = new Map();
    
    allWeeks.forEach(week => {
        const project = week.project; // Asumsi relasi project ada di objek week
        
        if (project && project.id && !uniqueProjectsMap.has(project.id)) {
            
            // Format data yang dibutuhkan modal
            uniqueProjectsMap.set(project.id, {
                id: project.id.toString(),
                name: project.name || project.nama_proyek || `Proyek #${project.id}`,
                // Asumsi group_name ada di sini atau harus diambil dari relasi groups jika ada
                group_name: project.group_name || 'Tidak ada kelompok', 
            });
        }
    });

    return Array.from(uniqueProjectsMap.values());
};

export default function PenilaianMingguanPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [penilaianData, setPenilaianData] = useState([]);
    const [gradeTypes, setGradeTypes] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');    
    const [mingguOptions, setMingguOptions] = useState([]); 
    const [weekTypeList, setWeekTypeList] = useState([]); 
    const [isLoadingMinggu, setIsLoadingMinggu] = useState(true);
    const [selectedMinggu, setSelectedMinggu] = useState('');     
    const [isLoadingAssessment, setIsLoadingAssessment] = useState(false);     
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [allProjectsData, setAllProjectsData] = useState([]); 
    const toggleSidebar = () => { setIsSidebarExpanded(prev => !prev); };


    const fetchAllWeeksAndExtractTypes = async () => {
        setIsLoadingMinggu(true);
        setIsLoadingAssessment(true);
        
        try {
            const response = await api.get("/week"); 
            const allWeeks = response.data.data || [];
            setPenilaianData(allWeeks);

            // 1. Ekstrak Proyek dan Kelompok Unik (untuk Modal)
            const projects = extractUniqueProjects(allWeeks);
            setAllProjectsData(projects);
            
            // 2. Ekstrak WeekType yang unik (untuk Dropdown Minggu)
            const uniqueWeekTypesMap = new Map();
            allWeeks.forEach(week => {
                const weekType = week.week_type;
                if (weekType && !uniqueWeekTypesMap.has(weekType.id)) {
                    uniqueWeekTypesMap.set(weekType.id, weekType);
                }
            });

            const uniqueWeekTypes = Array.from(uniqueWeekTypesMap.values());
            setWeekTypeList(uniqueWeekTypes);

            const options = uniqueWeekTypes.map(wt => ({ 
                value: wt.id.toString(), 
                label: wt.name || `Minggu ${wt.id}` 
            }));
            setMingguOptions(options);


            // 3. Ekstrak Grade Type unik (untuk Header Kolom)
            const uniqueGradeTypesMap = new Map();
            allWeeks.forEach(week => {
                week.grades?.forEach(grade => {
                    const gradeType = grade.grade_type;
                    if (gradeType && !uniqueGradeTypesMap.has(gradeType.id)) {
                        uniqueGradeTypesMap.set(gradeType.id, gradeType);
                    }
                });
            });

            const allUniqueGradeTypes = Array.from(uniqueGradeTypesMap.values());
            allUniqueGradeTypes.sort((a, b) => a.id - b.id); 
            setGradeTypes(allUniqueGradeTypes);

            // 4. Set default selected minggu
            if (options.length > 0) {
                const defaultSelectedId = options[0].value;
                setSelectedMinggu(defaultSelectedId);                    
            } else {
                setSelectedMinggu(''); 
                setGradeTypes([]); 
            }
            
        } catch (error) {
            console.error("Gagal mengambil data Weeks:", error.response?.status, error.message);
            setPenilaianData([]);
            setMingguOptions([]);
            setWeekTypeList([]);
            setGradeTypes([]);
            setAllProjectsData([]); 
        } finally {
            setIsLoadingMinggu(false);
            setIsLoadingAssessment(false);
        }
    };
    
    useEffect(() => {
        fetchAllWeeksAndExtractTypes();
    }, []);

    const handleSaveSuccess = () => {
        setIsModalOpen(false);
        fetchAllWeeksAndExtractTypes(); 
    };

    const handleReview = () => {
        if (CURRENT_USER_ROLE === 'asisten') {
            setIsModalOpen(true);
        } else {
            console.warn('Akses Ditolak. Hanya Asisten yang dapat menambah nilai.');
        }
    };
    
    const handleSearch = (term) => { 
        setSearchTerm(term); 
    };
    
    const handlePageChange = (page) => { 
        console.log('Pindah ke halaman:', page); 
    };

    // Filter Data
    const filteredData = useMemo(() => {
        const dataByWeek = penilaianData.filter(item => {                
            const idToMatch = item.week_type?.id || item.week_type_id;                 
            return idToMatch && idToMatch.toString() === selectedMinggu.toString();
        });

        if (!searchTerm) return dataByWeek;
        
        const lowerSearch = searchTerm.toLowerCase();
        return dataByWeek.filter(item => {
            const projectName = item.project?.name?.toLowerCase() || '';
            const groupName = item.project?.group_name?.toLowerCase() || '';
            const notes = item.notes?.toLowerCase() || '';
            
            return projectName.includes(lowerSearch) || 
                groupName.includes(lowerSearch) || 
                notes.includes(lowerSearch);
        });
    }, [penilaianData, searchTerm, selectedMinggu]); 

    const currentWeekType = weekTypeList.find(wt => wt.id.toString() === selectedMinggu);

    return (
        <>
            {CURRENT_USER_ROLE === 'asisten' && (
                <InputNilaiModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSaveSuccess={handleSaveSuccess}
                    gradeTypes={gradeTypes}
                    weekTypeId={currentWeekType ? parseInt(currentWeekType.id) : null} 
                    projectsData={allProjectsData} 
                    isLoadingProjects={isLoadingMinggu || isLoadingAssessment} 
                />
            )}

            <DashboardHeader title="Laporan Mingguan"/>                        
            <div className="p-4 flex items-center space-x-4">
                <MingguSelect 
                    options={mingguOptions} 
                    selectedMinggu={selectedMinggu} 
                    onMingguChange={setSelectedMinggu}
                    isLoading={isLoadingMinggu}
                /> 
            </div>                        
            <main className='p-4'>
                <PenilaianMingguanTable
                    data={filteredData} 
                    gradeTypes={gradeTypes} 
                    onSearch={handleSearch}                                
                    onReview={handleReview}
                    userRole={CURRENT_USER_ROLE}
                    isLoading={isLoadingAssessment || isLoadingMinggu} 
                    totalPages={1} 
                    currentPage={1}
                    onPageChange={handlePageChange}
                    totalWeekWeight={100}
                />
            </main>
        </>
    );
}