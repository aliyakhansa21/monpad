import React from 'react';
import PropTypes from 'prop-types';
import SearchInput from '@/components/molecules/SearchInput';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Pagination from '@/components/molecules/Pagination';

const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const DataTable = ({ 
    data, 
    columns, 
    onSearch, 
    onAdd, 
    totalPages, 
    currentPage, 
    onPageChange, 
    onEdit, 
    onDelete, 
    isLoading 
}) => {
    const renderCell = (item, column) => {
        if (column.render) {
            const renderedContent = column.render(item);
            return (
                <td className="px-3 py-4 md:px-6 md:py-4 text-center">
                    {renderedContent}
                </td>
            );
        }

        if (column.key === 'actions') {
            return (
                <td className="px-3 py-4 md:px-6 md:py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                        <Button 
                            variant="icon-only-2" 
                            aria-label="Edit Data" 
                            onClick={() => onEdit(item)}
                            className="hover:bg-green-100 transition-colors"
                        >
                            <Icon name="edit-green" size={30} /> 
                        </Button>
                        <Button 
                            variant="icon-only-2" 
                            aria-label="Hapus Data" 
                            onClick={() => onDelete(item)}
                            className="hover:bg-red-100 transition-colors"
                        >
                            <Icon name="remove-red" size={30} />
                        </Button>
                    </div>
                </td>
            );
        }

        let value;
        if (column.key.includes('.')) {
            value = getNestedValue(item, column.key);
        } else {
            value = item[column.key];
        }

        if (typeof value === 'object' && value !== null) {
            value = '— Data Objek —'; 
        }

        return (
            <td className="px-3 py-4 md:px-6 md:py-4 text-center">
                {value || '-'}
            </td>
        ); 
    };

    if (isLoading) {
        return (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg text-gray-500">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-end items-center mb-4 space-y-2 md:space-y-0"> 
                <div className="flex items-center space-x-2 md:space-x-4 md:w-auto"> 
                    <Button 
                        onClick={onAdd} 
                        variant="icon-only-2" 
                        aria-label="Tambah Data"
                        className="hover:bg-purple-100 transition-colors"
                    >
                        <Icon name="filled-plus" size={45} />
                    </Button>
                    <SearchInput 
                        placeholder="Search" 
                        onChange={(e) => onSearch(e.target.value)} 
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th 
                                    key={col.key} 
                                    className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.length === 0 ? (
                            <tr>
                                <td 
                                    colSpan={columns.length} 
                                    className="px-3 py-8 text-center text-gray-500"
                                >
                                    Tidak ada data untuk ditampilkan
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr 
                                    key={item.id} 
                                    className={index % 2 === 1 ? 'bg-background-light' : ''}
                                >
                                    {columns.map(column => (
                                        <React.Fragment key={column.key}>
                                            {renderCell(item, column)}
                                        </React.Fragment>
                                    ))}
                                </tr>
                            ))
                        )}
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

DataTable.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    onSearch: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    totalPages: PropTypes.number,
    currentPage: PropTypes.number,
    onPageChange: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

DataTable.defaultProps = {
    isLoading: false,
};

export default DataTable;