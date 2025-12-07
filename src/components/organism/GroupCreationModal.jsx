"use client";
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/atoms/Icon';

const GroupCreationModal = ({ isOpen, onClose, onSubmit, projectToGroup }) => {
    const [groupName, setGroupName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setGroupName('');
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!groupName.trim()) { 
            alert("Nama Kelompok tidak boleh kosong!"); 
            return;
        }

        if (!projectToGroup?.id) {
            alert("Data Proyek tidak valid. Silakan tutup modal dan coba lagi.");
            return;
        }

        setIsLoading(true);

        const formData = {
            name: groupName.trim(),
            project_id: parseInt(projectToGroup.id, 10), 
        };

        console.log("Sending group data:", formData);

        try {
            await onSubmit(formData); 
            setGroupName('');
        } catch (error) {
            console.error("Error in modal submit:", error);
        } finally {
            setIsLoading(false); 
        }
    }

    const title = projectToGroup 
        ? `Buat Kelompok untuk Proyek: ${projectToGroup.nama_projek}`
        : "Buat Kelompok Baru";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-primary font-bold text-xl flex items-center justify-center gap-2">
                        <Icon name="filled-plus" size={24} className="text-yellow-600" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-gray-600 mt-2">
                        Kelompok yang dibuat akan digunakan untuk mengelola mahasiswa dalam proyek ini.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                    <div className='grid gap-4 py-4'>
                        {/* Info Proyek */}
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-start gap-2">
                                <Icon name="project" size={20} className="text-primary mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-primary">Proyek:</p>
                                    <p className="text-base font-medium">{projectToGroup?.nama_projek || 'N/A'}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Semester {projectToGroup?.semester} • {projectToGroup?.tahun_ajaran}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="group_name" className="text-sm font-medium">
                                Nama Kelompok <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="group_name"
                                name="group_name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Contoh: Kelompok A, Tim Backend, dll."
                                required
                                disabled={isLoading}
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500">
                                Nama kelompok harus unik dan mudah diingat
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                        <Button 
                            type="button" 
                            variant='secondary' 
                            onClick={onClose} 
                            disabled={isLoading}
                        >
                            Batal
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={isLoading || !groupName.trim()}
                            className="min-w-[120px]"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Membuat...
                                </span>
                            ) : (
                                'Buat Kelompok'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
};

GroupCreationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    projectToGroup: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nama_projek: PropTypes.string.isRequired,
        semester: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        tahun_ajaran: PropTypes.string,
    }),
};

export default GroupCreationModal;