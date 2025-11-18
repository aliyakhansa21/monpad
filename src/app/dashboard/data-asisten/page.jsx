"use client";
import { AppSidebar } from "@/components/organism/app-sidebar";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import DataTable from "@/components/organism/DataTable";
import Footer from "@/components/organism/Footer";
import AsistenModal from "@/components/organism/AsistenModal";

const ASISTEN_COLUMNS = [
    { key:'username', label: 'Nama' },
    { key:'email', label: 'Email'},
    { key: 'tahun_ajaran', label: 'TahunAjaran' },
    { key: 'nim', label: 'NIM' },
    { key: 'actions', label: 'Aksi' },
];

export default function DataAsistenPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' atau 'edit'
    const [selectedAsisten, setSelectedAsisten] = useState(null);
    const [asistenData, setAsistenData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const LARAVEL_API_BASE_URL = 'https://simpad.novarentech.web.id/api';

    const fetchAsistenData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${LARAVEL_API_BASE_URL}/asisten`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Gagal mengambil data dari server: ${response.status} - ${errorText}');
            }

            const result = await response.json();
            setAsistenData(result.data);
        } catch (error) {
            // console.error("Gagal mengambil data: ", error);
            console.error("Error saat menambahkan data:", error);
            alert("Gagal memuat data: ${error.message}");
            setAsistenData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAsistenData();
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
            const response = await fetch(`${LARAVEL_API_BASE_URL}/asisten/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchAsistenData();
                alert("Data Asisten berhasil dihapus!");
            } else {
                const errorText = await response.text();
                throw new Error("Gagal menghapus data: ${response.status} - ${errorText}");
            }
        } catch (error) {
            console.error("Gagal menghapus data: ", error);
            alert("Gagal menghapus data. Cek console untuk detail.");
        }
    };

    const handleModalSubmit = async (formData) => {
        if (modalMode === 'add') {
            try {
                const response = await fetch(`${LARAVEL_API_BASE_URL}/asisten`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage = "Gagal menyimpan data ke server: ${response.status}";
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = `${errorMessage} - ${errorText.substring(0, 100)}...`;
                    }
                    throw new Error(errorMessage);
                }

                await fetchAsistenData();

                alert("Data berhasil ditambahkan!");
            } catch (error) {
                console.error('Error saat menambahkan data:', error);
                
                let errorMessage = "Terjadi kesalahan yang tidak diketahui.";

                if (error && error.status === 500) {
                    errorMessage = "Kesalahan Server Internal (500). Mohon hubungi tim Backend.";
                } else if (error && error.message) {
                    errorMessage = error.message;
                }

                alert(`Gagal menambahkan data: ${errorMessage}`);
            }
        } else {
            alert("Data berhasil diperbarui!");
        }
        setIsModalOpen(false);
    };

    const mainContentMargin = isSidebarExpanded ? "ml-[256px]" : "ml-[72px]" ;

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
    );
}