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
    // onReview, 
    // onToggleFinalization, 
    userRole,
    totalPages, 
    currentPage, 
    onPageChange, 
    totalWeekWeight, // Diperlukan untuk header Total Skor
}) => {

    const IS_LECTURER = userRole === 'dosen';
    const IS_ASSISTANT = userRole === 'asisten';

    const headerBaseClasses = "px-3 py-2 md:px-6 md:py-4 text-center text-sm font-medium text-white uppercase tracking-wider bg-primary";
    const cellBaseClasses = "px-3 py-2 md:px-6 md:py-4 text-center text-sm text-black whitespace-nowrap";
    
    const renderDynamicCell = (item, header) => {
        const value = item[header.key] || 0;
        return <td className={cellBaseClasses}>{value}</td>;
    };

    // Filter columns untuk menghapus kolom 'total_skor' statis yang duplikat
    // Kolom ini seharusnya hanya ada di akhir.
    const staticColumns = columns.filter(col => col.key !== 'total_skor');

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
                            {/* 1. RENDER STATIC COLUMNS (TANPA TOTAL SKOR DUPLIKAT) */}
                            {staticColumns.map(col => (
                                <th 
                                    rowSpan={2} 
                                    key={col.key} 
                                    className={headerBaseClasses}
                                >
                                    {col.label}
                                </th>
                            ))}
                            
                            {/* Header Penilaian */}
                            <th colSpan={dynamicHeaders.length} className={headerBaseClasses}>
                                PENILAIAN
                            </th>
                            
                            {/* 2. HEADER TOTAL SKOR AKHIR (Mencantumkan total bobot) */}
                            <th rowSpan={2} className={headerBaseClasses}>
                                TOTAL SKOR ({totalWeekWeight}%)
                            </th>                            
                        </tr>
                        
                        <tr>                            
                            {/* 3. SUB-HEADER PENILAIAN (Memastikan persentase ada di baris kedua) */}
                            {dynamicHeaders.map(col => (
                                <th key={col.key} className={headerBaseClasses}>
                                    {/* col.label sudah mengandung nama dan persentase yang dipisahkan newline \n */}
                                    <div className="whitespace-pre-line">
                                        {col.label}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 1 ? 'bg-background-light' : ''}>                                
                                {/* 4. CELL STATIC COLUMNS (TANPA TOTAL SKOR DUPLIKAT) */}
                                {staticColumns.map(column => (
                                    <td key={column.key} className={cellBaseClasses}>
                                        {item[column.key] || '-'}
                                    </td>
                                ))}

                                {/* Cell Nilai Dinamis */}
                                {dynamicHeaders.map(header => (
                                    <React.Fragment key={header.key}>
                                        {renderDynamicCell(item, header)}
                                    </React.Fragment>
                                ))}
                                
                                {/* 5. CELL TOTAL SKOR AKHIR */}
                                <td className={`${cellBaseClasses} font-bold`}>
                                    {item.total_skor || '0'}
                                </td>                                                                
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
    userRole: PropTypes.string.isRequired,
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