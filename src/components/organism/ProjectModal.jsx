"use client";
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ProjectModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
    const [formData, setFormData] = useState({
        id: '',
        nama_projek: '', 
        deskripsi: '',
        semester: 0, 
        tahun_ajaran: 0, 
        owner_id: '', 
        asisten_id: '',
    });

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                id: initialData.id || '',
                nama_projek: initialData.nama_proyek || '',
                deskripsi: initialData.deskripsi || '',
                semester: initialData.semester || 0,
                tahun_ajaran: initialData.tahun_ajaran || 0,
                owner_id: initialData.owner?.id || '',
                asisten_id: initialData.asisten?.[0]?.id || '', 
            });
        } else if (mode === 'add') {
            setFormData({
                id: '',
                nama_projek: '',
                deskripsi: '',
                semester: 0,
                tahun_ajaran: 0,
                owner_id: '',
                asisten_id: '',
            });
        }
    }, [mode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: (name === 'semester' || name === 'tahun_ajaran' || name === 'owner_id' || name === 'asisten_id') ? parseInt(value, 10) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[960px] md:max-w-xl lg:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-indigo-700 font-bold text-3xl">
                        {mode === 'add' ? 'Tambah Proyek & Kelompok' : 'Perbarui Proyek & Kelompok'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className='grid gap-4 py-4 md:grid-cols-2'>
                        {/* Nama Proyek */}
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="nama_projek" className="md:text-left">Nama Proyek</Label>
                            <div className="md:col-span-3">
                                <Input
                                id="nama_projek"
                                name="nama_projek"
                                value={formData.nama_projek}
                                onChange={handleChange}
                                placeholder="Nama Proyek"
                                required
                                />
                            </div>
                        </div>
                        {/* Deskripsi */}
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="deskripsi" className="md:text-left">Deskripsi</Label>
                            <div className="md:col-span-3">
                                <Input
                                id="deskripsi"
                                name="deskripsi"
                                value={formData.deskripsi}
                                onChange={handleChange}
                                placeholder="Deskripsi"
                                required
                                />
                            </div>
                        </div>
                        {/* Semester */}
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="semester" className="md:text-left">Semester</Label>
                            <div className="md:col-span-3">
                                <Input
                                id="semester"
                                name="semester"
                                type="number" 
                                value={formData.semester}
                                onChange={handleChange}
                                placeholder="Semester"
                                required
                                />
                            </div>
                        </div>
                        {/* Tahun Ajaran */}
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="tahun_ajaran" className="md:text-left">Tahun Ajaran</Label>
                            <div className="md:col-span-3">
                                <Input
                                id="tahun_ajaran"
                                name="tahun_ajaran"
                                type="number" 
                                value={formData.tahun_ajaran}
                                onChange={handleChange}
                                placeholder="Tahun Ajaran"
                                required
                                />
                            </div>
                        </div>
                        {/* Project Owner (Dosen ID) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="owner_id" className="md:text-left">Project Owner (ID)</Label>
                            <div className="md:col-span-3">
                                {/* Di dunia nyata ini SELECT Dosen */}
                                <Input 
                                id="owner_id"
                                name="owner_id" 
                                type="number"
                                value={formData.owner_id}
                                onChange={handleChange}
                                placeholder="ID Owner Dosen"
                                required
                                />
                            </div>
                        </div>
                        {/* Asisten (Asisten ID) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="asisten_id" className="md:text-left">Asisten (ID)</Label>
                            <div className="md:col-span-3">
                                {/* Di dunia nyata ini SELECT Asisten */}
                                <Input
                                id="asisten_id"
                                name="asisten_id"
                                type="number"
                                value={formData.asisten_id}
                                onChange={handleChange}
                                placeholder="ID Asisten"
                                required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <Button type="button" variant='secondary' onClick={onClose}>Batal</Button>
                        <Button type="submit" variant="primary">{mode === 'add' ? 'Simpan' : 'Update'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
};

ProjectModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    mode: PropTypes.string.isRequired,
};

export default ProjectModal;
