import React from 'react';
import PropTypes from 'prop-types';
import SearchInput from '@/components/molecules/SearchInput';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Pagination from '@/components/molecules/Pagination';

const getNestedValue = (obj, path) => {
    // path bisa berupa 'owner.username' atau 'nama_proyek'
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const DataTable = ({ data, columns, onSearch, onAdd, totalPages, currentPage, onPageChange, onEdit, onDelete }) => {
    const renderCell = (item, column) => {
        if (column.key === 'actions') {
            return (
                <td className="px-3 py-4 md:px-6 md:py-4 flex items-center space-x-2 justify-center">
                    <Button variant="icon-only-2" aria-label="Edit Data" onClick={() => onEdit(item)}>
                        <Icon name="edit-green" size={30} />
                    </Button>
                    <Button variant="icon-only-2" aria-label="Hapus Data" onClick={() => onDelete(item)}>
                        <Icon name="remove-red" size={30} />
                    </Button>
                </td>
            );
        }
        const value = getNestedValue(item, column.key);
        return <td className="px-3 py-4 md:px-6 md:py-4 text-center">{item[column.key]}</td>;
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex flex-col justify-end mb-4 space-y-2 md:space-y-0">
                <div className="flex items-center space-x-2 md:space-x-4 md:w-auto justify-end">
                    <Button onClick={onAdd} variant="icon-only-2" aria-label="Tambah Data">
                        <Icon name="filled-plus" size={45} />
                    </Button>
                    <SearchInput placeholder="Search" onChange={onSearch} />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider">
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
    onSearch: PropTypes.func,
    onAdd: PropTypes.func,
    totalPages: PropTypes.number,
    currentPage: PropTypes.number,
    onPageChange: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
};

export default DataTable;