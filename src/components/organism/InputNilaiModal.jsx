import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/atoms/Select'; 
import Button from '@/components/atoms/Button';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// --- Komponen Input Angka dengan Tombol +/- ---
const GradeInput = ({ label, value, onChange, gradeTypeId }) => (
    <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center space-x-1 border border-gray-300 rounded px-2 py-1 bg-white">
            <button 
                onClick={() => onChange(gradeTypeId, Math.max(0, value - 1))} 
                type="button"
                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-lg"
            >
                −
            </button>
            <input 
                type="number"
                value={value}
                onChange={(e) => onChange(gradeTypeId, Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className="w-12 text-center border-0 focus:outline-none focus:ring-0"
                min="0"
                max="100"
            />
            <button 
                onClick={() => onChange(gradeTypeId, Math.min(100, value + 1))}
                type="button"
                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-lg"
            >
                +
            </button>
        </div>
    </div>
);

GradeInput.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    gradeTypeId: PropTypes.number.isRequired,
};

// --- Komponen Modal Utama ---
const InputNilaiModal = ({ isOpen, onClose, gradeTypes, weekTypeId, onSaveSuccess }) => {
    const [kelompokOptions, setKelompokOptions] = useState([]);
    const [projectOptions, setProjectOptions] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [formData, setFormData] = useState({
        kelompok: '',
        project_id: '',
        notes: '',
        grades: gradeTypes.map(type => ({
            grade_type_id: type.id,
            grade: 0,
        })),
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Fetch Daftar Proyek dan Kelompok
    useEffect(() => {
        if (isOpen) {
            const fetchProjects = async () => {
                setIsLoadingProjects(true);
                setError(null);
                try {
                    console.log("Fetching projects from:", `${API_BASE_URL}/project`);
                    
                    const response = await fetch(`${API_BASE_URL}/project`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                    });
                    
                    console.log("Response status:", response.status);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: Gagal mengambil daftar proyek`);
                    }
                    
                    const result = await response.json();
                    console.log("Projects dari API:", result);
                    
                    const projects = result.data || [];
                    
                    if (projects.length === 0) {
                        setError("Tidak ada proyek tersedia. Silakan tambahkan proyek terlebih dahulu.");
                        setKelompokOptions([]);
                        setProjectOptions([]);
                        return;
                    }
                    
                    // Simpan semua proyek
                    setAllProjects(projects);
                    
                    // Ekstrak kelompok unik
                    const uniqueKelompok = [...new Set(projects.map(p => p.group_name || 'Tidak ada kelompok'))];
                    const kOptions = uniqueKelompok.map(k => ({ 
                        value: k, 
                        label: k 
                    }));
                    setKelompokOptions(kOptions);
                    
                    // Set kelompok pertama sebagai default
                    const defaultKelompok = kOptions[0]?.value || '';
                    
                    // Filter proyek berdasarkan kelompok pertama
                    const filteredProjects = projects.filter(p => 
                        (p.group_name || 'Tidak ada kelompok') === defaultKelompok
                    );
                    const pOptions = filteredProjects.map(p => ({ 
                        value: p.id.toString(), 
                        label: p.nama_proyek || p.name || 'Proyek #' + p.id
                    }));
                    setProjectOptions(pOptions);

                    // Reset form
                    setFormData({
                        kelompok: defaultKelompok,
                        project_id: pOptions[0]?.value || '',
                        notes: '',
                        grades: gradeTypes.map(type => ({
                            grade_type_id: type.id,
                            grade: 0,
                        })),
                    });

                } catch (e) {
                    console.error("Error fetching projects:", e);
                    setError(`Gagal mengambil daftar proyek: ${e.message}`);
                    setKelompokOptions([]);
                    setProjectOptions([]);
                }
                finally {
                    setIsLoadingProjects(false);
                }
            };
            
            fetchProjects();
        }
    }, [isOpen, gradeTypes]);

    // Update proyek ketika kelompok berubah
    const handleKelompokChange = (kelompok) => {
        setFormData(prev => ({ ...prev, kelompok, project_id: '' }));
        
        // Filter proyek berdasarkan kelompok
        const filteredProjects = allProjects.filter(p => 
            (p.group_name || 'Tidak ada kelompok') === kelompok
        );
        const pOptions = filteredProjects.map(p => ({ 
            value: p.id.toString(), 
            label: p.nama_proyek || p.name || 'Proyek #' + p.id
        }));
        setProjectOptions(pOptions);
        
        // Set proyek pertama sebagai default
        if (pOptions.length > 0) {
            setFormData(prev => ({ ...prev, project_id: pOptions[0].value }));
        }
    };

    // Update nilai grade
    const handleGradeChange = useCallback((gradeTypeId, newGrade) => {
        setFormData(prev => ({
            ...prev,
            grades: prev.grades.map(g => 
                g.grade_type_id === gradeTypeId ? { ...g, grade: newGrade } : g
            ),
        }));
    }, []);

    // Handle Submit ke API (POST /api/week)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.project_id) {
            setError("Silakan pilih proyek terlebih dahulu.");
            return;
        }

        if (!weekTypeId) {
            setError("Week Type ID tidak valid.");
            return;
        }

        setIsSaving(true);
        setError(null);

        // Sesuaikan payload dengan dokumentasi API
        const payload = {
            week_type_id: weekTypeId,
            notes: formData.notes || '',
            date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
            project_id: parseInt(formData.project_id),
            grades: formData.grades.map(g => ({
                grade_type_id: g.grade_type_id,
                grade: g.grade,
            })),
        };
        
        console.log("Payload yang dikirim:", payload);

        try {
            const response = await fetch(`${API_BASE_URL}/week`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            console.log("Response status:", response.status);
            const responseData = await response.json();
            console.log("Response dari API:", responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Gagal menyimpan nilai.');
            }

            // Sukses
            alert('Penilaian berhasil disimpan!');
            onSaveSuccess();
            onClose();

        } catch (e) {
            console.error("Error saat menyimpan:", e);
            setError(e.message || 'Terjadi kesalahan saat menyimpan data.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl transform transition-all duration-300">
                
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Penilaian Mingguan</h2>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    
                    {/* Row 1: Kelompok & Nama Proyek */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Kelompok */}
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Kelompok
                            </label>
                            {isLoadingProjects ? (
                                <div className="text-sm text-gray-500 p-2.5 bg-gray-50 rounded-lg border border-gray-300">
                                    Memuat...
                                </div>
                            ) : (
                                <Select 
                                    options={kelompokOptions}
                                    value={formData.kelompok}
                                    onChange={(e) => handleKelompokChange(e.target.value)}
                                    placeholder="Kelompok"
                                    className="border-gray-300"
                                />
                            )}
                        </div>

                        {/* Nama Proyek */}
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Nama Proyek
                            </label>
                            {isLoadingProjects ? (
                                <div className="text-sm text-gray-500 p-2.5 bg-gray-50 rounded-lg border border-gray-300">
                                    Memuat...
                                </div>
                            ) : projectOptions.length === 0 ? (
                                <div className="text-sm text-gray-500 p-2.5 bg-gray-50 rounded-lg border border-gray-300">
                                    Tidak ada proyek
                                </div>
                            ) : (
                                <Select 
                                    options={projectOptions}
                                    value={formData.project_id}
                                    onChange={(e) => setFormData(p => ({ ...p, project_id: e.target.value }))}
                                    placeholder="Nama Proyek"
                                    className="border-gray-300"
                                />
                            )}
                        </div>
                    </div>
                    
                    {/* Row 2: Input Nilai (Horizontal) */}
                    <div className="grid grid-cols-3 gap-4">
                        {gradeTypes.map(type => (
                            <GradeInput
                                key={type.id}
                                label={type.name}
                                gradeTypeId={type.id}
                                value={formData.grades.find(g => g.grade_type_id === type.id)?.grade || 0}
                                onChange={handleGradeChange}
                            />
                        ))}
                    </div>

                    {/* Row 3: Catatan */}
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-700">Catatan</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                            className="w-full h-28 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
                            placeholder="contohkan catatan"
                        />
                    </div>
                </form>

                {/* Footer Tombol */}
                <div className="px-8 py-5 border-t border-gray-200 flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        type="button" 
                        className="px-8 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        disabled={isSaving}
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSubmit}
                        type="button" 
                        className="px-8 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:bg-purple-300 disabled:cursor-not-allowed"
                        disabled={isSaving || isLoadingProjects || !formData.project_id}
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

InputNilaiModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    gradeTypes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        percentage: PropTypes.number,
    })).isRequired,
    weekTypeId: PropTypes.number,
    onSaveSuccess: PropTypes.func.isRequired,
};

export default InputNilaiModal;