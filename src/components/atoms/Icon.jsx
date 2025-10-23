import React from 'react';
import PropTypes from 'prop-types';
import { CircleArrowUp, Trash2, SquarePlus } from 'lucide-react';

const colorMap = {
    'red': '#BC0006',
    'green': '#176F2B',
    'primary': '#52357B',
};

const LucideIconMap = {
    'edit-green': { component: CircleArrowUp, color: 'green' },
    'remove-red': { component: Trash2, color: 'red' },
    'filled-plus': { component: SquarePlus, color: 'primary' }, 
};

const Icon = ({ name, size, className }) => {
    const iconData = LucideIconMap[name];

    if (!iconData) {
        console.warn(`Icon "${name}" not found in LucideIconMap.`);
        return null;
    }

    const LucideComponent = iconData.component;
    const iconColor = colorMap[iconData.color] || colorMap['default']; 

    return (
        <LucideComponent
            size={size}
            style={{ color: iconColor }} 
            className={className} 
        />
    );
};

Icon.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
    className: PropTypes.string,
};

Icon.defaultProps = {
    size: 24, 
};

export default Icon;