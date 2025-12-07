"use client";
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import api from '@/lib/api'; 

const ManageMembersModal = ({ isOpen, onClose, groupToManage, onSaveSuccess }) => {
    const [allMahasiswa, setAllMahasiswa] = useState([]); 
    const [allGroups, setAllGroups] = useState([]);
    const [currentMemberIds, setCurrentMemberIds] = useState(new Set()); 
    const [initialMemberIds, setInitialMemberIds] = useState(new Set());
    
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const currentGroupId = groupToManage?.id;

    // Fetch Data
    const fetchGroupData = useCallback(async () => {
        if (!currentGroupId) return;

        setIsLoading(true);
        try {
            const [allMahasiswaRes, allGroupsRes, membersRes] = await Promise.all([
                api.get('/mahasiswa'),
                api.get('/group'),
                api.get(`/group/${currentGroupId}/members`)
            ]);

            const allMahasiswaList = allMahasiswaRes.data.data || allMahasiswaRes.data || [];
            const allGroupsList = allGroupsRes.data.data || allGroupsRes.data || [];
            const currentMembersList = membersRes.data.data || []; 

            const memberIdSet = new Set(currentMembersList.map(m => m.id));
            
            setAllMahasiswa(allMahasiswaList); 
            setAllGroups(allGroupsList);
            setCurrentMemberIds(memberIdSet);
            setInitialMemberIds(new Set(memberIdSet));

            console.log("Loaded members:", currentMembersList);

        } catch (error) {
            console.error("Error fetching data:", error.response || error);
            alert("Gagal memuat data mahasiswa atau anggota kelompok.");
        } finally {
            setIsLoading(false);
        }
    }, [currentGroupId]);

    useEffect(() => {
        if (isOpen && currentGroupId) {
            setSearchTerm('');
            fetchGroupData();
        }
    }, [isOpen, currentGroupId, fetchGroupData]);

    // Helper: Cek apakah mahasiswa sudah punya kelompok lain
    const getMahasiswaGroupStatus = useCallback((mahasiswaId) => {
        for (const group of allGroups) {
            if (group.id === currentGroupId) continue;
            
            if (group.members && Array.isArray(group.members)) {
                const isMember = group.members.some(m => m.id === mahasiswaId || m.user_id === mahasiswaId);
                if (isMember) {
                    return { hasGroup: true, groupName: group.nama };
                }
            }
        }
        return { hasGroup: false, groupName: null };
    }, [allGroups, currentGroupId]);

    // Filtering Data
    const filteredMahasiswa = allMahasiswa.filter(m => {
        const matchesSearch = m.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (m.nim && m.nim.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (!matchesSearch) return false;
        if (currentMemberIds.has(m.id)) return true;

        const groupStatus = getMahasiswaGroupStatus(m.id);
        return !groupStatus.hasGroup;
    });

    const availableMahasiswa = filteredMahasiswa.filter(m => !currentMemberIds.has(m.id));
    const currentMembers = filteredMahasiswa.filter(m => currentMemberIds.has(m.id));
    
    // State Management
    const handleAddMember = (mahasiswaId) => {
        const newSet = new Set(currentMemberIds);
        newSet.add(mahasiswaId);
        setCurrentMemberIds(newSet);
    };

    const handleRemoveMember = (mahasiswaId) => {
        const newSet = new Set(currentMemberIds);
        newSet.delete(mahasiswaId);
        setCurrentMemberIds(newSet);
    };

    // Check changes
    const hasChanges = () => {
        if (currentMemberIds.size !== initialMemberIds.size) return true;
        for (let id of currentMemberIds) {
            if (!initialMemberIds.has(id)) return true;
        }
        return false;
    };

    // Save
    const handleSaveMembers = async () => {
        if (!hasChanges()) {
            alert("Tidak ada perubahan untuk disimpan.");
            return;
        }

        const confirmSave = window.confirm(
            `Apakah Anda yakin ingin menyimpan perubahan?\n\nTotal anggota: ${currentMemberIds.size} mahasiswa`
        );

        if (!confirmSave) return;

        setIsSaving(true);
        const userIdsToSync = Array.from(currentMemberIds);

        try {
            const res = await api.post(`/group/${currentGroupId}/members`, { 
                user_id: userIdsToSync,
            });

            if (res.status === 200 || res.status === 201) {
                alert(`✅ Anggota kelompok "${groupToManage.nama}" berhasil diperbarui!\n\nTotal anggota: ${userIdsToSync.length} mahasiswa`);
                if (onSaveSuccess) await onSaveSuccess();
            }
        } catch (error) {
            console.error("Gagal menyimpan:", error.response || error);
            alert(`❌ Gagal menyimpan: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[700px]">
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg font-medium text-primary">Memuat data...</p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isSaving && !open && onClose()}>
            <DialogContent className="max-w-[95vw] sm:max-w-[900px] lg:max-w-[1000px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
                
                <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
                    <DialogHeader>
                        <DialogTitle className="text-center text-primary font-bold text-xl flex items-center justify-center gap-2">
                            <Icon name="user-group" size={24} className="text-blue-600" />
                            Kelola Anggota Kelompok
                        </DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            <span className="font-semibold text-base text-primary">
                                {groupToManage?.nama || 'N/A'}
                            </span>
                            <br />
                            <span className="text-xs text-gray-600">
                                Tambahkan atau hapus anggota dari kelompok ini
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* Statistics */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200 flex justify-around items-center text-center mt-3">
                        <div>
                            <p className="text-xs text-gray-600">Total Mahasiswa</p>
                            <p className="text-xl font-bold text-primary">{allMahasiswa.length}</p>
                        </div>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <div>
                            <p className="text-xs text-gray-600">Anggota Dipilih</p>
                            <p className="text-xl font-bold text-blue-600">{currentMemberIds.size}</p>
                        </div>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <div>
                            <p className="text-xs text-gray-600">Tersedia</p>
                            <p className="text-xl font-bold text-yellow-600">{availableMahasiswa.length}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        
                        {/* KIRI: Mahasiswa Tersedia */}
                        <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col h-[450px]">
                            <div className="flex-shrink-0 p-3 border-b bg-gray-50">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                    <Icon name="user" size={16} />
                                    Mahasiswa Tersedia 
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                        {availableMahasiswa.length}
                                    </span>
                                </h3>
                                <Input
                                    placeholder="🔍 Cari Nama atau NIM..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="text-sm h-9"
                                />
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {availableMahasiswa.length > 0 ? (
                                    availableMahasiswa.map(m => (
                                        <div 
                                            key={m.id} 
                                            className="flex justify-between items-center p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-all group"
                                        >
                                            <div className='flex flex-col text-sm flex-1 min-w-0 pr-2'>
                                                <span className='font-medium text-gray-800 truncate'>{m.username}</span>
                                                <span className='text-xs text-gray-500'>NIM: {m.nim || 'N/A'}</span>
                                            </div>
                                            <Button 
                                                variant="icon-only-2" 
                                                onClick={() => handleAddMember(m.id)}
                                                className="text-primary hover:text-white hover:bg-primary rounded-full p-1.5 transition-all flex-shrink-0"
                                                title="Tambahkan"
                                            >
                                                <Icon name="filled-plus" size={16} />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                                        <Icon name="user" size={40} className="opacity-30 mb-2" />
                                        <p className="text-center text-xs">
                                            {searchTerm ? 'Tidak ditemukan' : 'Semua sudah jadi anggota'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="border-2 border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden flex flex-col h-[450px]">
                            <div className="flex-shrink-0 p-3 border-b bg-white/50">
                                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                                    <Icon name="user-group" size={16} />
                                    Anggota Terpilih
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        {currentMembers.length}
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">Klik 🗑️ untuk hapus</p>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {currentMembers.length > 0 ? (
                                    currentMembers.map(m => (
                                        <div 
                                            key={m.id} 
                                            className="flex justify-between items-center p-2 bg-white border border-blue-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all group"
                                        >
                                            <div className='flex flex-col text-sm flex-1 min-w-0 pr-2'>
                                                <span className='font-medium text-gray-800 truncate'>{m.username}</span>
                                                <span className='text-xs text-gray-500'>NIM: {m.nim || 'N/A'}</span>
                                            </div>
                                            <Button 
                                                variant="icon-only-2" 
                                                onClick={() => handleRemoveMember(m.id)}
                                                className="text-red-400 hover:text-white hover:bg-red-500 rounded-full p-1.5 transition-all flex-shrink-0"
                                                title="Hapus"
                                            >
                                                <Icon name="remove-red" size={16} />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                                        <Icon name="user-group" size={40} className="opacity-30 mb-2" />
                                        <p className="text-center text-xs">Belum ada anggota</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <div className="text-xs text-gray-600">
                        {hasChanges() ? (
                            <span className="text-orange-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
                                Perubahan belum disimpan
                            </span>
                        ) : (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                Tidak ada perubahan
                            </span>
                        )}
                    </div>
                    
                    <div className="flex space-x-2">
                        <Button 
                            type="button" 
                            variant='secondary' 
                            onClick={onClose} 
                            disabled={isSaving}
                            className="text-sm"
                        >
                            {hasChanges() ? 'Batal' : 'Tutup'}
                        </Button>
                        <Button 
                            type="button" 
                            variant='primary' 
                            onClick={handleSaveMembers} 
                            disabled={isSaving || !hasChanges()}
                            className="min-w-[120px] text-sm"
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
};

ManageMembersModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    groupToManage: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nama: PropTypes.string.isRequired,
    }),
    onSaveSuccess: PropTypes.func,
};

export default ManageMembersModal;