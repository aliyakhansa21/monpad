import React from 'react';

const PageHeader = ({ title, subtitle }) => {
    return (
        <header className="page-header bg-white shadow-sm p-4 rounded-lg mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </header>
    );
    };

export default PageHeader;