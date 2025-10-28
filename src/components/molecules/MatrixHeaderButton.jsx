import React from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

const MatriksHeaderButton = ({ onClick }) => {
    return (
        <div className="flex justify-start mb-4">
            <Button 
                onClick={onClick} 
                variant="primary" 
                className="text-sm text-primary flex items-center p-0 md:p-1" 
            >
                <Icon name="filled-plus" size={18} className="mr-1" />
                Parameter Penilaian
            </Button>
        </div>
    );
};

MatriksHeaderButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default MatriksHeaderButton;