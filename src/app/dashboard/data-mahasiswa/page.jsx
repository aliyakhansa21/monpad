"use client";
import { AppSidebar } from "@/components/organism/app-sidebar";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import DataTable from "@/components/organism/DataTable";
import Footer from "@/components/organism/Footer";
import MahasiswaModal from "@/components/organism/MahasiswaModal";

const DataMahasiswa = () => {
    const [mahasiswa, setMahasiswa] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try{
                const response = await fetch('https://127.0.0.1/api/mahasiswa');
                const result = await response.json();
                setMahasiswa(result.data)
            } catch (error){
                console.error("Gagal mengambil data:", error);
            }
        };
        fetchData();
    })
};

// const INITIAL_MAHASISWA_DATA = [
//     { id: 1, nama: 'Aurora Celeste Sinclair', email: 'aurorasclair@gmail.com', nim: '24/102938/SV/10001', angkatan: '2024', prodi: 'TRPL', jabatan: 'PM' },
//     { id: 2, nama: 'Elias Nathaniel Montgomery', email: 'eliasgomery@gmail.com', nim: '24/102938/SV/10001', angkatan: '2024', prodi: 'TRPL', jabatan: 'UI/UX' },
//     { id: 3, nama: 'Seraphina Isolde Lowell', email: 'seraphinalowell@gmail.com', nim: '24/102938/SV/10001', angkatan: '2024', prodi: 'TRPL', jabatan: 'FE' },
//     { id: 4, nama: 'Kael Thaddeus Thorne', email: 'kaelthorne@gmail.com', nim: '24/102938/SV/10001', angkatan: '2024', prodi: 'TRPL', jabatan: 'BE' },
//     { id: 5, nama: 'Elwen Anara Hart', email: 'elwenhart@gmail.com', nim: '24/102938/SV/10001', angkatan: '2024', prodi: 'TRPL', jabatan: 'PM' },
//     { id: 6, nama: 'Lucien Everett Vale', email: 'lucievale@gmail.com', nim: '24/102938/SV/10001', angkatan: '2024', prodi: 'TRPL', jabatan: 'UI/UX' },
//     { id: 7, nama: 'Freya Serene Lancaster', email: 'freyalancaster@gmail.com', nim: '24/102938/SV/10001', angkatan: '2024', prodi: 'TRPL', jabatan: 'FE' },
//     { id: 8, nama: 'Orion Elias Blackwood', email: 'orionblackwood@gmail.com', nim: '24/102938/SV/10001', angkatan: '2024', prodi: 'TRPL', jabatan: 'BE' },
//     { id: 9, nama: 'Celeste Aurora Winters', email: 'celestewinters@gmail.com', nim: '24/102938/SV/10001', angkatan: '2024', prodi: 'TRPL', jabatan: 'PM' },
//     { id: 10, nama: 'Zephyr Julian Aiden', email: 'zephyraiden@gmail.com', nim: '24/102938/SV/10001', angkatan: '2024', prodi: 'TRPL', jabatan: 'UI/UX' },
// ];

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
    // const [mahasiswaData, setMahasiswaData] = useState(INITIAL_MAHASISWA_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' atau 'edit'
    const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
    const [mahasiswaData, setMahasiswaData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMahasiwaData = async () => {
            try{
                const response = await fetch('/api/backend/mahasiswa');

                // if (!response.ok) {
                //     throw new Error('Gagal mengambil data dari server.');
                // }

                const result = await response.json();
                setMahasiswaData(result.data);
            } catch (error){
                console.error("Gagal mengambil data:", error);
            }finally {
                setIsLoading(false);
            }
        };

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

    const handleDeleteData = (mahasiswa) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data ${mahasiswa.nama}?`)) {
            setMahasiswaData(prev => prev.filter(item => item.id !== mahasiswa.id));
            alert('Data berhasil dihapus!');
        }
    };

    const onDeleteMahasiswa = async (mahasiswaToDelete) => {
        const id = mahasiswaToDelete.id;

        try{
            const response = await fetch('api/backend/mahasiswa/${id}', {
                method:'DELETE',
            });
            if (response.ok){
                setMahasiswaData(prevData => prevData.filter(mhs => mhs.id !==id));
                alert("Data Mahasiswa berhasil dihapus!");
            } else {
                const errorText = await response.text();
                throw new Error("Gagal menghapus data: ${response.status} - ${errorText");
            }
        } catch (error) {
            console.error("Error saat menghapus data: ", error);
            alert("Gagal menghapus data. Cek console untuk detail.");
        }    
    };

    const handleModalSubmit = (formData) => {
        if (modalMode === 'add') {
            const newMahasiswa = {
                id: mahasiswaData.length + 1,
                ...formData
            };
            setMahasiswaData(prev => [...prev, newMahasiswa]);
            alert('Data berhasil ditambahkan!');
        } else {
            setMahasiswaData(prev => 
                prev.map(item => 
                    item.id === selectedMahasiswa.id 
                        ? { ...item, ...formData }
                        : item
                )
            );
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
                        <DashboardHeader title="Data Mahasiswa" />
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