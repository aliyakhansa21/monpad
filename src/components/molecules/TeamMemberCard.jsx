
import React from 'react';
import PropTypes from 'prop-types';

const TeamMemberCard = ({ name, position, rating, isSelf }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const renderStars = (count) => {
        return (
            <div className="text-yellow-500 text-sm">
                {'★'.repeat(count) + '☆'.repeat(5 - count)}
            </div>
        );
    };

    return (
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-100">
            {/* Avatar/Inisial */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm bg-gradient-to-b from-purple-300 to-indigo-300`}>
                {initials}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-800">
                    {name} {isSelf && <span className="text-xs text-red-500">(Anda)</span>}
                </p>
                <p className="text-xs text-gray-500">{position}</p>
                {/* Rating Bintang */}
                {renderStars(rating)}
            </div>
        </div>
    );
};

TeamMemberCard.propTypes = {
    name: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    isSelf: PropTypes.bool, 
};

TeamMemberCard.defaultProps = {
    isSelf: false,
};

export default TeamMemberCard;