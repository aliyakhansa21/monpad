import React from 'react';
import PropTypes from 'prop-types';

const buttonStyles = {
    primary: 'bg-primary text-white hover:bg-primary px-4 py-2',
    danger: 'bg-danger text-white hover:bg-danger px-4 py-2',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-50 p-1.5',
    icon: 'p-2 rounded-full text-indigo-600 hover:bg-indigo-100',
    'icon-only-1': 'bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700',
    'icon-only-2': 'bg-transparent p-0.5 rounded-md inline-flex items-center justify-center', 
    secondary: 'bg-secondary text-gray-700 border border-gray-300 hover:bg-secondary-50 px-6 py-2',
};

const Button = ({ variant = 'primary', children, onClick, className = '', ...props}) => {
    const baseClasses = 'font-medium rounded-md transition-colors duration-200 inline-flex items-center justify-center';
    const variantClasses = buttonStyles[variant] || buttonStyles.primary;

    return (
        <button
            className={`${baseClasses} ${variantClasses} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    variant: PropTypes.oneOf(['primary', 'danger', 'ghost', 'icon', 'icon-only', 'secondary']),
    children: PropTypes.node,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

export default Button;