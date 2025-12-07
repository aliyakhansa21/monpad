"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import DataTable from "@/components/organism/DataTable";
import ProjectModal from "@/components/organism/ProjectModal";
import GroupCreationModal from "@/components/organism/GroupCreationModal";
import ManageMembersModal from "@/components/organism/ManageMembersModal";
import api from '@/lib/api'; 

export default function DataProjectPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isGroupCreationModalOpen, setIsGroupCreationModalOpen] = useState(false);
    const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false); 
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectToGroup, setProjectToGroup] = useState(null);
    const [groupToManage, setGroupToManage] = useState(null);
    const [projectData, setProjectData] = useState([]);
    const [groupData, setGroupData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dosenList, setDosenList] = useState([]);
    const [asistenList, setAsistenList] = useState([]);

    const fetchProjectAndGroupData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [projectRes, groupRes] = await Promise.all([
                api.get('/project'),
                api.get('/group'),
            ]);

            setProjectData(projectRes.data.data || projectRes.data || []);
            setGroupData(groupRes.data.data || groupRes.data || []);

        } catch (error) {
            console.error("Error fetching project/group data:", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memuat data proyek.";
            alert(`Gagal memuat data: ${errorMessage}. Pastikan server backend berjalan.`);
            
            setProjectData([]); 
            setGroupData([]);

        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUserLists = useCallback(async () => {
        try {
            const [dosenRes, asistenRes] = await Promise.all([
                api.get('/dosen'),
                api.get('/asisten'),
            ]);

            setDosenList(dosenRes.data.data || dosenRes.data || []);
            setAsistenList(asistenRes.data.data || asistenRes.data || []);
        } catch (error) {
            console.error("Error fetching user lists:", error.response || error);
        }
    }, []);

    useEffect(() => {
        fetchProjectAndGroupData();
        fetchUserLists();
    }, [fetchProjectAndGroupData, fetchUserLists]);

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
        const confirmDelete = window.confirm(
            `Apakah Anda yakin ingin menghapus proyek "${projectToDelete.nama_projek}"?\n\n` +
            `Tindakan ini akan menghapus proyek beserta kelompok dan anggotanya.`
        );
        
        if (!confirmDelete) return;

        const id = projectToDelete.id;
        
        try{
            const response = await api.delete(`/project/${id}`);
            
            if (response.status === 200 || response.status === 204) {
                await fetchProjectAndGroupData();
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
                await fetchProjectAndGroupData();
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
                await fetchProjectAndGroupData();
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

    // Gabungkan data proyek dan kelompok
    const processedData = useMemo(() => {
        const projectGroupMap = new Map();
        groupData.forEach(group => {
            projectGroupMap.set(group.project_id, group);
        });

        return projectData.map(project => {
            const relatedGroup = projectGroupMap.get(project.id);
            
            return {
                ...project,
                group: relatedGroup || null, 
                group_name: relatedGroup ? relatedGroup.nama : '-',
                group_id: relatedGroup ? relatedGroup.id : null,
                'owner.username': project.owner ? project.owner.username : 'N/A',
                asisten_names: Array.isArray(project.asisten) 
                            ? project.asisten.map(a => a.username).join(', ') 
                            : 'Tidak Ada',
            };
        });
    }, [projectData, groupData]);

    // Filter data berdasarkan search term
    const filteredData = useMemo(() => {
        if (!searchTerm) return processedData;
        
        return processedData.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
                item.nama_projek?.toLowerCase().includes(searchLower) ||
                item.group_name?.toLowerCase().includes(searchLower) ||
                item.owner?.username?.toLowerCase().includes(searchLower) ||
                item.semester?.toString().includes(searchLower) ||
                item.tahun_ajaran?.toLowerCase().includes(searchLower)
            );
        });
    }, [processedData, searchTerm]);

    const handleCreateGroup = (project) => {
        console.log("Creating group for project:", project);
        setProjectToGroup(project);
        setIsGroupCreationModalOpen(true);
    };

    const handleCloseGroupCreationModal = () => {
        setProjectToGroup(null);
        setIsGroupCreationModalOpen(false);
    }

    const handleGroupCreationSubmit = async (formData) => {
        try {
            console.log("Submitting group data:", formData);
            const response = await api.post('/group', formData);

            if (response.status === 201 || response.status === 200) {
                await fetchProjectAndGroupData();
                alert(`Kelompok "${formData.name}" berhasil dibuat!\n\nSilakan klik tombol biru untuk mengelola anggota kelompok.`);
                handleCloseGroupCreationModal();
            }
        } catch (error) {
            console.error('Error saat membuat kelompok:', error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat membuat kelompok.";
            alert(`Gagal membuat kelompok: ${errorMessage}`);
            throw error; 
        }
    };

    const handleManageMembers = (group) => {
        console.log("Managing members for group:", group);
        setGroupToManage(group);
        setIsManageMembersModalOpen(true);
    };

    const handleCloseManageMembersModal = () => {
        setGroupToManage(null);
        setIsManageMembersModalOpen(false);
    };

    const handleMembersSaveSuccess = async () => {
        await fetchProjectAndGroupData();
        handleCloseManageMembersModal();
    };

    // KOLOM
    const columns = useMemo(() => [
        { key: 'nama_projek', label: 'Nama Proyek' },
        { key: 'group_name', label: 'Nama Kelompok'},
        { key: 'semester', label: 'Semester' },
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
                if (!asistenData) { return 'Tidak Ada'; }
                if (Array.isArray(asistenData)) {
                    if (asistenData.length === 0) { return 'Tidak Ada'; }
                    return asistenData.map(a => a.username).join(', ');
                } else if (typeof asistenData === 'object' && asistenData.username) {
                    return asistenData.username;         
                } else {
                    return 'Tidak Ada';
                }
            }
        },
        // KOLOM KELOLA TIM
        { 
            key: 'manage_action', 
            label: 'Kelola Tim',
            render: (item) => {
                console.log("Rendering manage action for:", item.nama_projek, "Group:", item.group);
                
                return (
                    <div className="flex items-center justify-center gap-2">
                        {!item.group ? (
                            // Belum ada kelompok
                            <Button 
                                variant="icon-only-2" 
                                aria-label="Buat Kelompok" 
                                onClick={() => handleCreateGroup(item)}
                                title="Buat Kelompok untuk Proyek ini"
                                className="text-yellow-600 hover:bg-yellow-100 transition-colors rounded-lg p-2" 
                            >
                                <Icon name="filled-plus" size={28} />
                            </Button>
                        ) : (
                            // Sudah ada kelompok 
                            <Button 
                                variant="icon-only-2" 
                                aria-label="Kelola Anggota" 
                                onClick={() => handleManageMembers(item.group)}
                                title={`Kelola Anggota Kelompok: ${item.group.nama}`}
                                className="text-blue-600 hover:bg-blue-100 transition-colors rounded-lg p-2" 
                            >
                                <Icon name="filled-plus" size={28} /> 
                            </Button>
                        )}
                    </div>
                );
            }
        },
        { 
            key: 'actions', 
            label:'Aksi',
        },
    ], []);

    return (
        <>
            <DashboardHeader title="Proyek & Kelompok"/>
            <main className="p-4">
                <DataTable
                    data={filteredData}
                    columns={columns}
                    title="Data Project"
                    onSearch={handleSearch}
                    onAdd={handleAddData}
                    onEdit={handleEditData}
                    onDelete={onDeleteProject}
                    totalPages={Math.ceil(filteredData.length / 10)} 
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

            <GroupCreationModal
                isOpen={isGroupCreationModalOpen}
                onClose={handleCloseGroupCreationModal}
                onSubmit={handleGroupCreationSubmit}
                projectToGroup={projectToGroup}
            />

            <ManageMembersModal
                isOpen={isManageMembersModalOpen}
                onClose={handleCloseManageMembersModal}
                groupToManage={groupToManage}
                onSaveSuccess={handleMembersSaveSuccess} 
            />
        </>
    )
}