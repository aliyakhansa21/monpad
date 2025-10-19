"use client";
import { AppSidebar } from "@/components/organism/app-sidebar";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import DataTable from "@/components/organism/DataTable";
import Footer from "@/components/organism/Footer";
import MahasiswaModal from "@/components/organism/MahasiswaModal";

const MAHASISWA_COLUMNS = [
    { key: 'nama', label: 'Nama' },
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
    const [modalMode, setModalMode] = useState('add'); // 'add' atau 'edit'
    const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
    const [mahasiswaData, setMahasiswaData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMahasiwaData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/backend/mahasiswa');
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gagal mengambil data dari server: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            setMahasiswaData(result.data); 
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            alert(`Gagal memuat data: ${error.message}`);
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
            const response = await fetch(`/api/backend/mahasiswa/${id}`, { 
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchMahasiwaData(); 
                alert("Data Mahasiswa berhasil dihapus!");
            } else {
                const errorText = await response.text();
                throw new Error(`Gagal menghapus data: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error("Error saat menghapus data: ", error);
            alert("Gagal menghapus data. Cek console untuk detail.");
        }    
    };

    const handleModalSubmit = async (formData) => { 
        if (modalMode === 'add') {
            try {
                const response = await fetch('/api/backend/mahasiswa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(formData), 
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage = `Gagal menyimpan data ke server: ${response.status}`;
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = `${errorMessage} - ${errorText.substring(0, 100)}...`;
                    }
                    throw new Error(errorMessage);
                }

                await fetchMahasiwaData(); 

                alert('Data berhasil ditambahkan!');

            } catch (error) {
                console.error("Error saat menambahkan data:", error);
                alert(`Gagal menambahkan data: ${error.message}`);
            }

        } else {
            
            // setMahasiswaData(prev => 
            //     prev.map(item => 
            //         item.id === selectedMahasiswa.id 
            //             ? { ...item, ...formData }
            //             : item
            //     )
            // );
            
            alert('Data berhasil diperbarui!');
        }
        setIsModalOpen(false); 
    };


    const mainContentMargin = isSidebarExpanded ? "ml-[256px]" : "ml-[72px]";

    return (
        <div className="flex flex-col min-h-screen">
            {/* Sidebar */}
            <div className="fixed top-0 left-0 h-full z-10">
                <AppSidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={toggleSidebar}
                />
            </div>
            {/* Main Content Area*/}
            <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                <div className='p-3 flex-1 bg-background-light'>
                    <div className={`pl-6`}>
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
                            />
                        </main>
                    </div>
                    
                </div>
                <Footer />
            </div>

            <MahasiswaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedMahasiswa}
                mode={modalMode}
            />
        </div>
    );
}