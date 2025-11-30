"use client";
import { AppSidebar } from "@/components/organism/app-sidebar";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import DataTable from "@/components/organism/DataTable";
import Footer from "@/components/organism/Footer";
import MahasiswaModal from "@/components/organism/MahasiswaModal";
import api from "@/lib/api"; 

const MAHASISWA_COLUMNS = [
    { key: 'username', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { key: 'nim', label: 'NIM' },
    { key: 'angkatan', label: 'Angkatan' },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'jabatan', label: 'Jabatan' },
    { key: 'actions', label: 'Aksi' },
];

export default function DataMahasiswaPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); 
    const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
    const [mahasiswaData, setMahasiswaData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    
    const fetchMahasiwaData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/mahasiswa');            
            setMahasiswaData(response.data.data); 
        } catch (error) {
            console.error("Gagal mengambil data:", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memuat data.";
            alert(`Gagal memuat data: ${errorMessage}`);
            setMahasiswaData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMahasiwaData();
    }, []);

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
        setSelectedMahasiswa(null);
        setIsModalOpen(true);
    };

    const handleEditData = (mahasiswa) => {
        setModalMode('edit');
        setSelectedMahasiswa(mahasiswa);
        setIsModalOpen(true);
    };

    const onDeleteMahasiswa = async (mahasiswaToDelete) => {
        const id = mahasiswaToDelete.id;

        try {
            const response = await api.delete(`/mahasiswa/${id}`);            

            if (response.status === 200 || response.status === 204) {
                await fetchMahasiwaData(); 
                alert("Data Mahasiswa berhasil dihapus!");
            } else {                 
                throw new Error("Gagal menghapus data."); 
            }
        } catch (error) {
            console.error("Error saat menghapus data: ", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Cek console untuk detail.";
            alert(`Gagal menghapus data: ${errorMessage}`);
        }    
    };

    const handleModalSubmit = async (formData) => { 
        if (modalMode === 'add') {
            try {               
                const response = await api.post('/mahasiswa', formData);

                await fetchMahasiwaData(); 

                alert('Data berhasil ditambahkan!');

            } catch (error) {
                console.error("Error saat menambahkan data:", error.response || error);
                const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat menambahkan data.";
                alert(`Gagal menambahkan data: ${errorMessage}`);
            }

        } else if (modalMode === 'edit' && selectedMahasiswa) { 
            try {
                const id = selectedMahasiswa.id;
                const response = await api.put(`/mahasiswa/${id}`, formData);

                await fetchMahasiwaData();

                alert('Data berhasil diperbarui!');

            } catch (error) {
                console.error("Error saat memperbarui data:", error.response || error);
                const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memperbarui data.";
                alert(`Gagal memperbarui data: ${errorMessage}`);
            }

        } else {
            alert('Mode tidak valid atau data mahasiswa tidak terpilih.');
        }
        setIsModalOpen(false); 
    };


    const mainContentMargin = isSidebarExpanded ? "ml-[256px]" : "ml-[72px]";

    return (
        <>
            <DashboardHeader title="Data Mahasiswa"/>
            <main className="p-4">
                <DataTable
                    data={mahasiswaData}
                    columns={MAHASISWA_COLUMNS}
                    title="Data Mahasiswa"
                    onSearch={handleSearch}
                    onAdd={handleAddData}
                    onEdit={handleEditData}
                    onDelete={onDeleteMahasiswa}
                    totalPages={5} 
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    isLoading={isLoading} 
                />
            </main>
            <MahasiswaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedMahasiswa}
                mode={modalMode}
            />
        </>
    );
}