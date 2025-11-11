import React from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

const MatrixHeaderButton = ({ onClick }) => {
    return (
        <div className="flex justify-start mb-4">
            <Button
                onClick={onClick}
                variant="icon-only-2"
                className="
                    bg-white
                    text-[#291B3E]   
                    font-semibold
                    rounded-2xl
                    shadow-sm
                    hover:shadow-md
                    transition-all
                    flex items-center
                    px-4 py-2 
                    border border-gray-100
                    flex-shrink-0 
                "
            >
                <div
                    className="
                        text-white
                        rounded-lg
                        w-7 h-7 
                        flex items-center justify-center
                        mr-3
                        mr-2 sm:mr-3
                        w-6 h-6 sm:w-7 sm:h-7
                    "
                >
                    <Icon name="filled-plus" size={25} />
                </div>
                <span className="text-sm md:text-base">
                    Parameter Penilaian
                </span>
            </Button>
        </div>
    );
};

MatrixHeaderButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default MatrixHeaderButton;