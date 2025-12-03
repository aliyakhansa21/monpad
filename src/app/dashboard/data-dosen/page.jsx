"use client";
import { AppSidebar } from "@/components/organism/app-sidebar";
import { useEffect, useState, useMemo } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import DataTable from "@/components/organism/DataTable";
import Footer from "@/components/organism/Footer";
import DosenModal from "@/components/organism/DosenModal";
import api from "@/lib/api"; 

const DOSEN_COLUMNS = [
    { key:'username', label: 'Nama'},
    { key:'email', label: 'Email'},
    { key:'nidn', label:'NIDN'},
    { key:'fakultas', label:'Fakultas'},
    { key:'actions', label:'Aksi'},
]

export default function DataDosenPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedDosen, setSelectedDosen] = useState(null);
    const [dosenData, setDosenData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 10;

    const fetchDosenData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/dosen'); 
            setDosenData(response.data.data || []); 
        } catch (error) {
            console.error("Gagal mengambil data:", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memuat data.";
            window.alert(`Gagal memuat data: ${errorMessage}`);
            setDosenData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDosenData();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarExpanded(prev => !prev);
    };

    const filteredData = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return dosenData.filter(dosen => 
            dosen.username?.toLowerCase().includes(lowerCaseSearchTerm) ||
            dosen.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
            dosen.nidn?.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [dosenData, searchTerm]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);
    
    const totalPagesCount = useMemo(() => {
        return Math.ceil(filteredData.length / itemsPerPage) || 1;
    }, [filteredData]);


    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); 
    };

    const handleAddData = () => {
        setModalMode('add');
        setSelectedDosen(null);
        setIsModalOpen(true);
    };

    const handleEditData = (dosen) => {
        setModalMode('edit');
        setSelectedDosen(dosen);
        setIsModalOpen(true);
    };

    const onDeleteDosen = async (dosenToDelete) => {
        const id = dosenToDelete.id;
        
        if (!window.confirm(`Apakah Anda yakin ingin menghapus data dosen ${dosenToDelete.username}?`)) {
            return;
        }

        try{
            const response = await api.delete(`/dosen/${id}`); 
            
            if (response.status === 200 || response.status === 204) {
                await fetchDosenData();
                window.alert(`Data Dosen ${dosenToDelete.username} berhasil dihapus!`);
            } else {
                throw new Error("Gagal menghapus data.");
            }
        } catch (error) {
            console.error("Error saat menghapus data: ", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Cek console untuk detail.";
            window.alert(`Gagal menghapus data: ${errorMessage}`);
        }
    };

    const handleModalSubmit = async (formData) => {
        const id = selectedDosen?.id;
        
        try {
            if (modalMode === 'add') {
                await api.post('/dosen', formData);
                window.alert('Data berhasil ditambahkan!');

            } else if (modalMode === 'edit' && id) {
                await api.put(`/dosen/${id}`, formData);
                window.alert('Data berhasil diperbarui!');
            }
            
            await fetchDosenData();
            
        } catch (error) {
            console.error(`Error saat ${modalMode} data:`, error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat menyimpan data.";
            window.alert(`Gagal ${modalMode} data: ${errorMessage}`);
        } finally {
            setIsModalOpen(false);
        }
    };

    const mainContentMargin = isSidebarExpanded ? "ml-[256px]" : "ml-[72px]" ;

    return (
        <>
            <DashboardHeader title="Data Dosen"/>
                <main className="p-4">
                    <DataTable
                        data={paginatedData}
                        columns={DOSEN_COLUMNS}
                        title="Data Dosen"
                        onSearch={handleSearch}
                        onAdd={handleAddData}
                        onEdit={handleEditData}
                        onDelete={onDeleteDosen}
                        totalPages={totalPagesCount}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        isLoading={isLoading}
                    />
                </main>

            <DosenModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedDosen}
                mode={modalMode}
            />
        </>
            
    )
}