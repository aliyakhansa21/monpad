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
        return <td className={cellBaseClasses}>{value || '-'}</td>; 
    };

    const renderDynamicCell = (item, header) => {
        const value = item[header.key] || 0;         
        if (header.key === 'total_skor') {
            return <td className={`${cellBaseClasses} font-bold`}>{value}</td>; 
        }
        return <td className={cellBaseClasses}>{value}</td>; 
    };

    const allHeaders = [...columns, ...dynamicHeaders];


    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">            
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0"> 
                <span className="text-xl font-bold text-gray-800">{title}</span> 
                <div className="flex items-center space-x-2 md:space-x-4 w-full md:w-auto justify-end"> 
                    <SearchInput placeholder="Search" onChange={(e) => onSearch(e.target.value)} />
                    <span className="text-sm min-w-max">Show by: All</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            {columns.slice(0, 2).map(col => (
                                <th 
                                    rowSpan={2} 
                                    key={col.key} 
                                    className={headerBaseClasses} 
                                >
                                    {col.label}
                                </th>
                            ))}
                            
                            <th colSpan={dynamicHeaders.length} className={headerBaseClasses}>
                                Penilaian
                            </th>
                            
                            <th className={headerBaseClasses}>
                                TOTAL SKOR
                            </th>
                            
                            {columns.slice(2).map(col => ( 
                                <th 
                                    rowSpan={2} 
                                    key={col.key} 
                                    className={headerBaseClasses} 
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                        
                        <tr>                            
                            {dynamicHeaders.map(col => (
                                <th key={col.key} className={headerBaseClasses}>
                                    {col.label}
                                </th>
                            ))}                            
                            <th className="px-3 py-2 md:px-6 md:py-3 bg-primary text-center text-xs font-bold text-white tracking-wider">
                                {totalWeekWeight}%
                            </th>                            
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
                                
                                <td className={`${cellBaseClasses} font-bold`}>                                    
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
                <span className="text-sm text-gray-700 order-2 md:order-1">
                    Showing 1 to {data.length} of {data.length} entries
                </span>
                <div className="order-1 md:order-2">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                    />
                </div>
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
