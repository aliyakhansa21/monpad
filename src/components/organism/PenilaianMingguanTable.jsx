import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import SearchInput from '@/components/molecules/SearchInput';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import Pagination from '@/components/molecules/Pagination';

const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const PenilaianMingguanTable = ({ 
    data, 
    gradeTypes,
    onSearch, 
    onReview,
    userRole,
    isLoading,
    totalPages, 
    currentPage, 
    onPageChange,
    totalWeekWeight,
}) => {
    
    const IS_ASSISTANT = userRole === 'asisten';
    const IS_LECTURER = userRole === 'dosen';

    const staticColumns = useMemo(() => [
        { key: 'kelompok', label: 'KELOMPOK', apiPath: 'project.group_name' }, 
        { key: 'namaProyek', label: 'NAMA PROYEK', apiPath: 'project.nama_projek' },
    ], []);

    const dynamicHeaders = useMemo(() => {
        return gradeTypes.map(gt => ({
            key: `grade_${gt.id}`,
            label: `${gt.name} (${gt.percentage}%)`,
            gradeTypeId: gt.id,
            percentage: gt.percentage,
        }));
    }, [gradeTypes]);

    const calculateTotalScore = (item) => {
        if (!item.grades || item.grades.length === 0) return 0;

        if (item.total_grade !== undefined && item.total_grade !== null) {
            return parseFloat(item.total_grade).toFixed(2);
        }

        const total = item.grades.reduce((sum, grade) => {
            return sum + (parseFloat(grade.grade) || 0);
        }, 0);

        return total.toFixed(2);
    };
    
    const renderDynamicCell = (item, header) => {
        const gradeObj = item.grades?.find(g => g.grade_type.id === header.gradeTypeId);
        const value = gradeObj ? parseFloat(gradeObj.grade).toFixed(0) : 0;
        
        return (
            <td className="px-3 py-4 md:px-6 md:py-4 text-center text-sm">
                {value}
            </td>
        );
    };

    const renderTotalScoreCell = (item) => {
        const totalScore = calculateTotalScore(item);
        return (
            <td className="px-3 py-4 md:px-6 md:py-4 text-center text-sm text-black whitespace-nowrap">
                {totalScore}
            </td>
        );
    };

    const renderNotesCell = (item) => {
        const displayNote = item.notes || item.review?.note || 'Catatan di sini';
        return (
            <td className="px-3 py-4 md:px-6 md:py-4 text-center max-w-xs truncate text-sm">
                {displayNote}
            </td>
        );
    };
    
    if (isLoading) {
        return (
            <div className="bg-white p-10 rounded-lg shadow text-center">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
                <p className="mt-4 text-lg font-medium text-gray-600">Memuat data penilaian...</p>
            </div>
        );
    }
    
    const displayData = Array.isArray(data) ? data : [];
    
    if (displayData.length === 0) {
        return (
            <div className="bg-white p-10 rounded-lg shadow text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-lg font-medium text-gray-600">
                    Tidak ada data penilaian untuk minggu ini
                </p>

                {IS_ASSISTANT && (
                    <p className="text-sm text-gray-500 mt-2">
                        Klik tombol + untuk menambah penilaian baru
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">

            {/* Top toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">                 
                <div className="flex-1"></div>

                <div className="flex items-center space-x-3">
                    <SearchInput 
                        placeholder="Cari Kelompok/Proyek" 
                        onChange={(e) => onSearch(e.target.value)} 
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            {staticColumns.map(col => (
                                <th 
                                    rowSpan={2} 
                                    key={col.key} 
                                    className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider"
                                >
                                    {col.label}
                                </th>
                            ))}
                            
                            <th 
                                colSpan={dynamicHeaders.length} 
                                className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider"
                            >
                                PENILAIAN
                            </th>
                            
                            <th 
                                rowSpan={2} 
                                className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider"
                            >
                                TOTAL SKOR
                            </th>
                            
                            <th 
                                rowSpan={2} 
                                className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider"
                            >
                                CATATAN
                            </th>

                            {IS_LECTURER && (
                                <th 
                                    rowSpan={2}
                                    className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white uppercase tracking-wider"
                                >
                                    REVIEW
                                </th>
                            )}
                        </tr>
                        
                        <tr>                            
                            {dynamicHeaders.map(col => (
                                <th 
                                    key={col.key} 
                                    className="px-3 py-3 md:px-6 md:py-3 bg-primary text-center text-xs font-medium text-white tracking-wider whitespace-nowrap"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {displayData.map((item, index) => (
                            <tr 
                                key={item.id} 
                                className={index % 2 === 0 ? 'bg-white' : 'bg-background-light hover:bg-purple-50/50'}
                            >
                                {staticColumns.map(column => (
                                    <td 
                                        key={column.key}
                                        className="px-3 py-4 md:px-6 md:py-4 text-center whitespace-nowrap text-sm"
                                    >
                                        {getNestedValue(item, column.apiPath) || '-'}
                                    </td>
                                ))}

                                {dynamicHeaders.map(header => (
                                    <React.Fragment key={header.key}>
                                        {renderDynamicCell(item, header)}
                                    </React.Fragment>
                                ))}

                                {renderTotalScoreCell(item)}
                                {renderNotesCell(item)}

                                {IS_LECTURER && (
                                    <td className="px-3 py-4 text-center">
                                        <Button
                                            variant="icon-only-2"
                                            onClick={() => onReview(item)}
                                            className="text-primary hover:bg-purple-100 rounded-full"
                                        >
                                            <Icon name="filled-plus" size={30} />
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <span className="text-sm text-gray-700">
                    Menampilkan {displayData.length} dari {displayData.length} entri
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

PenilaianMingguanTable.propTypes = {
    data: PropTypes.array,
    gradeTypes: PropTypes.array.isRequired,
    onSearch: PropTypes.func.isRequired,
    onReview: PropTypes.func.isRequired,
    userRole: PropTypes.string.isRequired,
    isLoading: PropTypes.bool,
    totalPages: PropTypes.number,
    currentPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    totalWeekWeight: PropTypes.number.isRequired, 
};

PenilaianMingguanTable.defaultProps = {
    isLoading: false,
    data: [],
};

export default PenilaianMingguanTable;
