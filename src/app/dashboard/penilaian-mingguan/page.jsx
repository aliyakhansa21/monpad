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
    
    // State untuk Dropdown Minggu
    const [mingguOptions, setMingguOptions] = useState([]); 
    const [weekTypeList, setWeekTypeList] = useState([]); 
    const [isLoadingMinggu, setIsLoadingMinggu] = useState(true);
    const [selectedMinggu, setSelectedMinggu] = useState(''); 
    
    // State Loading untuk Data Penilaian
    const [isLoadingAssessment, setIsLoadingAssessment] = useState(false); 
    
    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false); 

    const toggleSidebar = () => { setIsSidebarExpanded(prev => !prev); };

    // Fetch Daftar Week Types (Minggu ke-1, ke-2, dst)
    useEffect(() => {
        const fetchWeekTypes = async () => {
            setIsLoadingMinggu(true);
            try {
                // Perbaikan #1: Menggunakan endpoint /week-type untuk mengambil daftar minggu
                const response = await fetch(`${LARAVEL_API_BASE_URL}/week-type`); 
                
                if (!response.ok) {
                    console.error(`Gagal fetch daftar minggu. Status: ${response.status}`);
                    return;
                }
                
                const result = await response.json();
                const weekTypes = result.data || [];

                console.log("WeekTypes dari API:", weekTypes);
                
                // Simpan data lengkap untuk nanti
                setWeekTypeList(weekTypes);

                // Buat options untuk dropdown
                const options = weekTypes.map(wt => ({ 
                    value: wt.id.toString(), 
                    label: wt.name || `Minggu ${wt.id}` 
                }));
                setMingguOptions(options);

                // Set minggu pertama sebagai default
                if (options.length > 0) {
                    setSelectedMinggu(options[0].value);
                    
                    // Ambil grade_types dari week type pertama
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

    // Update Grade Types ketika minggu berubah
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
            // GET /api/week akan mengembalikan semua Week resources
            // HARUS FILTER DI FRONT-END karena BE tidak bisa diubah
            const response = await fetch(`${LARAVEL_API_BASE_URL}/week`);
            
            if (!response.ok) {
                console.error(`Gagal mengambil data penilaian. Status: ${response.status}`);
                setPenilaianData([]);
                return;
            }
            
            const result = await response.json();
            const allWeeks = result.data || [];

            console.log("All weeks dari API:", allWeeks);
            
            // Perbaikan #2: Filter yang lebih fleksibel
            const filteredWeeks = allWeeks.filter(week => {
                // Mencoba mencocokkan ID dari properti bersarang (week.week_type.id) 
                // atau properti foreign key langsung (week.week_type_id)
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

    // Fetch data ketika minggu berubah
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
        <div className='flex top-col min-h-screen'>
            {/* Sidebar */}
            <div className='fixed top-0 left-0 h-full z-10'>
                <AppSidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={toggleSidebar}
                />
            </div>

            {CURRENT_USER_ROLE === 'asisten' && (
                <InputNilaiModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSaveSuccess={handleSaveSuccess}
                    gradeTypes={gradeTypes}
                    weekTypeId={selectedMinggu ? parseInt(selectedMinggu) : null}
                />
            )}

            {/* Main Content Area */}
            <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                <div className='p-3 flex-1 bg-background-light'>
                    <div className={'pl-6'}>                        
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
                    </div>
                </div>
                <Footer/>
            </div>
        </div>
    );
}