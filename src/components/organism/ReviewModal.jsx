"use client";
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '@/lib/api';

const ReviewModal = ({ isOpen, onClose, onSaveSuccess, itemToReview, gradeTypes }) => {
    const [reviewNote, setReviewNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && itemToReview) {
            setReviewNote(itemToReview.review?.note || '');
            setError(null);
        }
    }, [isOpen, itemToReview]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!reviewNote.trim()) {
            setError('Catatan review tidak boleh kosong');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const hasExistingReview = itemToReview.review && itemToReview.review.id;
            
            if (hasExistingReview) {
                await api.put(`/group-note/${itemToReview.review.id}`, {
                    note: reviewNote,
                    week_id: itemToReview.id
                });
            } else {
                await api.post('/group-note', {
                    note: reviewNote,
                    week_id: itemToReview.id
                });
            }

            onSaveSuccess();
            
            setReviewNote('');
        } catch (err) {
            console.error('Gagal menyimpan review:', err);
            setError(err.response?.data?.message || 'Gagal menyimpan review. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !itemToReview) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-primary text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-semibold">Review Penilaian</h2>
                    <p className="text-sm text-white/80 mt-1">
                        {itemToReview.project?.group_name} | {itemToReview.project?.nama_projek}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Display Grades (Read-only) */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Penilaian dari Asisten</h3>
                        
                        <div className="space-y-3">
                            {gradeTypes.map((gradeType) => {
                                const gradeObj = itemToReview.grades?.find(
                                    g => g.grade_type.id === gradeType.id
                                );
                                const gradeValue = gradeObj ? parseFloat(gradeObj.grade).toFixed(0) : 0;
                                
                                return (
                                    <div key={gradeType.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                        <span className="text-sm font-medium text-gray-700">
                                            {gradeType.name} ({gradeType.percentage}%)
                                        </span>
                                        <span className="text-lg font-bold text-primary">
                                            {gradeValue}
                                        </span>
                                    </div>
                                );
                            })}
                            
                            {/* Total Score */}
                            <div className="flex justify-between items-center bg-primary/10 p-3 rounded border-2 border-primary">
                                <span className="text-base font-bold text-gray-800">
                                    Total Skor
                                </span>
                                <span className="text-xl font-bold text-primary">
                                    {parseFloat(itemToReview.total_grade || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Catatan Asisten */}
                        {itemToReview.notes && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Catatan Asisten:</p>
                                <p className="text-sm text-gray-600">{itemToReview.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Review Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Review Dosen <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            placeholder="Masukkan review atau catatan untuk kelompok ini..."
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Review ini akan terlihat oleh asisten dan mahasiswa
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>Simpan Review</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ReviewModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSaveSuccess: PropTypes.func.isRequired,
    itemToReview: PropTypes.object,
    gradeTypes: PropTypes.array.isRequired,
};

export default ReviewModal;