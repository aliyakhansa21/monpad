"use client";
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const MahasiswaModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        nim: '',
        angkatan: '',
        prodi: '',
        jabatan: '',
    });

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                id: initialData.id,
                name: initialData.nama || '',
                email: initialData.email || '',
                password: '',
                password_confirmation: '',
                nim: initialData.nim || '',
                angkatan: initialData.angkatan || '',
                prodi: initialData.prodi || '',
                jabatan: initialData.jabatan || '',
            });
        } else {
            setFormData({
                id: '',
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                nim: '',
                angkatan: '',
                prodi: '',
                jabatan: '',
            });
        }
    }, [mode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === 'add' && formData.password !== formData.password_confirmation) {
            alert("Password dan Konfirmasi Password tidak sama!");
            return;
        }
        const dataToSubmit = { 
        ...formData, 
        // Mapping kunci FE (konfirmasiPassword) ke kunci BE (password_confirmation)
        password_confirmation: formData.password_confirmation
        };
        
        if (mode === 'edit') {
            delete dataToSubmit.password;
            delete dataToSubmit.password_confirmation;
        }
        onSubmit(dataToSubmit);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[960px] md:max-w-xl lg:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-primary font-bold text-3xl">
                        {mode === 'add' ? 'Tambah Mahasiswa' : 'Perbarui Data Mahasiswa'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4 md:grid-cols-2">
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="nama" className="md:text-center">Nama</Label>
                            <div className="md:col-span-3">
                                <Input 
                                id="nama" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="md:text-center">Email</Label>
                            <div className="md:col-span-3">
                                <Input 
                                id="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                type="email" 
                                required />
                            </div>
                        </div>
                        {mode === 'add' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                                    <Label htmlFor="password" className="md:text-center">Password</Label>
                                    <div className="md:col-span-3">
                                        <Input 
                                        id="password" 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        type="password" 
                                        required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                                    <Label htmlFor="konfirmasiPassword" className="md:text-center">Konfirmasi Password</Label>
                                    <div className="md:col-span-3">
                                        <Input 
                                        id="konfirmasiPassword" 
                                        name="password_confirmation" 
                                        value={formData.konfirmasiPassword} 
                                        onChange={handleChange} 
                                        type="password" 
                                        required />
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="nim" className="md:text-center">NIM</Label>
                            <div className='md:col-span-3'>
                                <Input 
                                id="nim" 
                                name="nim" 
                                value={formData.nim} 
                                onChange={handleChange} 
                                required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="angkatan" className="md:text-center">Angkatan</Label>
                            <div className="md:col-span-3">
                                <Input 
                                id="angkatan" 
                                name="angkatan" 
                                value={formData.angkatan} 
                                onChange={handleChange} 
                                required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="prodi" className="md:text-center">Program Studi</Label>
                            <div className='md:col-span-3'>
                                <Input 
                                id="prodi" 
                                name="prodi" 
                                value={formData.prodi} 
                                onChange={handleChange} 
                                required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                            <Label htmlFor="jabatan" className="md:text-center">Jabatan</Label>
                            <div className='md:col-span-3'>
                                <select
                                    id="jabatan"
                                    name="jabatan"
                                    value={formData.jabatan}
                                    onChange={handleChange}
                                    required
                                    className="flex h-10 w-full rounded-md border border-primary bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:text-sm"
                                >
                                    <option value="">Pilih Jabatan</option>
                                    <option value="PM">PM</option>
                                    <option value="UI/UX">UI/UX</option>
                                    <option value="FE">FE</option>
                                    <option value="BE">BE</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" variant="primary">{mode === 'add' ? 'Simpan' : 'Update'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

MahasiswaModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    mode: PropTypes.string.isRequired,
};

export default MahasiswaModal;