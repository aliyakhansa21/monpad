import React from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/atoms/Button';

const Pagination = ({ totalPages, currentPage, onPageChange}) => {
    const pages = Array.from({ length: totalPages}, (_, i) => i + 1);

    return (
        <div className='flex flex-wrap items-center justify-center space-x-2'>
            <Button
            variant='ghost'
            onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
            >
                Previous
            </Button>

            {pages.map(page => (
                <Button
                key={page}
                variant={page === currentPage ? 'primary' : 'ghost'}
                onClick={() => onPageChange(page)}
                >
                    {page}
                </Button>
            ))}

            <Button
            variant='ghost'
            onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
            >
                Next
            </Button>
        </div>
    );
};

Pagination.propTypes = {
    totalPages: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Pagination;