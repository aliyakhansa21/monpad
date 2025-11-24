'use client';

import DashboardHeader from '@/components/organism/DashboardHeader';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const GRADE_MAPPING = {
    kekreatifan: 1,      
    kerajinan: 2,     
    ketaatan: 3,
}

export default function PenilaianAnggotaPage() {
    const { user } = useAuth();
    const [teamData, setTeamData] = useState(null);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    const [kekreatifan, setKekreatifan] = useState(0);
    const [kerajinan, setKerajinan] = useState(0);
    const [ketaatan, setKetaatan] = useState(0);
    // const [kualitas, setKualitas] = useState(0);
    // const [kerjasama, setKerjasama] = useState(0);
    // const [kreativitas, setKreativitas] = useState(0);
    // const [skillTeknis, setSkillTeknis] = useState(0);
    // const [penyelesaianTugas, setPenyelesaianTugas] = useState(0);
    const [catatan, setCatatan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingTeam, setLoadingTeam] = useState(true);

    useEffect (() => {
        const fetchTeamData = async () => {
            try{
                const response = await api.get('/dashboard/mahasiswa');
                const apiData = response.data.data;

                if (apiData.groups && apiData.groups.length > 0) {
                    const currentGroup = apiData.groups[0];
                    const membersToRate = currentGroup.anggota.filter(
                        member => user && member.id !== user.id
                    );

                    setTeamData({
                        id: currentGroup.id,
                        anggota: membersToRate,
                        roles: [... new Set(currentGroup.anggota.map(m => m.jabatan))].filter(r => r)
                    });
                }
            } catch (err) {
                console.error("Gagal memuat data tim:", err);
                alert("Gagal memuat data tim. Pastikan Anda sudah tergabung dalam kelompok.");
            } finally {
                setLoadingTeam(false);
            }
        };

        if (user) {
            fetchTeamData();
        } else {
            setLoadingTeam(false);
        }
    }, [user]);

    const anggotaList = teamData?.anggota || [];
    const roleList = teamData?.roles || [];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!teamData || !teamData.id) {
            alert("Data kelompok belum dimuat. Tidak dapat menyimpan penilaian.");
            return;
        }

        if (!selectedMemberId) {
            alert("Mohon pilih anggota tim yang akan dinilai.");
            return;
        }

        setIsSubmitting(true);

        const gradesData = [
            { personal_grade_type_id: GRADE_MAPPING.kekreatifan, grade: kekreatifan },
            { personal_grade_type_id: GRADE_MAPPING.kerajinan, grade: kerajinan },
            { personal_grade_type_id: GRADE_MAPPING.ketaatan, grade: ketaatan },
        ].filter(g => g.grade >= 0);

        const requestBody = {
            notes: catatan,
            grades: gradesData,
        };

        const groupId = teamData.id;
        const memberId = selectedMemberId;
        const endpoint = `/group/${groupId}/members/${memberId}/qualification`;

        try {
            const response = await api.post(endpoint, requestBody);

            console.log("Penilaian Sukses: ", response.data);
            alert("Penilaian berhasil disimpan!");

            // reset form
            setSelectedMemberId('');
            setKekreatifan(0);
            setKerajinan(0);
            setKetaatan(0);
            // setKualitas(0); 
            // setKerjasama(0); 
            // setKreativitas(0);
            // setSkillTeknis(0); 
            // setPenyelesaianTugas(0);
            setCatatan('');

        } catch (error) {
            console.error("Gagal menyimpan penilaian:", error.response || error);
            const errorMessage = error.response?.data?.message || "Terjadi kesalahan saat menyimpan penilaian.";
            alert(`Gagal menyimpan penilaian: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCounter = (value, setValue, label) => (
        <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center gap-3">
                <button
                type="button"
                onClick={() => setValue(Math.max(0, value - 1))}
                className="w-8 h-8 flex items-center justify-center border border-primary rounded hover:bg-background-dark"
                disabled={isSubmitting}
                >
                −
                </button>
                <span className="w-8 text-center font-medium">{value}</span>
                <button
                type="button"
                onClick={() => setValue(Math.min(10, value + 1))}
                className="w-8 h-8 flex items-center justify-center border border-primary rounded hover:bg-background-dark"
                disabled={isSubmitting}
                >
                +
                </button>
            </div>
        </div>
    );

    const calculateTotal = useMemo(() => {
        const total = kekreatifan + kerajinan + ketaatan;
        return {
        nilaiA: total,
        nilaiB: (total / 5).toFixed(2),
        nilaiC: ((total / 50) * 100).toFixed(0),
        nilaiD: (total / 5).toFixed(2),
        nilaiE: ((total / 50) * 100).toFixed(0),
        };
    }, [kekreatifan, kerajinan, ketaatan]);

    const totals = calculateTotal;

    if (loadingTeam) {
        return <div className="p-4 text-center">Memuat data kelompok...</div>;
    }

    if (!teamData || anggotaList.length === 0) {
        return <div className="p-4 text-center text-red-600">Anda tidak tergabung dalam kelompok atau tidak ada anggota tim untuk dinilai.</div>;
    }


    return (
        <>
            <DashboardHeader title={`Penilaian Anggota Tim`}/>
            <main className='p-0 md:p-4'>
                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-[#4D4F54] mb-6">Penilaian Anggota Tim</h3>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Pilih Anggota Tim */}
                            <div>
                                <label className="block text-sm font-medium text-[#4D4F54] mb-2">
                                    Pilih Anggota Tim
                                </label>
                                <select
                                    value={selectedMemberId}
                                    onChange={(e) => setSelectedMemberId(e.target.value)}
                                    className="w-full px-4 py-2 border border-primary rounded-sm focus:outline-none focus:ring-2 focus:ring-background-dark"
                                    required
                                    disabled={isSubmitting}
                                >
                                    <option value="">Pilih Anggota Tim</option>
                                    {anggotaList.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.username} ({member.jabatan})
                                    </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#4D4F54] mb-2">
                                    Role Anggota Tim
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-primary rounded-sm focus:outline-none focus:ring-2 focus:ring-background-dark"
                                    required
                                    disabled={isSubmitting}
                                >
                                    <option value="">Pilih Role</option>
                                    {roleList.map((role, index) => (
                                    <option key={index} value={role}>
                                        {role}
                                    </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div>
                                {renderCounter (kekreatifan, setKekreatifan, 'Kekreatifan')}
                                {renderCounter (kerajinan, setKerajinan, 'Kerajinan')}
                                {renderCounter (ketaatan, setKetaatan, 'Ketaatan')}
                            {/* {renderCounter(kualitas, setKualitas, 'Kualitas')}
                            {renderCounter(kerjasama, setKerjasama, 'Kerjasama')}
                            {renderCounter(kreativitas, setKreativitas, 'Kreativitas')} */}
                            </div>

                            {/* Right Column */}
                            <div>
                                {/* {renderCounter(skillTeknis, setSkillTeknis, 'Skill Teknis Rolenya')}
                                {renderCounter(penyelesaianTugas, setPenyelesaianTugas, 'Penyelesaian Tugas')} */}
                                
                                {/* Summary Box */}
                                <div className="mt-6 p-4 bg-white rounded border border-gray-300 shadow-sm">
                                    <div className="space-y-1 text-xs text-gray-700">
                                        <div>Sangat buruk 0 - 20</div>
                                        <div>Buruk 21 - 50</div>
                                        <div>Sedang 51 - 75</div>
                                        <div>Baik 76 - 90</div>
                                        <div>Sangat Baik 91 - 100</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Catatan */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                            <textarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                placeholder="tambahkan catatan"
                                rows="4"
                                className="w-full px-4 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-background-dark resize-none"
                                required 
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full mt-6 py-3 bg-primary text-white rounded font-medium hover:bg-background-dark transition-colors disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Penilaian'}
                        </button>
                    </form>
                </div>
            </main>
            
        </>

    );
}