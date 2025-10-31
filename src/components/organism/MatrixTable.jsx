import React from 'react';
import PropTypes from 'prop-types';
import SearchInput from '@/components/molecules/SearchInput'; 
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Pagination from '@/components/molecules/Pagination'; 

const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const MatrixTable = ({ 
    data, 
    columns,  
    dynamicHeaders, 
    title, 
    onSearch, 
    onReview, 
    totalPages, 
    currentPage, 
    onPageChange, 
    totalWeekWeight, 
}) => {
    
    const renderCell = (item, column) => {
        if (column.key === 'aksi') {
            return (
                <td className="px-3 py-4 md:px-6 md:py-4 text-center">
                    <Button variant="icon-only-2" aria-label="Review/Tambah Nilai" onClick={() => onReview(item)}>
                        <Icon name="filled-plus" size={30} /> 
                    </Button>
                </td>
            );
        }

        let value;

        if (column.render) {
            value = column.render(item);
        } 
        else if (column.key.includes('.')) {
            value = getNestedValue(item, column.key);
        }
        else {
            value = item[column.key];
        }

        return <td className="px-3 py-4 md:px-6 md:py-4 text-center">{value || '-'}</td>; 
    };

    const renderDynamicCell = (item, header) => {
        const value = item[header.key] || 0; 
        
        if (header.key === 'total_skor') {
            return <td className="px-3 py-4 md:px-6 md:py-4 text-center font-bold">{value}</td>; 
        }

        return <td className="px-3 py-4 md:px-6 md:py-4 text-center">{value}</td>; 
    };

    const allHeaders = [...columns, ...dynamicHeaders];


    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0"> 
                <span className="text-xl font-bold text-gray-800 hidden md:block">{title}</span> 

                <div className="flex items-center space-x-2 md:space-x-4 md:w-auto"> 
                    <SearchInput placeholder="Search" onChange={(e) => onSearch(e.target.value)} />
                    <span className="text-sm">Show by: All</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            {columns.slice(0, 2).map(col => (
                                <th key={col.key} className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            <th colSpan={dynamicHeaders.length} className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider border-l border-r border-white/50">
                                Penilaian
                            </th>
                            <th className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider">
                                TOTAL SKOR
                            </th>
                            {columns.slice(2).map(col => ( // Mulai dari 'Catatan' (index 2 di STATIC_COLUMNS yang baru)
                                <th key={col.key} className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                        
                        <tr>
                            <th colSpan={2} className="px-3 py-3 md:px-6 md:py-3 bg-white text-center text-xs font-medium text-gray-800 uppercase tracking-wider border-r border-gray-200"></th>
                            
                            {dynamicHeaders.map(col => (
                                <th key={col.key} className="px-3 py-3 md:px-6 md:py-3 bg-white text-center text-xs font-medium text-gray-800 uppercase tracking-wider border-r border-gray-200">
                                    {col.label}
                                </th>
                            ))}
                            
                            <th className="px-3 py-3 md:px-6 md:py-3 bg-white text-center text-xs font-bold text-primary uppercase tracking-wider border-r border-gray-200">
                                {totalWeekWeight}%
                            </th>
                            
                            <th colSpan={columns.slice(2).length - 1} className="px-3 py-3 md:px-6 md:py-3 bg-white text-center text-xs font-medium text-gray-800 uppercase tracking-wider border-r border-gray-200"></th>

                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 1 ? 'bg-background-light' : ''}>                                
                                {columns.slice(0, 2).map(column => (
                                    <React.Fragment key={column.key}>
                                        {renderCell(item, column)}
                                    </React.Fragment>
                                ))}

                                {dynamicHeaders.map(header => (
                                    <React.Fragment key={header.key}>
                                        {renderDynamicCell(item, header)}
                                    </React.Fragment>
                                ))}
                                
                                <td className="px-3 py-4 md:px-6 md:py-4 text-center font-bold">                                    
                                    0% 
                                </td>
                                
                                {columns.slice(2).map(column => (
                                    <React.Fragment key={column.key}>
                                        {renderCell(item, column)}
                                    </React.Fragment>
                                ))}

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <span className="text-sm text-gray-700">
                    Showing 1 to {data.length} of {data.length} entries
                </span>
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
};

MatrixTable.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    dynamicHeaders: PropTypes.array.isRequired,
    title: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
    onReview: PropTypes.func.isRequired,
    totalPages: PropTypes.number,
    currentPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    totalWeekWeight: PropTypes.number.isRequired, 
};

MatrixTable.defaultProps = {
    title: "Data Matriks Nilai",
    totalPages: 1,
};

export default MatrixTable;