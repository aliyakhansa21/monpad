import React from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/atoms/Select'; 

const MingguSelect = ({ options, selectedMinggu, onMingguChange, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-48">
                <Select 
                    options={[{ value: '', label: 'Memuat...' }]} 
                    value=""
                    disabled
                    placeholder="Memuat minggu..."
                />
            </div>
        );
    }

    return (
        <div className="w-48">
            <Select 
                options={options} 
                value={selectedMinggu} 
                onChange={(e) => onMingguChange(e.target.value)}
                placeholder="Pilih Minggu"
            />
        </div>
    );
};

MingguSelect.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    })).isRequired,
    selectedMinggu: PropTypes.string.isRequired,
    onMingguChange: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

MingguSelect.defaultProps = {
    isLoading: false,
};

export default MingguSelect;