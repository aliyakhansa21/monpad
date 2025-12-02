import React from 'react';
import PropTypes from 'prop-types';

const SearchInput = ({ placeholder, onChange }) => (
    <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 block sm:text-sm transition duration-150 ease-in-out w-full md:w-48"
        aria-label="Search"
    />
);

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
    const validTotalPages = Math.max(1, totalPages); 
    const pageNumbers = Array.from({ length: validTotalPages }, (_, i) => i + 1);

    if (validTotalPages <= 1) return null;

    return (
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <span className="sr-only">Previous</span>
                &larr;
            </button>
            
            {pageNumbers.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                        currentPage === page
                            ? 'z-10 bg-primary-100 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === validTotalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <span className="sr-only">Next</span>
                &rarr;
            </button>
        </nav>
    );
};

const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const NilaiIndividuTable = ({ 
    data, 
    columns, 
    onSearch, 
    onToggleFinalization, 
    userRole, 
    totalPages, 
    currentPage, 
    onPageChange,
    title,
    isLoading
}) => {
    const IS_LECTURER = userRole === 'dosen';

    const headerBaseClasses = "px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider";
    const cellBaseClasses = "px-3 py-4 md:px-6 md:py-4 text-center";

    const renderCell = (item, column) => {
        if (column.key === 'actions') {
            return (
                <td className={`${cellBaseClasses} flex items-center space-x-2 justify-center`}>
                    {IS_LECTURER ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={item.confirmed === 1}
                                onChange={() => onToggleFinalization(item)}
                            />
                            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 transition-colors ${
                                item.confirmed === 1
                                    ? 'bg-green-500 peer-focus:ring-green-300' // FINAL: Hijau
                                    : 'bg-red-500 peer-focus:ring-red-300'    // DRAFT: Merah
                                } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                            
                            <span className={`ml-3 text-sm font-medium ${item.confirmed === 1 ? 'text-green-700' : 'text-red-700'}`}>
                                {item.confirmed === 1 ? 'Final' : 'Draft'}
                            </span>
                        </label>
                    ) : (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            item.confirmed === 1 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {item.confirmed === 1 ? 'Finalized' : 'Draft'}
                        </span>
                    )}
                </td>
            );
        }

        if (column.key === 'final_grade') {
            return (
                <td className={`${cellBaseClasses} font-extrabold text-lg text-primary-700`}>
                    {parseFloat(item.final_grade || 0).toFixed(2)}
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

        if (typeof value === 'object' && value !== null) {
            value = '— Data Objek —'; 
        }

        return <td className={cellBaseClasses}>{value || '-'}</td>; 
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
                <span className="text-xl font-bold text-gray-800">{title}</span> 
                <div className="flex items-center space-x-2 md:space-x-4 md:w-auto w-full justify-end"> 
                    <SearchInput placeholder="Cari Mahasiswa" onChange={(e) => onSearch(e.target.value)} />
                </div>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    <p className="text-gray-600 ml-4">Memuat data mahasiswa...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th 
                                        key={col.key} 
                                        className={headerBaseClasses}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((item, index) => (
                                <tr key={item.id} className={index % 2 === 1 ? 'bg-background-light' : ''}>
                                    {columns.map(column => (
                                        <React.Fragment key={column.key}>
                                            {renderCell(item, column)}
                                        </React.Fragment>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {data.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Tidak ada data mahasiswa yang ditemukan.
                        </div>
                    )}
                </div>
            )}
            
            <div className="mt-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <span className="text-sm text-gray-700">
                    Showing 1 to {data.length} of total entries
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

NilaiIndividuTable.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    onSearch: PropTypes.func.isRequired,
    onToggleFinalization: PropTypes.func.isRequired,
    userRole: PropTypes.string.isRequired,
    totalPages: PropTypes.number,
    currentPage: PropTypes.number,
    onPageChange: PropTypes.func.isRequired,
    title: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
};

NilaiIndividuTable.defaultProps = {
    title: "Nilai Individu Mahasiswa",
    totalPages: 1,
    currentPage: 1,
};

export default NilaiIndividuTable;