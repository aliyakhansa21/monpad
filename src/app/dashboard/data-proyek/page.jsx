"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import DataTable from "@/components/organism/DataTable";
import ProjectModal from "@/components/organism/ProjectModal";
import api from '@/lib/api'; 

const PROJECT_COLUMNS = [
    { key: 'nama_projek', label: 'Nama Proyek' },
    { key: 'semester', label: 'Saemester' },
    { key: 'tahun_ajaran', label: 'Tahun Ajaran' },
    { 
        key: 'owner.username', 
        label: 'Owner (Dosen)',
        render: (item) => item.owner ? item.owner.username : 'N/A' 
    },
    { 
        key: 'asisten', 
        label: 'Asisten',
        render: (item) => {
            const asistenData = item.asisten;

            if (!asistenData) {
                return 'Tidak Ada'; 
            }

            if (Array.isArray(asistenData)) {
                if (asistenData.length === 0) {
                    return 'Tidak Ada';
                }
                return asistenData.map(a => a.username).join(', ');
                
            } else if (typeof asistenData === 'object' && asistenData.username) {
                return asistenData.username;         
            } else {
                return 'Tidak Ada';
            }
        }
    },
    { key: 'actions', label:'Aksi' },
];

export default function DataProjectPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectData, setProjectData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dosenList, setDosenList] = useState([]);
    const [asistenList, setAsistenList] = useState([]);

    const fetchProjectData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/project');
            
            const data = response.data;
            setProjectData(data.data || data); 

        } catch (error) {
            console.error("Error fetching project data:", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memuat data proyek.";
            alert(`Gagal memuat data: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, currentPage]);

    const fetchUserLists = useCallback(async () => {
        try {
            const [dosenRes, asistenRes] = await Promise.all([
                api.get('/dosen'),
                api.get('/asisten'),
            ]);

            setDosenList(dosenRes.data.data || dosenRes.data);
            setAsistenList(asistenRes.data.data || asistenRes.data);
        } catch (error) {
            console.error("Error fetching user lists:", error.response || error);
        }
    }, []);

    useEffect(() => {
        fetchProjectData();
        fetchUserLists();
    }, [fetchProjectData, fetchUserLists]);

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
            const response = await api.delete(`/project/${id}`);
            
            if (response.status === 200 || response.status === 204) {
                await fetchProjectData();
                alert("Data project berhasil dihapus!");
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
                const response = await api.post('/project', formData);

                await fetchProjectData();
                alert("Data berhasil ditambahkan!");
            } catch (error) {
                console.error('Error saat menambahkan data:', error.response || error);
                const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat menambahkan data.";
                alert(`Gagal menambahkan data: ${errorMessage}`);
            }
        } else if (modalMode === 'edit' && selectedProject) {
            try {
                const id = selectedProject.id;
                const response = await api.put(`/project/${id}`, formData);

                await fetchProjectData();
                alert("Data berhasil diperbarui!");
            } catch (error) {
                console.error('Error saat memperbarui data:', error.response || error);
                const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memperbarui data.";
                alert(`Gagal memperbarui data: ${errorMessage}`);
            }
        } else {
            alert('Mode tidak valid atau data proyek tidak terpilih.');
        }
        setIsModalOpen(false);
    };
    
    const processedData = useMemo(() => {
        return projectData.map(project => ({
            ...project,
            'owner.username': project.owner ? project.owner.username : 'N/A',
            
            asisten_names: Array.isArray(project.asisten) 
                        ? project.asisten.map(a => a.username).join(', ') 
                        : 'Tidak Ada',
        }));
    }, [projectData]);

    return (
        <>
            <DashboardHeader title="Proyek & Kelompok"/>
            <main className="p-4">
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
                    isLoading={isLoading} 
                />
            </main>
            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedProject}
                mode={modalMode}
                dosenList={dosenList}
                asistenList={asistenList}
            />
        </>
    )

}