import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/atoms/Icon';
import Button from '../atoms/Button';

const DashboardHeader = ({ title }) => {
    return (
        <header className='
        sticky top-0 z-40
        transition-all duration-300
        p-4 md:p- w-full'>
            <div className="
            flex flex-col md:flex-row items-start md:items-center justify-between
            bg-white rounded-lg shadow
            p-6 md:p-6 w-full">
                <div className='flex flex-col'>
                    <h1 className='text-xl md:text-3xl font-bold text-primary leading-tight'>{title}</h1>
                </div>
                <div className='flex items-center space-x-2 mt-2 md:mt-0'>
                    <Button variant="ghost" aria-label="Notifikasi" className="p-1 md:p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Icon name="notification" className="text-gray-600"/>
                    </Button>
                    <Button variant="ghost" aria-label="Profil Pengguna" className="p-1 md:p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Icon name="profile" className="text-gray-600"/>
                    </Button>
                </div>
            </div>

            
        </header>
    );
};

DashboardHeader.propTypes = {
    title: PropTypes.string.isRequired,
};

export default DashboardHeader;