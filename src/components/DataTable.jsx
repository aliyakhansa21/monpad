//belom selesai
import React from 'react';

const DataTable = ({ columns, data }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
        <table className="w-full table-auto text-left">
            <thead>
            <tr>
                {columns.map((column) => (
                <th key={column.key} className="p-4 font-semibold text-gray-600">
                    {column.label}
                </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((item, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-0 hover:bg-gray-50">
                {columns.map((column) => (
                    <td key={column.key} className="p-4 text-gray-800">
                    {item[column.key]}
                    </td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
    };

export default DataTable;