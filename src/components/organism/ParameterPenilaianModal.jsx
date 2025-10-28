import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Select from 'react-select';
import { Slider } from '@/components/ui/slider';
import AspekPenilaianModal from './AspekPenilaianModal';

const LARAVEL_API_BASE_URL = 'http://localhost:8000/api';

const ParameterPenilaianModal = ({ isOpen, onClose, onSubmit }) => {
    const [minggu, setMinggu] = useState(null);
    const [aspekList, setAspekList] = useState([]);
    const [isAspekModalOpen, setIsAspekModalOpen] = useState(false);
    const [editingAspek, setEditingAspek] = useState(null);

    const bobotAspekTotal = useMemo(() => {
        return aspekList.reduce((sum, aspek) => sum + aspek.percentage, 0);
    }, [aspekList]); 
    
    const TARGET_BOBOT_MINGGU = 100;

    const mingguOptions = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ 
        value: i + 1, 
        label: `Minggu ke-${i + 1}` 
    })), []);

    const handleAddAspek = async (newAspek) => {
        if (editingAspek) {
            setAspekList(prev => prev.map(a => 
                a.id === editingAspek.id ? { ...a, ...newAspek } : a
            ));
            setEditingAspek(null);
            return; 
        }

        try {
            const postedAspek = await postAspek(newAspek); 
            
            setAspekList(prev => [...prev, {
                ...newAspek,
                id: postedAspek.id, 
                apiName: postedAspek.name,
            }]);
        } catch (error) {

        }
    };

    const handleRemoveAspek = (id) => {
        setAspekList(prev => prev.filter(aspek => aspek.id !== id));
    };

    const handleEditAspek = (aspek) => {
        setEditingAspek(aspek);
        setIsAspekModalOpen(true);
    };

    const postAspek = async (aspekData) => {
        try {
            const response = await fetch(`${LARAVEL_API_BASE_URL}/grade-type`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: aspekData.name,
                    percentage: aspekData.percentage,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gagal membuat Aspek baru: ${errorText.substring(0, 100)}...`);
            }
            
            const data = await response.json();
            return data.data; 
        } catch (error) {
            alert(`Error POST Aspek: ${error.message}`);
            throw error; 
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (bobotAspekTotal !== TARGET_BOBOT_MINGGU) {
            alert(`Bobot total aspek harus mencapai ${TARGET_BOBOT_MINGGU}%. Saat ini: ${bobotAspekTotal}%.`);
            return;
        }

        // payload untuk POST /api/week-type
        const payload = {
            name: minggu.label, 
            percentage: bobotAspekTotal,
            
            // Hanya kirimkan ID dari GradeType yang sudah dibuat
            grade_types: aspekList.map(aspek => aspek.id), 
        };
        
        await onSubmit(payload);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] lg:max-w-[550px] p-6 md:p-8">
                <DialogHeader>
                    <DialogTitle className="text-center text-primary font-bold text-xl">Parameter Penilaian</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className='grid gap-6 py-4'>
                        {/* Pilihan Minggu Ke- */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="minggu">Minggu ke-</Label>
                            <Select 
                                id="minggu"
                                options={mingguOptions}
                                value={minggu}
                                onChange={setMinggu}
                                placeholder="Pilih Minggu"
                                required
                            />
                        </div>
                        
                        {/* Bobot Penilaian Total */}
                        <div className="flex flex-col gap-2 mt-2">
                            <Label>Bobot penilaian total: {bobotAspekTotal}%</Label>
                            {/* Slider untuk visualisasi total 100% */}
                            <Slider min={0} max={100} step={1} value={[bobotAspekTotal]} disabled />
                            <div className='flex justify-between text-xs text-gray-500'>
                                <span>0%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        {/* Daftar Aspek Penilaian */}
                        <div className="flex flex-col gap-3 pt-2">
                            <Label className='font-semibold'>Aspek Penilaian</Label>
                            
                            {aspekList.map((aspek) => (
                                <div 
                                    key={aspek.id} 
                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                                >
                                    <span className="font-medium text-gray-800 cursor-pointer flex-1" onClick={() => handleEditAspek(aspek)}>
                                        {aspek.name}
                                    </span>
                                    
                                    <div className='flex items-center space-x-3'>
                                        <span className="text-primary font-semibold w-10 text-right">{aspek.percentage}%</span>
                                        <Button type="button" variant="icon-only-2" onClick={() => handleRemoveAspek(aspek.id)}>
                                            <Icon name="remove-red" size={20} /> 
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            
                            <Button 
                                type="button" 
                                variant='secondary' 
                                className="w-full justify-center mt-3" 
                                onClick={() => { setEditingAspek(null); setIsAspekModalOpen(true); }}
                            >
                                <span className='mr-2'>Tambah Aspek Penilaian</span>
                                <Icon name="filled-plus" size={20} />
                            </Button>
                        </div>
                    </div>
                    <DialogFooter className='mt-6'>
                        <Button type="button" variant='secondary' onClick={onClose}>Batal</Button>
                        {/* Tombol simpan akan disable jika bobot tidak 100 atau minggu belum dipilih */}
                        <Button type="submit" variant="primary" disabled={bobotAspekTotal !== TARGET_BOBOT_MINGGU || !minggu}>Simpan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            
            <AspekPenilaianModal
                isOpen={isAspekModalOpen}
                onClose={() => { setIsAspekModalOpen(false); setEditingAspek(null); }}
                onSubmit={handleAddAspek}
                initialData={editingAspek}
            />
        </Dialog>
    );
};

ParameterPenilaianModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default ParameterPenilaianModal;