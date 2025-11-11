import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Select from 'react-select'; 
import Input from '@/components/atoms/Input'; 
import { Slider } from '@/components/ui/slider';
import api from '@/lib/api'; 

const ParameterPenilaianModal = ({ isOpen, onClose, onSubmit, existingGradeTypes, totalWeekWeight }) => {
    const [minggu, setMinggu] = useState(null);
    const [aspekList, setAspekList] = useState([]);
    const [bobotMinggu, setBobotMinggu] = useState(0); 
    const [newAspekInput, setNewAspekInput] = useState({ name: '', percentage: 0, id: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
        
    const bobotAspekAkumulasi = useMemo(() => {
        return aspekList.reduce((sum, aspek) => sum + aspek.percentage, 0);
    }, [aspekList]); 

    const mingguOptions = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ 
        value: i + 1, 
        label: `Minggu ke-${i + 1}` 
    })), []);

    const aspekOptions = useMemo(() => existingGradeTypes.map(gt => ({
        value: gt.id,
        label: gt.name,
    })), [existingGradeTypes]);

    const newTotalWeight = useMemo(() => {
        return totalWeekWeight + bobotMinggu;
    }, [totalWeekWeight, bobotMinggu]); 
    
    const maxSliderValue = 100 - totalWeekWeight > 0 ? 100 - totalWeekWeight : 0;
    
    const handleSliderMingguChange = (value) => {
        setBobotMinggu(value[0]);
    };

    const handleSelectMingguChange = (selectedOption) => {
        setMinggu(selectedOption);
    };

    const handleAspectSelect = (selectedOption) => {
        if (selectedOption) {
            const selectedAspectData = existingGradeTypes.find(gt => gt.id === selectedOption.value);

            setNewAspekInput(prev => ({ 
                ...prev, 
                name: selectedOption.label, 
                id: selectedOption.value,
                percentage: selectedAspectData ? selectedAspectData.percentage : 0, 
            }));
        } else {
            setNewAspekInput(prev => ({ 
                ...prev, 
                name: '', 
                id: null,
                percentage: 0, 
            }));
        }
    };
    
    const handleAspectNameInput = (e) => {
        setNewAspekInput(prev => ({ 
            ...prev, 
            name: e.target.value, 
            id: null 
        }));
    };

    const handleAspectPercentageChange = (value) => {
        setNewAspekInput(prev => ({ 
            ...prev, 
            percentage: value[0] 
        }));
    };

    const handleAddAspek = () => {
        const { name, percentage, id } = newAspekInput;
        if (!name || percentage <= 0 || percentage > 100) {
            alert('Nama aspek harus diisi dan bobot harus antara 1% sampai 100%.');
            return;
        }

        if (aspekList.some(a => a.name === name || (id && a.id === id))) {
            alert(`Aspek '${name}' sudah ditambahkan ke daftar penilaian minggu ini.`);
            return;
        }
        
        const existingAspect = existingGradeTypes.find(gt => gt.name.toLowerCase() === name.toLowerCase());
        if (!id && existingAspect) {
            alert(`Aspek '${name}' sudah ada di database (ID: ${existingAspect.id}). Silakan pilih dari dropdown 'Pilih aspek yang sudah ada' di atas untuk menggunakannya.`);
            return;
        }
        
        if (bobotAspekAkumulasi + percentage > 100) {
            alert(`Total bobot aspek melebihi 100%. Sisa yang bisa ditambahkan: ${100 - bobotAspekAkumulasi}%.`);
            return;
        }

        const newItem = {
            cid: Date.now(), 
            id: id, 
            name: name,
            percentage: percentage,
        };
        setAspekList(prev => [...prev, newItem]);
        setNewAspekInput({ name: '', percentage: 0, id: null });
    };

    const handleRemoveAspek = (cid) => {
        setAspekList(prev => prev.filter(aspek => aspek.cid !== cid));
    };

    useEffect(() => {
        if (!isOpen) {
            setMinggu(null);
            setAspekList([]);
            setBobotMinggu(0);
            setNewAspekInput({ name: '', percentage: 0, id: null });
            setIsSubmitting(false);
        }
    }, [isOpen]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi bobot aspek
        if (bobotAspekAkumulasi !== 100) {
            alert(`Total bobot semua aspek harus mencapai 100%. Saat ini: ${bobotAspekAkumulasi}%.`);
            return;
        }

        // Validasi total bobot mingguan
        if (newTotalWeight > 100) {
            alert(`Gagal! Total bobot mingguan melebihi 100%.`);
            return;
        }

        // Validasi bobot minggu
        if (bobotMinggu <= 0) {
            alert('Bobot minggu harus lebih dari 0%.');
            return;
        }

        // Validasi minggu dipilih
        if (!minggu) {
            alert('Minggu ke- harus dipilih.');
            return;
        }

        // Ambil token di awal dan validasi
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert("Sesi tidak ditemukan. Mohon login ulang.");
            window.location.href = '/login'; 
            return;
        }

        setIsSubmitting(true);

        try {
            //Config header yang reusable
            const authConfig = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            };

            const aspekWithId = [];
            
            for (const aspek of aspekList) {
                if (aspek.id) {
                    // Jika sudah punya ID (re-use), langsung tambahkan
                    aspekWithId.push(aspek);
                } else {
                    // POST Aspek baru ke /grade-type
                    try {
                        const res = await api.post('/grade-type', {
                            name: aspek.name,
                            percentage: aspek.percentage,
                        }, authConfig); 
                        
                        const newAspekId = res.data.data.id;
                        aspekWithId.push({ ...aspek, id: newAspekId });
                        
                        console.log(`✅ Aspek "${aspek.name}" berhasil disimpan dengan ID: ${newAspekId}`);
                    } catch (error) {
                        const status = error.response?.status || 'Network Error';
                        const message = error.response?.data?.message || error.message;
                        
                        console.error(`❌ Gagal menyimpan aspek "${aspek.name}":`, error);
                        
                        if (status === 401) {
                            alert(`Sesi Anda telah berakhir. Mohon login kembali.`);
                            localStorage.removeItem('authToken');
                            window.location.href = '/login';
                        } else {
                            alert(`Gagal menyimpan aspek "${aspek.name}". Status: ${status}. Pesan: ${message}`);
                        }
                        
                        setIsSubmitting(false);
                        return;
                    }
                }
            }
            
            const payload = {
                name: minggu.label,
                percentage: bobotMinggu,
                grade_types: aspekWithId.map(a => a.id), 
            };
            
            console.log('📤 Mengirim payload week-type:', payload);            
            await onSubmit(payload);
            
            setMinggu(null);
            setAspekList([]);
            setBobotMinggu(0);
            setNewAspekInput({ name: '', percentage: 0, id: null });
            onClose();

        } catch (error) {
            console.error('❌ Error saat menyimpan parameter:', error);
            
            const status = error.response?.status || 'Error';
            const message = error.response?.data?.message || error.message;
            
            if (status === 401) {
                alert(`Sesi Anda telah berakhir. Mohon login kembali.`);
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            } else {
                alert(`Gagal menyimpan parameter penilaian. Status: ${status}. Pesan: ${message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAspectPercentageSliderDisabled = bobotAspekAkumulasi >= 100 || !newAspekInput.name || !!newAspekInput.id;
    const maxAspectPercentage = newAspekInput.id 
        ? newAspekInput.percentage 
        : (100 - bobotAspekAkumulasi); 
    const aspectSliderMax = maxAspectPercentage > 0 ? maxAspectPercentage : 1; 
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Input Parameter Penilaian</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className='grid gap-6 py-4'>
                        
                        <div className="grid gap-2 sm:grid-cols-4 sm:items-center sm:gap-4">
                            <Label htmlFor="minggu" className="sm:text-left">Minggu ke-</Label>
                            <div className="sm:col-span-3">
                                <Select 
                                    id="minggu"
                                    options={mingguOptions}
                                    value={minggu}
                                    onChange={handleSelectMingguChange} 
                                    placeholder="Pilih Minggu..."
                                    isClearable
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-2">
                            <Label>Bobot penilaian total minggu: {bobotMinggu}% (Sisa Kuota: {100 - totalWeekWeight}%)</Label> 
                            <Slider 
                                min={0} 
                                max={maxSliderValue} 
                                step={1} 
                                value={[bobotMinggu]} 
                                onValueChange={handleSliderMingguChange} 
                                disabled={totalWeekWeight >= 100}
                            />
                            <div className='flex justify-between text-xs text-gray-500'>
                                <span>0%</span>
                                <span>{maxSliderValue}%</span>
                            </div>
                            {totalWeekWeight >= 100 && (
                                <p className="text-red-600 text-sm mt-1">Kuota 100% sudah terpenuhi. Tidak bisa menambah bobot minggu lagi.</p>
                            )}
                        </div>

                        <div className='mt-4 p-4 border rounded-md'>
                            <Label className='font-bold mb-2 block'>Aspek Penilaian (Total Bobot: {bobotAspekAkumulasi}%)</Label>
                            <ul className='space-y-2 mb-3 max-h-40 overflow-y-auto'>
                                {aspekList.map(aspek => (
                                    <li key={aspek.cid} className='flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md'>
                                        <span className={aspek.id ? 'font-medium text-blue-600' : 'font-medium'}>
                                            {aspek.name} {aspek.id ? '(Re-used ID: '+aspek.id+')' : '(BARU)'}
                                        </span>
                                        <div className='flex items-center space-x-2'>
                                            <span className='font-semibold'>{aspek.percentage}%</span>
                                            <Button 
                                                variant='icon-only' 
                                                size='sm' 
                                                onClick={() => handleRemoveAspek(aspek.cid)}
                                                aria-label={`Hapus ${aspek.name}`}
                                            >
                                                <Icon name="remove-red" size={20} />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                                {aspekList.length === 0 && <li className='text-center text-gray-500'>Belum ada aspek yang ditambahkan.</li>}
                            </ul>
                            
                            <div className={`text-center font-semibold text-sm ${bobotAspekAkumulasi === 100 ? 'text-green-600' : 'text-red-600'}`}>
                                Total Bobot Aspek: {bobotAspekAkumulasi}% (Harus 100%)
                            </div>
                        </div>

                        <div className='grid gap-3 p-4 border rounded-md bg-gray-50'>
                            <Label className='font-semibold'>Tambahkan Aspek Baru/Pilih Ulang</Label>                            
                            <div className="grid gap-2 sm:grid-cols-3 sm:items-center sm:gap-4">
                                <Label className="sm:text-left">Nama Aspek</Label>
                                <div className="sm:col-span-2">
                                    <Select
                                        options={aspekOptions}
                                        value={aspekOptions.find(opt => opt.value === newAspekInput.id)}
                                        onChange={handleAspectSelect}
                                        placeholder="Pilih aspek yang sudah ada"
                                        isClearable
                                    />
                                    <Input
                                        className='mt-2'
                                        placeholder='Atau ketik nama aspek baru'
                                        value={newAspekInput.name}
                                        onChange={handleAspectNameInput}
                                        disabled={!!newAspekInput.id} 
                                    />
                                </div>
                            </div>
                            
                            <div className="grid gap-2 sm:grid-cols-3 sm:items-center sm:gap-4">
                                <Label className="sm:text-left">Bobot (%)</Label>
                                <div className="sm:col-span-2">
                                    <Slider
                                        min={1} 
                                        max={aspectSliderMax}
                                        step={1}
                                        value={[newAspekInput.percentage]}
                                        onValueChange={handleAspectPercentageChange}
                                        disabled={isAspectPercentageSliderDisabled} 
                                    />
                                    <div className='text-sm mt-1'>
                                        {newAspekInput.percentage}% (Maks: {maxAspectPercentage}%)
                                    </div>
                                </div>
                            </div>
                            <Button 
                                type="button" 
                                variant='primary'
                                className="w-full justify-center mt-3" 
                                onClick={handleAddAspek}
                                disabled={bobotAspekAkumulasi >= 100 || !newAspekInput.name || newAspekInput.percentage <= 0}
                            >
                                <span className='mr-2'>Tambahkan Aspek</span>
                                <Icon name="filled-plus" size={20} />
                            </Button>
                        </div>
                    </div>
                    <DialogFooter className='mt-6 flex-col-reverse sm:flex-row sm:justify-end'>
                        <Button 
                            type="button" 
                            variant='secondary' 
                            onClick={onClose} 
                            className="w-full sm:w-auto mt-2 sm:mt-0"
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={bobotAspekAkumulasi !== 100 || bobotMinggu <= 0 || !minggu || newTotalWeight > 100 || isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Parameter'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

ParameterPenilaianModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    existingGradeTypes: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        percentage: PropTypes.number,
    })).isRequired,
    totalWeekWeight: PropTypes.number.isRequired,
};

export default ParameterPenilaianModal;