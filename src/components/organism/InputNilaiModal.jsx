import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/atoms/Select'; 
import Button from '@/components/atoms/Button';
import api from '@/lib/api';

const GradeInput = ({ label, value, onChange, gradeTypeId }) => (
    <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-primary font-semibold">{label}</label>
        <div className="flex items-center space-x-1 border border-primary rounded-sm px-2 py-1 bg-white">
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
    isLoadingProjects,
    itemToEdit 
}) => {
    const [kelompokOptions, setKelompokOptions] = useState([]);
    const [projectOptions, setProjectOptions] = useState([]);
    
    const initialGrades = gradeTypes.map(type => ({
        grade_type_id: type.id,
        grade: 0,
    }));
    
    const [formData, setFormData] = useState({
        kelompok: '',
        project_id: '',
        notes: '',
        grades: initialGrades,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);            
            
            const projects = projectsData || [];
            
            if (projects.length === 0 && !isLoadingProjects) {
                setError("Tidak ada proyek tersedia untuk dinilai.");
                setKelompokOptions([]);
                setProjectOptions([]);
                return;
            }
            
            const uniqueKelompok = [...new Set(projects.map(p => p.group_name || 'Tidak ada kelompok'))];
            const kOptions = uniqueKelompok.map(k => ({ 
                value: k, 
                label: k 
            }));
            setKelompokOptions(kOptions);
            
            let defaultKelompok = kOptions[0]?.value || '';
            let defaultProjectId = '';
            let defaultNotes = '';
            let defaultGrades = gradeTypes.map(type => ({ grade_type_id: type.id, grade: 0 }));

            let filteredProjects = projects.filter(p => 
                (p.group_name || 'Tidak ada kelompok') === defaultKelompok
            );
            
            if (itemToEdit) {
                defaultKelompok = itemToEdit.project?.group_name || '';
                defaultProjectId = itemToEdit.project_id?.toString() || '';
                defaultNotes = itemToEdit.notes || '';
                
                defaultGrades = gradeTypes.map(type => {
                    const existingGrade = itemToEdit.grades?.find(g => g.grade_type.id === type.id);
                    return {
                        grade_type_id: type.id,
                        grade: existingGrade ? parseFloat(existingGrade.grade) : 0,
                    };
                });
                
                filteredProjects = projects.filter(p => 
                    (p.group_name || 'Tidak ada kelompok') === defaultKelompok
                );
            }
            
            const pOptions = filteredProjects.map(p => ({ 
                value: p.id.toString(), 
                label: p.name || p.nama_projek || 'Proyek #' + p.id 
            }));
            setProjectOptions(pOptions);

            if (!itemToEdit && pOptions.length > 0) {
                defaultProjectId = pOptions[0].value;
            }

            setFormData({
                kelompok: defaultKelompok,
                project_id: defaultProjectId,
                notes: defaultNotes,
                grades: defaultGrades,
            });
        }
    }, [isOpen, gradeTypes, projectsData, isLoadingProjects, itemToEdit]); 

    const handleKelompokChange = (kelompok) => {
        setFormData(prev => ({ ...prev, kelompok, project_id: '' }));
        
        const filteredProjects = projectsData.filter(p => 
            (p.group_name || 'Tidak ada kelompok') === kelompok
        );
        const pOptions = filteredProjects.map(p => ({ 
            value: p.id.toString(), 
            label: p.name || p.nama_projek || 'Proyek #' + p.id
        }));
        setProjectOptions(pOptions);
        
        if (pOptions.length > 0) {
            setFormData(prev => ({ ...prev, project_id: pOptions[0].value }));
        }
    };

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
            if (itemToEdit) {
                await api.put(`/week/${itemToEdit.id}`, payload);
                alert('Penilaian berhasil diperbarui!');
            } else {
                await api.post("/week", payload);
                alert('Penilaian berhasil disimpan!');
            }

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
                    <h2 className="text-2xl font-semibold text-primary">Penilaian Mingguan</h2>
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
                            <label className="text-sm font-semibold font-medium text-primary">
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
                                    className="border border-primary bg-gray-50 h-11 rounded-sm"
                                    disabled={kelompokOptions.length === 0 || itemToEdit} // Disable jika edit
                                />
                            )}
                        </div>

                        {/* Nama Proyek */}
                        <div className="flex flex-col space-y-1">
                            <label className="text-sm font-semibold font-medium text-primary">
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
                                    className="border border-primary bg-gray-50 h-11 rounded-sm"
                                    disabled={itemToEdit} 
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
                        <label className="text-sm font-medium text-primary font-semibold">Catatan</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                            className="w-full h-32 p-3 border border border-primary focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
                            placeholder="tambahkan catatan"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-6">
                        <button 
                            onClick={onClose} 
                            type="button" 
                            className="px-6 py-2 bg-white border border-primary text-gray-700 rounded-sm hover:bg-gray-50 transition font-medium"
                            disabled={isSaving}
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleSubmit}
                            type="submit" 
                            className="px-6 py-2 bg-primary text-white rounded-sm hover:bg-background-dark transition font-medium disabled:bg-purple-300 disabled:cursor-not-allowed"
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
    itemToEdit: PropTypes.object, 
};

InputNilaiModal.defaultProps = {
    itemToEdit: null,
};

export default InputNilaiModal;