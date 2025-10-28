import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider'; 

const AspekPenilaianModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        percentage: 0,
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: '', percentage: 0 });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            name: e.target.value,
        }));
    };
    
    const handleSliderChange = (value) => {
        setFormData(prevState => ({
            ...prevState,
            percentage: value[0], // Slider biasanya mengembalikan array
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-primary font-bold text-xl">
                        {initialData ? 'Edit Aspek Penilaian' : 'Tambah Aspek Penilaian'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className='grid gap-4 py-4'>
                        {/* Nama Aspek */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Aspek Penilaian</Label>
                            <div className="col-span-3">
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nama Aspek"
                                    required
                                />
                            </div>
                        </div>
                        {/* Bobot Penilaian (Slider) */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="percentage" className="text-left">Bobot Penilaian: {formData.percentage}%</Label>
                            <Slider
                                id="percentage"
                                name="percentage"
                                min={0}
                                max={100}
                                step={1}
                                value={[formData.percentage]}
                                onValueChange={handleSliderChange}
                                className="w-full"
                            />
                            <div className='flex justify-between text-xs text-gray-500'>
                                <span>0%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className='mt-4'>
                        <Button type="button" variant='secondary' onClick={onClose}>Batal</Button>
                        <Button type="submit" variant="primary">Simpan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

AspekPenilaianModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.object,
};

export default AspekPenilaianModal;