import React from 'react';
import PropTypes from 'prop-types';
import { CircleArrowUp, Trash2, SquarePlus, User, Search, Bell } from 'lucide-react';
import { components } from 'react-select';

const colorMap = {
    'red': '#BC0006',
    'green': '#176F2B',
    'primary': '#52357B',
    'yellow': '#FFC107', 
    'default': '#000000',
};

const LucideIconMap = {
    'edit-green': { component: CircleArrowUp, color: 'green' },
    'remove-red': { component: Trash2, color: 'red' },
    'filled-plus': { component: SquarePlus, color: 'primary' }, 
    'search': { component: Search, color: 'primary' },
    'group-member' : { component: User, color: 'yellow'},
    'notification' : { component: Bell, color: 'primary'},
    'profile' : {components: User, color: 'primary'},
};

const Icon = ({ name, size, className }) => {
    const iconData = LucideIconMap[name];

    if (!iconData) {
        console.warn(`Icon "${name}" not found in LucideIconMap.`);
        return null;
    }

    const LucideComponent = iconData.component;
    const iconColor = colorMap[iconData.color] || colorMap['default'] || 'currentColor'; 

    return (
        <>
        {LucideComponent ? (
            <LucideComponent
                size={size}
                style={{ color: iconColor }} 
                className={className} 
            />
        ) : (
            <div style={{ width: size, height: size, backgroundColor: 'red' }} /> 
        )}
    </>
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