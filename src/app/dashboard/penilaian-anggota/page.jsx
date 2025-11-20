'use client';

import DashboardHeader from '@/components/organism/DashboardHeader';
import { useState } from 'react';

export default function PenilaianAnggotaPage() {
    const [selectedAnggota, setSelectedAnggota] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [kualitas, setKualitas] = useState(0);
    const [kerjasama, setKerjasama] = useState(0);
    const [kreativitas, setKreativitas] = useState(0);
    const [skillTeknis, setSkillTeknis] = useState(0);
    const [penyelesaianTugas, setPenyelesaianTugas] = useState(0);
    const [catatan, setCatatan] = useState('');

    // Data dummy - ganti dengan data dari API
    const anggotaList = [
        'Anggota 1',
        'Anggota 2',
        'Anggota 3',
    ];

    const roleList = [
        'Frontend Developer',
        'Backend Developer',
        'UI/UX Designer',
        'Project Manager',
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const nilaiTotal = kualitas + kerjasama + kreativitas + skillTeknis + penyelesaianTugas;
        const nilaiRataRata = (nilaiTotal / 5).toFixed(2);

        console.log({
        anggota: selectedAnggota,
        role: selectedRole,
        penilaian: {
            kualitas,
            kerjasama,
            kreativitas,
            skillTeknis,
            penyelesaianTugas,
        },
        catatan,
        nilaiTotal,
        nilaiRataRata,
        });

        // Handle submit logic here
        alert('Penilaian berhasil disimpan!');
    };

    const renderCounter = (value, setValue, label) => (
        <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center gap-3">
                <button
                type="button"
                onClick={() => setValue(Math.max(0, value - 1))}
                className="w-8 h-8 flex items-center justify-center border border-primary rounded hover:bg-background-dark"
                >
                −
                </button>
                <span className="w-8 text-center font-medium">{value}</span>
                <button
                type="button"
                onClick={() => setValue(Math.min(10, value + 1))}
                className="w-8 h-8 flex items-center justify-center border border-primary rounded hover:bg-background-dark"
                >
                +
                </button>
            </div>
        </div>
    );

    const calculateTotal = () => {
        const total = kualitas + kerjasama + kreativitas + skillTeknis + penyelesaianTugas;
        return {
        nilaiA: total,
        nilaiB: (total / 5).toFixed(2),
        nilaiC: ((total / 50) * 100).toFixed(0),
        nilaiD: (total / 5).toFixed(2),
        nilaiE: ((total / 50) * 100).toFixed(0),
        };
    };

    const totals = calculateTotal();

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
                                    value={selectedAnggota}
                                    onChange={(e) => setSelectedAnggota(e.target.value)}
                                    className="w-full px-4 py-2 border border-primary rounded-sm focus:outline-none focus:ring-2 focus:ring-background-dark"
                                    required
                                >
                                    <option value="">Pilih Anggota Tim</option>
                                    {anggotaList.map((anggota, index) => (
                                    <option key={index} value={anggota}>
                                        {anggota}
                                    </option>
                                    ))}
                                </select>
                            </div>

                            {/* Role Anggota Tim */}
                            <div>
                                <label className="block text-sm font-medium text-[#4D4F54] mb-2">
                                    Role Anggota Tim
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-primary rounded-sm focus:outline-none focus:ring-2 focus:ring-background-dark"
                                    required
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
                            {/* Left Column - Kriteria */}
                            <div>
                            {renderCounter(kualitas, setKualitas, 'Kualitas')}
                            {renderCounter(kerjasama, setKerjasama, 'Kerjasama')}
                            {renderCounter(kreativitas, setKreativitas, 'Kreativitas')}
                            </div>

                            {/* Right Column - Skill & Summary */}
                            <div>
                            {renderCounter(skillTeknis, setSkillTeknis, 'Skill Teknis Rolenya')}
                            {renderCounter(penyelesaianTugas, setPenyelesaianTugas, 'Penyelesaian Tugas')}
                            
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
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full mt-6 py-3 bg-primary text-white rounded font-medium hover:bg-background-dark transition-colors"
                        >
                            Simpan Penilaian
                        </button>
                    </form>
                </div>
            </main>
            
        </>

    );
}