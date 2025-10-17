import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/atoms/Icon';
import Input from '@/components/atoms/Input';

const SearchInput = ({ placeholder = 'Search', onChange, ...props}) => {
    return (
        <div className='relative flex items-center w-full md:w-auto'>
            <Input
                placeholder={placeholder}
                onChange={onChange}
                className="pl-10 pr-4 py-2"
                {...props}
            />
            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                <Icon name="search" size={18} />
            </div>
        </div>
    );
};

SearchInput.propTypes = {
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
};

export default SearchInput;