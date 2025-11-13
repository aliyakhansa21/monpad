import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

const NavCardAsisten = ({ title, href, buttonColorClass, buttonHoverHexColor }) => {    
    const defaultColorClass = "bg-primary hover:bg-background-dark";    
    const baseColorClass = buttonColorClass || "bg-primary";
    const buttonStyle = {
        '--button-hover-color': buttonHoverHexColor || 'var(--hover-default)', 
    };
    
    const buttonClasses = `${baseColorClass} custom-hex-hover text-white font-medium py-2 px-6 rounded-sm transition-colors shadow-md`;
    
    return (
        <div className="bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl p-6 flex flex-col items-center justify-center text-center h-40">            
            <h3 className="text-xl font-semibold text-primary mb-4">{title}</h3>            
            <Link href={href} passHref>
                <button
                    className={buttonClasses}
                    style={buttonStyle}
                >
                    Lihat
                </button>
            </Link>
        </div>
    );
};

NavCardAsisten.propTypes = {
    title: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    buttonColorClass: PropTypes.string, // Kelas Tailwind (e.g., bg-secondary)
    buttonHoverHexColor: PropTypes.string, // Nilai Hex (e.g., #32475a)
};

export default NavCardAsisten;