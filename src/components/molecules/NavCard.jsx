import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

const NavCard = ({ title, href }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-primary transition-all duration-300 hover:shadow-xl p-6 flex flex-col items-center justify-center text-center h-40">            
            <h3 className="text-xl font-semibold text-primary mb-4">{title}</h3>            
            <Link href={href} passHref>
                <button
                    className="bg-primary hover:bg-background-dark text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-md"
                >
                    Lihat
                </button>
            </Link>
        </div>
    );
};

NavCard.propTypes = {
    title: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
};

export default NavCard;