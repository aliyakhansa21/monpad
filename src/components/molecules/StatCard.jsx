import React from 'react';
import PropTypes from 'prop-types';

/**
 * Komponen Card Statistik yang Dapat Digunakan Kembali
 * * @param {string} title - Label deskriptif di bawah angka.
 * @param {number|string} value - Angka utama (misalnya, 100).
 * @param {string} iconColor - Warna ikon/lingkaran (misalnya, 'bg-purple-600').
 * @param {string} gradientStart - Warna awal gradien border (misalnya, 'from-blue-400').
 * @param {string} gradientEnd - Warna akhir gradien border (misalnya, 'to-purple-600').
 */
const StatCard = ({ title, value, iconColor, gradientStart, gradientEnd }) => {    
    const gradientClasses = `w-full h-3 rounded-full bg-gradient-to-r ${gradientStart} ${gradientEnd}`;
    
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className={gradientClasses} aria-hidden="true"></div>
            <div className="p-5 flex flex-col items-start">                 
                <div className="flex items-center space-x-4 mb-3">
                    <div className={`w-12 h-12 rounded-full ${iconColor} flex-shrink-0`} aria-hidden="true">
                    </div>
                </div>
                
                <div className="flex flex-col mt-4"> 
                    <p className="text-4xl font-bold text-gray-900">{value}</p>                    
                    <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
                </div>
            </div>
        </div>
    );
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    iconColor: PropTypes.string,
    gradientStart: PropTypes.string,
    gradientEnd: PropTypes.string,
};

StatCard.defaultProps = {
    iconColor: 'bg-primary',
    gradientStart: 'from-primary',
    gradientEnd: 'to-secondary',
};

export default StatCard;