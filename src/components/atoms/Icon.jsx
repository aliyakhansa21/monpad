import React from 'react';
import PropTypes from 'prop-types';

const iconUrls = {
    'remove-red': 'https://img.icons8.com/ios-glyphs/30/bc0006/delete-forever.png',
    'edit-green': 'https://img.icons8.com/ios-glyphs/30/176f2b/buy-upgrade.png',
    'filled-plus': 'https://img.icons8.com/ios-glyphs/30/52357b/filled-plus-2-math.png',
};

const Icon = ({ name, size = 35, alt = 'icon', ...props }) => {
    const iconUrl = iconUrls[name];

    if (!iconUrl) {
        return null;
    }

    return (
        <img
            src={iconUrl}
            alt={alt}
            width={size}
            height={size}
            style={{ width: size, height: size }}
            {...props}
        />
    );
};

Icon.propTypes = {
    name: PropTypes.oneOf(Object.keys(iconUrls)).isRequired,
    size: PropTypes.number,
    alt: PropTypes.string,
};

export default Icon;