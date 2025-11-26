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

        // console.log("Item To Review:", itemToReview);
        // console.log("ID Week yang diakses:", itemToReview?.week?.id);

        const weekId = itemToReview.id;

        if (!weekId) {
            setError('ID Week tidak ditemukan pada item review.');
            setIsSubmitting(false);
            return;
        }

        try {
            const hasExistingReview = itemToReview.review && itemToReview.review.id;
            
            if (hasExistingReview) {
                // await api.put(`/week/{week}/review/${itemToReview.review.id}`, {
                await api.put(`/week/${weekId}/review/${itemToReview.review.id}`, {
                    note: reviewNote,
                    week_id: itemToReview.id
                });
            } else {
                // await api.post('/week/{week}/review', {
                await api.post(`/week/${weekId}/review`, {
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
                <div className="sticky top-0 bg-white text-background-dark px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-bold text-center">Review Penilaian</h2>
                    <p className="text-sm font-semibold mt-1 text-center">
                        {itemToReview.project?.group_name} | {itemToReview.project?.nama_projek}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">                    
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
                            className="w-full px-4 py-3 border border-primary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                            required
                        />
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