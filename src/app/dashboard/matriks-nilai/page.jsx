"use client";
import { AppSidebar } from "@/components/organism/app-sidebar";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import Footer from "@/components/organism/Footer";
import MatrixTable from "@/components/organism/MatrixTable";
import ParameterPenilaianModal from "@/components/organism/ParameterPenilaianModal"; 
import MatriksHeaderButton from "@/components/molecules/MatrixHeaderButton";

const STATIC_COLUMNS = [
    { key: 'kelompok_id', label: 'Kelompok' },
    { key: 'nama_proyek', label: 'Nama Proyek' },
    // Kolom Kanan
    { key: 'total_skor', label: 'Total Skor', render: (item) => `${item.total_skor}%` },
    { key: 'catatan', label: 'Catatan' },
    { key: 'review_dosen', label: 'Review Dosen' },
    { key: 'aksi', label: 'Aksi' }, 
];

const DYNAMIC_HEADERS = [
    { key: 'w1', label: 'W1\n1%' },
    { key: 'w2', label: 'W2\n1%' },
    { key: 'w3', label: 'W3\n2%' },
    { key: 'w4', label: 'W4\n2%' },
    { key: 'w5', label: 'W5\n2%' },
    { key: 'w6', label: 'W6\n3%' },
    { key: 'w7', label: 'W7\n3%' },
    { key: 'uts', label: 'UTS\n10%' },
    { key: 'w9', label: 'W9\n2%' },
    { key: 'w10', label: 'W10\n2%' },
    { key: 'w11', label: 'W11\n2%' },
    { key: 'w12', label: 'W12\n10%' },
    { key: 'w13', label: 'W13\n10%' },
    { key: 'w14', label: 'W14\n10%' },
    { key: 'w15', label: 'W15\n20%' },
    { key: 'uas', label: 'UAS\n20%' },
];

export default function MatriksNilaiPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); 
    const [isLoading, setIsLoading] = useState(true);
    const [gradeTypeData, setGradeTypeData] = useState([]);
    const [selectedGradeType, setSelectedGradeType] = useState(null);

    const LARAVEL_API_BASE_URL = 'http://localhost:8000/api';
    
    const fetchGradeTypeData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${LARAVEL_API_BASE_URL}/grade-type`);
            if (!response.ok) throw new Error("Gagal mengambil data GradeType.");

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Gagal mengambil data dari server: ${response.status} - ${errorText}');
            }

            const result = await response.json();
            setGradeTypeData(result.data);
        } catch (error) {
            console.error("Error saat menambahkan data: ", error);
            alert("Gagal memuat data: ${error.message}");
            setGradeTypeData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGradeTypeData();
    }, [fetchGradeTypeData]);

    const toggleSidebar = () => {
        setIsSidebarExpanded(prev => !prev);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAddData = () => {
        setModalMode('add');
        setSelectedGradeType(null);
        setIsModalOpen(true);
    };

    const handleEditData = (gradeType) => {
        setModalMode('edit');
        setSelectedGradeType(gradeType);
        setIsModalOpen(true);
    };

    const onDeleteGradeType = async (gradeTypeToDelete) => {
        const id = gradeTypeToDelete.id;
        
        try{
            const response = await fetch(`${LARAVEL_API_BASE_URL}/grade-type/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchGradeTypeData();
                alert("Data parameter nilai berhasil dihapus!");
            } else {
                const errorText = await response.text();
                throw new Error("Gagal menghapus data: ${response.status} - ${errorText}");
            }
        } catch (error) {
            console.error("Gagal menghapus data: ", error);
            alert("Gagal menghapus data. Cek console untuk detail.");
        }
    };


    const handleModalSubmit = async (payload) => { 
        try {
            const response = await fetch(`${LARAVEL_API_BASE_URL}/week-type`, { // POST ke WEEK-TYPE
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                
                if (response.status >= 500) {
                    throw new Error("Internal Server Error. Mohon periksa log backend.");
                }
                
                if (response.status === 422) {
                    throw new Error(`Validasi Gagal. ${errorText.substring(0, 100)}...`); 
                }
                
                throw new Error(`Gagal menyimpan data: ${response.status}`);
            }

            fetchGradeTypeData(); 
            alert(`Parameter Minggu ${payload.name} berhasil ditambahkan!`);
        } catch (error) {
            console.error('Error saat menambahkan parameter:', error);
            alert(`Gagal menambahkan parameter: ${error.message}`);
        }
    };

    const handleInputParameter = () => {
        setIsModalOpen(true);
    };

    const mainContentMargin = isSidebarExpanded ? "ml-[256px]" : "ml-[72px]";

    const handleReview = (item) => {
        console.log("Review data untuk:", item.nama_proyek);
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Sidebar */}
            <div className="fixed top-0 left-0 h-full z-10">
                <AppSidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={toggleSidebar}
                />
            </div>

            {/* Main Content Area */}
            <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                <div className='p-3 flex-1 bg-background-light'>
                    <div className={'pl-6'}>
                        <DashboardHeader title="Matriks Nilai" />
                        <main className="p-4">
                            <MatriksHeaderButton onClick={handleInputParameter} />
                            <MatrixTable
                                data={gradeTypeData} 
                                columns={STATIC_COLUMNS}
                                dynamicHeaders={DYNAMIC_HEADERS}
                                onSearch={() => {}}
                                onReview={handleReview}
                                totalPages={1}
                                currentPage={1}
                                onPageChange={() => {}}
                            />
                            {/* 
                            <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                                Input Parameter Penilaian
                            </Button> */}
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
            />
        </div>
    )
}