"use client";
import { AppSidebar } from "@/components/organism/app-sidebar";
import { useEffect, useState, useCallback, useMemo } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import DataTable from "@/components/organism/DataTable";
import Footer from "@/components/organism/Footer";
import ProjectModal from "@/components/organism/ProjectModal";

const PROJECT_COLUMNS = [
    { key: 'nama_proyek', label: 'Nama Proyek' },
    { key: 'semester', label: 'Semester' },
    { key: 'tahun_ajaran', label: 'Tahun Ajaran' },
    // Menggunakan fungsi render khusus untuk data bersarang (owner)
    { 
        key: 'owner.username', 
        label: 'Owner (Dosen)',
        render: (item) => item.owner ? item.owner.username : 'N/A' 
    },
    // Menggunakan fungsi render untuk array (asisten)
    { 
        key: 'asisten', 
        label: 'Asisten',
        render: (item) => item.asisten ? item.asisten.map(a => a.username).join(', ') : 'Tidak Ada'
    },
    { key: 'actions', label:'Aksi' },
];

export default function DataProjectPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectData, setProjectData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const LARAVEL_API_BASE_URL = 'http://localhost:8000/api';

    const fetchProjectData = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = `${LARAVEL_API_BASE_URL}/project`;
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gagal mengambil data dari server: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            setProjectData(data.data || data); 

        } catch (error) {
            console.error("Error fetching project data:", error);
            alert(`Gagal memuat data: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, currentPage]);

    useEffect(() => {
        fetchProjectData();
    }, [fetchProjectData]);


    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1); 
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleAddData = () => {
        setModalMode('add');
        setSelectedProject(null);
        setIsModalOpen(true);
    };

    const handleEditData = (project) => {
        setModalMode('edit');
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const onDeleteProject = async (projectToDelete) => {
        const id = projectToDelete.id;
        
        try{
            const response = await fetch(`${LARAVEL_API_BASE_URL}/project/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchProjectData();
                alert("Data project berhasil dihapus!");
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
                const response = await fetch(`${LARAVEL_API_BASE_URL}/project`, {
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

                await fetchProjectData();

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
    
    // Peningkatan: Pastikan data ditampilkan bahkan jika ada properti bersarang
    // menggunakan memoization untuk menghindari perhitungan berulang
    const processedData = useMemo(() => {
        return projectData.map(project => ({
            ...project,
            // Membuat properti datar untuk kemudahan akses di kolom
            'owner.username': project.owner ? project.owner.username : 'N/A',
            // Menggabungkan nama asisten untuk tampilan tabel
            asisten_names: project.asisten ? project.asisten.map(a => a.username).join(', ') : 'Tidak Ada',
        }));
    }, [projectData]);

    return (
        <div className="flex h-screen bg-background-light">
            {/* Sidebar */}
            <div className="fixed z-50 md:z-30">
                <AppSidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={toggleSidebar}
                />
            </div>
            {/* Main Content Area */}
            <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                <div className="p-3 flex-1 bg-background-light">
                    <div className={"pl-6"}>
                        <DashboardHeader title="Proyek & Kelompok"/>
                        <main className="p-4">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p className="ml-2 text-gray-600">Memuat Data...</p>
                                </div>
                            ) : (
                                <DataTable
                                    data={processedData}
                                    columns={PROJECT_COLUMNS}
                                    title="Data Project"
                                    onSearch={handleSearch}
                                    onAdd={handleAddData}
                                    onEdit={handleEditData}
                                    onDelete={onDeleteProject}
                                    totalPages={5} 
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </main>
                    </div>
                </div>
                <Footer/>
            </div>

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedProject}
                mode={modalMode}
                // Anda perlu menambahkan props untuk data Dosen dan Asisten
                // agar form modal bisa memilih dari daftar (jika belum ada)
                // dosenList={[]} 
                // asistenList={[]}
            />
        </div>
    )

}
