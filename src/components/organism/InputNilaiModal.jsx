import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/atoms/Select'; 
import Button from '@/components/atoms/Button';
import api from '@/lib/api';

const GradeInput = ({ label, value, onChange, gradeTypeId }) => (
    <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center space-x-1 border border-gray-300 rounded-lg px-2 py-1 bg-white">
            <button 
                onClick={() => onChange(gradeTypeId, Math.max(0, value - 1))} 
                type="button"
                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-lg transition duration-150"
            >
                -
            </button>
            <input 
                type="number"
                value={value}
                onChange={(e) => onChange(gradeTypeId, Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className="w-full text-center border-0 focus:outline-none focus:ring-0 text-lg py-1"
                min="0"
                max="100"
                placeholder="0"
            />
            <button 
                onClick={() => onChange(gradeTypeId, Math.min(100, value + 1))}
                type="button"
                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-lg transition duration-150"
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

const InputNilaiModal = ({ 
    isOpen, 
    onClose, 
    gradeTypes, 
    weekTypeId, 
    onSaveSuccess,
    projectsData, 
    isLoadingProjects 
}) => {
    const [kelompokOptions, setKelompokOptions] = useState([]);
    const [projectOptions, setProjectOptions] = useState([]);
    
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

    useEffect(() => {
        if (isOpen) {
            setError(null);            
            setFormData({
                kelompok: '',
                project_id: '',
                notes: '',
                grades: gradeTypes.map(type => ({
                    grade_type_id: type.id,
                    grade: 0,
                })),
            });
            
            const projects = projectsData || [];
            
            if (projects.length === 0 && !isLoadingProjects) {
                setError("Tidak ada proyek yang sudah dinilai tersedia.");
                setKelompokOptions([]);
                setProjectOptions([]);
                return;
            }
            
            // 1. Ekstraksi Kelompok Unik
            const uniqueKelompok = [...new Set(projects.map(p => p.group_name || 'Tidak ada kelompok'))];
            const kOptions = uniqueKelompok.map(k => ({ 
                value: k, 
                label: k 
            }));
            setKelompokOptions(kOptions);
            
            // 2. Set Kelompok Default
            const defaultKelompok = kOptions[0]?.value || '';
            
            // 3. Filter Proyek berdasarkan Kelompok Default
            const filteredProjects = projects.filter(p => 
                (p.group_name || 'Tidak ada kelompok') === defaultKelompok
            );
            const pOptions = filteredProjects.map(p => ({ 
                value: p.id.toString(), 
                label: p.name || p.nama_proyek || 'Proyek #' + p.id
            }));
            setProjectOptions(pOptions);

            // 4. Set Form Data Awal (termasuk default Kelompok/Proyek)
            setFormData(prev => ({
                ...prev,
                kelompok: defaultKelompok,
                project_id: pOptions[0]?.value || '',
                grades: gradeTypes.map(type => ({
                    grade_type_id: type.id,
                    grade: 0,
                })),
            }));
        }
    }, [isOpen, gradeTypes, projectsData, isLoadingProjects]); 

    // Update proyek ketika kelompok berubah
    const handleKelompokChange = (kelompok) => {
        setFormData(prev => ({ ...prev, kelompok, project_id: '' }));
        
        const filteredProjects = projectsData.filter(p => 
            (p.group_name || 'Tidak ada kelompok') === kelompok
        );
        const pOptions = filteredProjects.map(p => ({ 
            value: p.id.toString(), 
            label: p.name || p.nama_proyek || 'Proyek #' + p.id
        }));
        setProjectOptions(pOptions);
        
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.project_id) {
            setError("Silakan pilih proyek terlebih dahulu.");
            return;
        }

        if (!weekTypeId) {
            setError("Week Type ID tidak valid. Silakan pilih minggu di luar modal.");
            return;
        }

        setIsSaving(true);
        setError(null);

        const payload = {
            week_type_id: weekTypeId,
            notes: formData.notes || '',
            date: new Date().toISOString().split('T')[0], 
            project_id: parseInt(formData.project_id),
            grades: formData.grades.map(g => ({
                grade_type_id: g.grade_type_id,
                grade: g.grade,
            })),
        };
        
        try {
            const response = await api.post("/week", payload);

            alert('Penilaian berhasil disimpan!');
            onSaveSuccess();
            onClose();

        } catch (e) {
            const errorMsg = e.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
            console.error("Error saat menyimpan:", e.response?.data || e);
            setError(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl transform transition-all duration-300">
                
                {/* Header Modal */}
                <div className="px-8 py-5 border-b border-gray-200 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">Penilaian Mingguan</h2>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-8">
                        {/* Kelompok */}
                        <div className="flex flex-col space-y-1">
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
                                    className="border-gray-300 bg-gray-50 h-11"
                                    disabled={kelompokOptions.length === 0}
                                />
                            )}
                        </div>

                        {/* Nama Proyek */}
                        <div className="flex flex-col space-y-1">
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
                                    className="border-gray-300 bg-gray-50 h-11"
                                />
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-8 pt-4">
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

                    <div className="flex flex-col space-y-2 pt-4">
                        <label className="text-sm font-medium text-gray-700">Catatan</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
                            placeholder="tambahkan catatan"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-6">
                        <button 
                            onClick={onClose} 
                            type="button" 
                            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            disabled={isSaving}
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleSubmit}
                            type="submit" 
                            className="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition font-medium disabled:bg-purple-300 disabled:cursor-not-allowed"
                            disabled={isSaving || isLoadingProjects || !formData.project_id}
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
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
    projectsData: PropTypes.array.isRequired,
    isLoadingProjects: PropTypes.bool.isRequired,
};

export default InputNilaiModal;