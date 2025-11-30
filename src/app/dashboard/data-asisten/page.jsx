"use client";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import DataTable from "@/components/organism/DataTable";
import AsistenModal from "@/components/organism/AsistenModal";
import api from '@/lib/api'; 

const ASISTEN_COLUMNS = [
    { key:'username', label: 'Nama' },
    { key:'email', label: 'Email'},
    { key: 'tahun_ajaran', label: 'TahunAjaran' },
    { key: 'nim', label: 'NIM' },
    { key: 'actions', label: 'Aksi' },
];

export default function DataAsistenPage() {    
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); 
    const [selectedAsisten, setSelectedAsisten] = useState(null);
    const [asistenData, setAsistenData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAsistenData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/asisten');
            setAsistenData(response.data.data);
        } catch (error) {
            console.error("Gagal mengambil data:", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memuat data.";
            alert(`Gagal memuat data: ${errorMessage}`);
            setAsistenData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAsistenData();
    }, []);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAddData = () => {
        setModalMode('add');
        setSelectedAsisten(null);
        setIsModalOpen(true);
    };

    const handleEditData = (asisten) => {
        setModalMode('edit');
        setSelectedAsisten(asisten);
        setIsModalOpen(true);
    };

    const onDeleteAsisten = async (asistenToDelete) => {
        const id = asistenToDelete.id;
        
        try{
            const response = await api.delete(`/asisten/${id}`);
            
            if (response.status === 200 || response.status === 204) {
                await fetchAsistenData();
                alert("Data Asisten berhasil dihapus!");
            }
        } catch (error) {
            console.error("Gagal menghapus data: ", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Cek console untuk detail.";
            alert(`Gagal menghapus data: ${errorMessage}`);
        }
    };

    const handleModalSubmit = async (formData) => {
        if (modalMode === 'add') {
            try {
                const response = await api.post('/asisten', formData);
                await fetchAsistenData();
                alert("Data berhasil ditambahkan!");
            } catch (error) {
                console.error('Error saat menambahkan data:', error.response || error);
                const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan yang tidak diketahui.";
                alert(`Gagal menambahkan data: ${errorMessage}`);
            }
        } else if (modalMode === 'edit' && selectedAsisten) {
            try {
                const id = selectedAsisten.id;
                const response = await api.put(`/asisten/${id}`, formData);
                await fetchAsistenData();
                alert("Data berhasil diperbarui!");
            } catch (error) {
                console.error('Error saat memperbarui data:', error.response || error);
                const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan yang tidak diketahui saat memperbarui data.";
                alert(`Gagal memperbarui data: ${errorMessage}`);
            }
        } else {
            alert('Mode tidak valid atau data asisten tidak terpilih.');
        }
        setIsModalOpen(false);
    };

    return (
        <>
            <DashboardHeader title="Data Asisten" />
            <main className="p-4">
                <DataTable
                    data={asistenData}
                    columns={ASISTEN_COLUMNS}
                    title="Data Asisten"
                    onSearch={handleSearch}
                    onAdd={handleAddData}
                    onEdit={handleEditData}
                    onDelete={onDeleteAsisten}
                    totalPages={5}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    isLoading={isLoading} 
                />
            </main>

            <AsistenModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedAsisten}
                mode={modalMode}
            />
        </>
    )
}