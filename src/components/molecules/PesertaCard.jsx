import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const PesertaCard = ({ presenceId, username, nim, jabatan, initialPresent, onTogglePresensi }) => {
    const [isPresent, setIsPresent] = useState(initialPresent);
    
    const handleCheckboxChange = () => {
        const newState = !isPresent;
        setIsPresent(newState);
        onTogglePresensi(presenceId, newState); 
    };

    useEffect(() => {
        setIsPresent(initialPresent);
    }, [initialPresent]);
    
    const cardBorderClass = isPresent ? 'border-green-500' : 'border-gray-300';
    
    return (
        <div className={`bg-white p-4 border rounded-lg shadow-sm flex justify-between items-start transition-all duration-200 ${cardBorderClass}`}>
            <div className="flex-1 space-y-1">
                <p className="font-semibold text-lg">{username}</p>
                <p className="text-sm text-gray-600">NIM: {nim}</p>
                <p className="text-xs text-purple-600 font-medium">{jabatan}</p>
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <span className={`text-sm font-medium ${isPresent ? 'text-green-600' : 'text-red-600'}`}>
                        {isPresent ? 'Hadir' : 'Absen'}
                    </span>
                    <input
                        type="checkbox"
                        checked={isPresent}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                        aria-label={`Presensi ${username}`}
                    />
                </label>
            </div>
        </div>
    );
};

PesertaCard.propTypes = {
    presenceId: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    nim: PropTypes.string.isRequired,
    jabatan: PropTypes.string.isRequired,
    initialPresent: PropTypes.bool.isRequired,
    onTogglePresensi: PropTypes.func.isRequired,
};

export default PesertaCard;