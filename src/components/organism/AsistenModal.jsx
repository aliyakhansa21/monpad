"use client";
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const AsistenModal = ({ isOpen, onClose, onSubmit, initialData, mode}) => {
    const [formData, setFormData] = useState ({
        id:'',
        name:'',
        email:'',
        password:'',
        password_confirmation:'',
        tahun_ajaran:'',
    });

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                id: initialData.id,
                name: initialData.nama || '',
                email: initialData.email || '',
                password: '',
                password_confirmation: '',
                tahun_ajaran: '',
            });
        } else {
            setFormData({
                id: '',
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                tahun_ajaran: '',
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
            alert("Password dan konfirmasi password tidak sama!");
            return;
        }

        const dataToSubmit = {
            ...formData,
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
                        {mode === 'add' ? 'Tambah Asisten' : 'Perbarui Data Asisten'}
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
                                required
                                />
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
                            <Label htmlFor="tahun_ajaran" className="md:text-center">TAHUN AJARAN</Label>
                            <div className="md:col-span-3">
                                <Input
                                id="tahunajaran"
                                name="tahun_ajaran"
                                value={formData.tahun_ajaran}
                                onChange={handleChange}
                                required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant='secondary' onClick={onClose}>Batal</Button>
                        <Button type="submit" variant="primary">{mode === 'add' ? 'Simpan' : 'Update'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

AsistenModal.PropTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    mode: PropTypes.string.isRequired,
};

export default AsistenModal;