"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Select from 'react-select'; 
import PropTypes from 'prop-types'; 
import { AppSidebar } from "@/components/organism/app-sidebar";
import DashboardHeader from '@/components/organism/DashboardHeader';
import Footer from "@/components/organism/Footer";
import Button from '@/components/atoms/Button';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api'; 
import PesertaCard from '@/components/molecules/PesertaCard'; 


export default function PresensiPage() {
    const { isLoggedIn } = useAuth(); 
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [participants, setParticipants] = useState([]); 
    const [groupOptions, setGroupOptions] = useState([]); 
    const [meetingOptions, setMeetingOptions] = useState([]);
    const toggleSidebar = () => { setIsSidebarExpanded(prev => !prev); };
    const mainContentMargin = isSidebarExpanded ? "md:ml-[256px]" : "md:ml-[72px]";

    const handleTogglePresensi = useCallback((presenceId, newState) => {
        setParticipants(prev => 
            prev.map(p => 
                p.presence_id === presenceId ? { ...p, present: newState } : p
            )
        );
    }, []);

    const fetchFilterData = useCallback(async () => {
        if (!isLoggedIn) return;        
        try {
            const [groupRes, meetingRes] = await Promise.all([
                api.get('/group'), 
                api.get('/week'),   
            ]);

            const mappedGroups = groupRes.data.data.map(item => ({
                value: item.id,
                label: item.nama || `Kelompok ${item.id}`, 
            }));
            
            const mappedMeetings = meetingRes.data.data.map((item, index) => ({
                value: item.id, 
                label: `Pertemuan ke-${index + 1} (${item.date ? item.date.substring(0, 10) : 'Tanggal tidak tersedia'})`, 
            }));

            setGroupOptions(mappedGroups);
            setMeetingOptions(mappedMeetings);            
            console.log("✅ Filter data berhasil dimuat.");

        } catch (error) {
            console.error("❌ Gagal memuat filter data:", error.response?.data || error.message);
            alert("Gagal memuat daftar kelompok atau pertemuan. Mohon cek log konsol.");
        }
    }, [isLoggedIn]);

    const fetchPresensiData = useCallback(async (groupId, weekId) => {
        if (!isLoggedIn || !groupId || !weekId) {
            setParticipants([]);
            return;
        }
        
        setIsLoading(true);
        try {
            const url = `/group/${groupId}/weekly-presence/${weekId}`;
            const response = await api.get(url); 

            const mappedData = response.data.data.map(item => ({
                presence_id: item.presence_id, 
                username: item.mahasiswa.username, 
                nim: item.mahasiswa.nim, 
                jabatan: item.mahasiswa.jabatan, 
                present: item.present, 
            }));

            setParticipants(mappedData);

        } catch (error) {
            console.error("Gagal memuat data presensi:", error);
            alert("Gagal memuat data presensi. Mohon periksa konsol.");
            setParticipants([]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn]);
    

    const customStyles = useMemo(() => ({
        control: (provided, state) => ({
            ...provided,
            borderColor: '#52357B', 
            boxShadow: state.isFocused ? '0 0 0 1px #52357B' : 'none', 
            borderColor: state.isFocused ? '#52357B' : provided.borderColor, 
            '&:hover': {
                borderColor: state.isFocused ? '#52357B' : provided.borderColor,
            }
        }),
    }), []);


    const handleSimpanPresensi = useCallback(async () => {
        if (!selectedGroup || !selectedMeeting || participants.length === 0) {
            alert("Pilih Kelompok dan Pertemuan terlebih dahulu.");
            return;
        }

        const groupId = selectedGroup.value;
        const weekId = selectedMeeting.value;
        setIsSubmitting(true);
        
        const payload = {
            presences: participants.map(p => ({
                presence_id: p.presence_id,
                present: p.present,
            })),
        };
        
        try {
            const url = `/group/${groupId}/weekly-presence/${weekId}`;
            const response = await api.put(url, payload); 

            if (response.status === 200 || response.status === 201) {
                alert("Presensi berhasil disimpan!");
                fetchPresensiData(groupId, weekId); 
            } else {
                throw new Error(response.data?.message || `Gagal menyimpan presensi. Status: ${response.status}`);
            }

        } catch (error) {
            console.error("Gagal menyimpan presensi:", error);
            alert(`Gagal menyimpan presensi: ${error.message || 'Terjadi kesalahan server.'}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [participants, selectedGroup, selectedMeeting, fetchPresensiData]);


    useEffect(() => {
        if (isLoggedIn) {
            fetchFilterData();
        }
    }, [isLoggedIn, fetchFilterData]);

    useEffect(() => {
        fetchPresensiData(selectedGroup?.value, selectedMeeting?.value);
    }, [selectedGroup, selectedMeeting, fetchPresensiData]);


    return (
        <>
            <DashboardHeader title="Presensi Peserta"/>                        
            <main className="p-0 md:p-4">
                <div className="p-6">                                
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">                                    
                        {/* Pilih Kelompok */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelompok</label>
                            <Select
                                options={groupOptions}
                                onChange={setSelectedGroup}
                                value={selectedGroup}
                                placeholder="Memuat Kelompok..."
                                classNamePrefix="react-select"
                                customStyles={customStyles}
                                // isDisabled={groupOptions.length === 0}
                            />
                        </div>                                    
                            {/* Pilih Pertemuan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Pertemuan</label>
                                <Select
                                    options={meetingOptions}
                                    onChange={setSelectedMeeting}
                                    value={selectedMeeting}
                                    placeholder="Memuat Pertemuan..."
                                    classNamePrefix="react-select"
                                    // isDisabled={meetingOptions.length === 0}
                                />
                            </div>
                    </div>
                                
                    {/* Daftar Peserta */}
                    {isLoading ? (
                        <div className='text-center py-10'>
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-3 mx-auto"></div>
                                <p className="text-gray-600">Memuat data peserta...</p>
                            </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {participants.length === 0 && (selectedGroup || selectedMeeting) ? (
                                <p className="text-gray-500 md:col-span-2 text-center py-10">Tidak ada data peserta ditemukan untuk filter ini.</p>
                            ) : participants.length === 0 && !(selectedGroup || selectedMeeting) ? (
                                <p className="text-gray-500 md:col-span-2 text-center py-10">Silakan pilih Kelompok dan Pertemuan untuk menampilkan peserta.</p>
                            ) : (
                                participants.map(peserta => (
                                    <PesertaCard
                                        key={peserta.presence_id}
                                        presenceId={peserta.presence_id}
                                        username={peserta.username}
                                        nim={peserta.nim}
                                        jabatan={peserta.jabatan}
                                        initialPresent={peserta.present}
                                        onTogglePresensi={handleTogglePresensi}
                                    />
                                ))
                            )}
                        </div>
                    )}
                                
                    {/* Tombol Aksi */}
                    {participants.length > 0 && (
                        <div className="flex justify-start space-x-4">
                            <Button 
                                variant="cancel"
                                onClick={() => fetchPresensiData(selectedGroup.value, selectedMeeting.value)}
                                disabled={isSubmitting}
                            >
                                Batalkan (Reset Perubahan)
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleSimpanPresensi}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Presensi'}
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}