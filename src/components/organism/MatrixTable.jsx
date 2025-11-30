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
    onToggleFinalization, 
    userRole,
    totalPages, 
    currentPage, 
    onPageChange, 
    totalWeekWeight, 
}) => {

    const IS_LECTURER = userRole === 'dosen';
    const IS_ASSISTANT = userRole === 'asisten';

    const headerBaseClasses = "px-3 py-2 md:px-6 md:py-4 text-center text-sm font-medium text-white uppercase tracking-wider bg-primary";
    const cellBaseClasses = "px-3 py-2 md:px-6 md:py-4 text-center text-sm text-black whitespace-nowrap";
    
    const renderDynamicCell = (item, header) => {
        const value = item[header.key] || 0;
        return <td className={cellBaseClasses}>{value}</td>;
    };

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
                            {columns.map(col => (
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
                            
                            {/* Total Skor */}
                            <th rowSpan={2} className={headerBaseClasses}>
                                TOTAL SKOR
                            </th>
                            
                            {/* Catatan */}
                            <th rowSpan={2} className={headerBaseClasses}>
                                CATATAN
                            </th>
                            
                            {/* Review Dosen */}
                            <th rowSpan={2} className={headerBaseClasses}>
                                REVIEW DOSEN
                            </th>
                            
                            {/* Status/Finalisasi */}
                            <th rowSpan={2} className={headerBaseClasses}>
                                {IS_LECTURER ? 'FINALISASI' : 'STATUS'}
                            </th>
                        </tr>
                        
                        <tr>                            
                            {dynamicHeaders.map(col => (
                                <th key={col.key} className={headerBaseClasses}>
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
                                {columns.map(column => (
                                    <td key={column.key} className={cellBaseClasses}>
                                        {item[column.key] || '-'}
                                    </td>
                                ))}

                                {dynamicHeaders.map(header => (
                                    <React.Fragment key={header.key}>
                                        {renderDynamicCell(item, header)}
                                    </React.Fragment>
                                ))}
                                
                                {/* Total Skor */}
                                <td className={`${cellBaseClasses} font-bold`}>
                                    {item.total_skor || '0'}%
                                </td>
                                
                                {/* Catatan */}
                                <td className={cellBaseClasses}>
                                    {item.catatan || '-'}
                                </td>
                                
                                {/* Review Dosen */}
                                <td className={cellBaseClasses}>
                                    {item.review_dosen || '-'}
                                </td>
                                
                                {/* Toggle Switch */}
                                <td className="px-3 py-4 md:px-6 md:py-4 text-center">
                                    {IS_ASSISTANT ? (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            item.confirmed === 1 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {item.confirmed === 1 ? 'Finalized' : 'Draft'}
                                        </span>
                                    ) : IS_LECTURER ? (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={item.confirmed === 1}
                                                onChange={() => onToggleFinalization(item)}
                                            />
                                            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 transition-colors ${
                                                item.confirmed === 1
                                                    ? 'bg-green-500 peer-focus:ring-green-300' 
                                                    : 'bg-red-500 peer-focus:ring-red-300'
                                            } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                                        </label>
                                    ) : (
                                        <span>-</span>
                                    )}
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
    onReview: PropTypes.func.isRequired,
    onToggleFinalization: PropTypes.func, 
    userRole: PropTypes.string.isRequired,
    totalPages: PropTypes.number,
    currentPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    totalWeekWeight: PropTypes.number.isRequired, 
};

MatrixTable.defaultProps = {
    title: "Data Matriks Nilai",
    totalPages: 1,
    onToggleFinalization: () => {},
};

export default MatrixTable;