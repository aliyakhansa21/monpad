"use client"
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AppSidebar } from "@/components/organism/app-sidebar";
import PenilaianMingguanTable from '@/components/organism/PenilaianMingguanTable'; 
import DashboardHeader from '@/components/organism/DashboardHeader';
import Footer from "@/components/organism/Footer";
import MingguSelect from '@/components/molecules/MingguSelect'; 
import InputNilaiModal from '@/components/organism/InputNilaiModal';

const CURRENT_USER_ROLE = 'asisten'; 
const LARAVEL_API_BASE_URL = 'https://simpad.novarentech.web.id/api'; 

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
    const toggleSidebar = () => { setIsSidebarExpanded(prev => !prev); };

    useEffect(() => {
        const fetchWeekTypes = async () => {
            setIsLoadingMinggu(true);
            try {
                const response = await fetch(`${LARAVEL_API_BASE_URL}/week-type`); 
                
                if (!response.ok) {
                    console.error(`Gagal fetch daftar minggu. Status: ${response.status}`);
                    return;
                }
                
                const result = await response.json();
                const weekTypes = result.data || [];

                console.log("WeekTypes dari API:", weekTypes);                
                setWeekTypeList(weekTypes);

                const options = weekTypes.map(wt => ({ 
                    value: wt.id.toString(), 
                    label: wt.name || `Minggu ${wt.id}` 
                }));
                setMingguOptions(options);

                if (options.length > 0) {
                    setSelectedMinggu(options[0].value);                    
                    if (weekTypes[0].grade_types) {
                        setGradeTypes(weekTypes[0].grade_types);
                    }
                }
                
            } catch (error) {
                console.error("Gagal mengambil data WeekType:", error);
            } finally {
                setIsLoadingMinggu(false);
            }
        };
        fetchWeekTypes();
    }, []);

    useEffect(() => {
        if (selectedMinggu && weekTypeList.length > 0) {
            const selectedWeekType = weekTypeList.find(wt => wt.id.toString() === selectedMinggu);
            if (selectedWeekType && selectedWeekType.grade_types) {
                setGradeTypes(selectedWeekType.grade_types);
            }
        }
    }, [selectedMinggu, weekTypeList]);

    const fetchPenilaianData = useCallback(async (weekTypeId) => {
        if (!weekTypeId) return;
        
        setIsLoadingAssessment(true);
        console.log("Fetching penilaian untuk week_type_id:", weekTypeId);
        
        try {            
            const response = await fetch(`${LARAVEL_API_BASE_URL}/week`);
            
            if (!response.ok) {
                console.error(`Gagal mengambil data penilaian. Status: ${response.status}`);
                setPenilaianData([]);
                return;
            }
            
            const result = await response.json();
            const allWeeks = result.data || [];

            console.log("All weeks dari API:", allWeeks);
            
            const filteredWeeks = allWeeks.filter(week => {                
                const idToMatch = week.week_type?.id || week.week_type_id;                 
                return idToMatch && idToMatch.toString() === weekTypeId.toString();
            });

            console.log("Filtered weeks untuk week_type_id", weekTypeId, ":", filteredWeeks);
            
            setPenilaianData(filteredWeeks);

        } catch (error) {
            console.error("Gagal mengambil data penilaian:", error);
            setPenilaianData([]);
        } finally {
            setIsLoadingAssessment(false);
        }
    }, []);

    useEffect(() => {
        if (selectedMinggu) {
            fetchPenilaianData(selectedMinggu);
        }
    }, [selectedMinggu, fetchPenilaianData]);

    // Handlers
    const handleSaveSuccess = () => {
        setIsModalOpen(false);
        if (selectedMinggu) {
            fetchPenilaianData(selectedMinggu);
        }
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

    const filteredData = useMemo(() => {
        if (!searchTerm) return penilaianData;
        
        const lowerSearch = searchTerm.toLowerCase();
        return penilaianData.filter(item => {
            const projectName = item.project?.name?.toLowerCase() || '';
            const groupName = item.project?.group_name?.toLowerCase() || '';
            const notes = item.notes?.toLowerCase() || '';
            
            return projectName.includes(lowerSearch) || 
                groupName.includes(lowerSearch) || 
                notes.includes(lowerSearch);
        });
    }, [penilaianData, searchTerm]);

    const mainContentMargin = isSidebarExpanded ? "ml-[256px]" : "ml-[72px]";

    return (
        <>
            {CURRENT_USER_ROLE === 'asisten' && (
                <InputNilaiModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSaveSuccess={handleSaveSuccess}
                    gradeTypes={gradeTypes}
                    weekTypeId={selectedMinggu ? parseInt(selectedMinggu) : null}
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