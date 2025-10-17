import React from "react";
import PropTypes from "prop-types";

const Input = ({ type = 'text', placeholder, ...props}) => {
    const classes = 'w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';

    return (
        <input 
        type={type}
        className={classes}
        placeholder={placeholder}
        {...props}
        />
    );
};

Input.propTypes = {
    type: PropTypes.string,
    placeholder: PropTypes.string,
};

export default Input;