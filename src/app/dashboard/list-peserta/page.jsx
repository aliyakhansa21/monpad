"use client";
import { useState, useEffect, useMemo } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import api from "@/lib/api"; 
import { Search } from "lucide-react";

export default function ListPesertaPage() {
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    useEffect(() => {
        const fetchParticipants = async () => {
            setLoading(true);
            setError(null);
            try {
                const [projectResponse, groupResponse] = await Promise.all([
                    api.get("/project"),
                    api.get("/group")
                ]);

                console.log("Project Response:", projectResponse.data);
                console.log("Group Response:", groupResponse.data);
                
                const projects = projectResponse.data?.data || [];
                const groups = groupResponse.data?.data || [];
                
                if (!Array.isArray(groups)) {
                    throw new Error("Format data dari server tidak sesuai.");
                }

                // mapping project_id ke nama_projek
                const projectNameMap = {};
                projects.forEach(project => {
                    projectNameMap[project.id] = project.nama_projek || 'N/A';
                });

                console.log("Project Name Map:", projectNameMap);

                const flattenedData = groups.flatMap(group => 
                    (group.anggota || []).map(member => ({
                        id: member.id,
                        name: member.username || 'Anonim',
                        nim: member.nim || '-',
                        projectName: projectNameMap[group.project_id] || 'Tidak ada proyek',
                        projectId: group.project_id,
                    }))
                );

                console.log("Flattened Data:", flattenedData);
                setOriginalData(flattenedData);
                setLoading(false);
            } catch (err) {
                console.error("Gagal memuat data peserta:", err);
                console.error("Error response:", err.response?.data);
                setError(`Gagal memuat data peserta: ${err.response?.data?.message || err.message}`);
                setLoading(false);
            }
        };

        fetchParticipants();
    }, []);

    const filteredData = useMemo(() => {
        if (!searchTerm) return originalData;

        const lowerCaseSearch = searchTerm.toLowerCase();
        return originalData.filter(item => 
            item.name.toLowerCase().includes(lowerCaseSearch) ||
            item.projectName.toLowerCase().includes(lowerCaseSearch) ||
            (item.nim && item.nim.toLowerCase().includes(lowerCaseSearch))
        );
    }, [originalData, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    if (loading) {
        return (
            <>
                <DashboardHeader title="List Peserta"/>
                <main className="p-4 text-center">
                    <div className="bg-white rounded-lg shadow-lg p-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data peserta...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error) {
        return (
            <>
                <DashboardHeader title="List Peserta"/>
                <main className="p-4 text-center">
                    <div className="bg-white rounded-lg shadow-lg p-10">
                        <p className="text-red-600 font-semibold">{error}</p>
                        <p className="text-sm text-gray-500 mt-2">Coba refresh halaman atau cek log konsol.</p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <DashboardHeader title="List Peserta"/>
            <main className="p-4">
                <div className="bg-white rounded-lg shadow-lg p-6">                    
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">                        
                        {/* Show By */}
                        <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-600">Show by:</span>
                            <select className="border border-gray-300 rounded-md p-1 focus:ring-primary focus:border-primary">
                                <option>Nama Proyek</option>
                                <option>Nama Peserta</option>
                            </select>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="relative w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Search Peserta atau Proyek..."
                                value={searchTerm}
                                onChange={(e) => { 
                                    setSearchTerm(e.target.value); 
                                    setCurrentPage(1);
                                }}
                                className="w-full border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm focus:ring-primary focus:border-primary"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                            <thead>
                                <tr className="text-white text-center text-sm">
                                    <th className="px-4 py-3 font-medium bg-primary rounded-tl-lg">Nama Peserta</th>
                                    <th className="px-4 py-3 font-medium bg-primary rounded-tr-lg">Nama Proyek</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item, index) => (
                                        <tr 
                                            key={item.id + '-' + index} 
                                            className={`text-black text-sm 
                                                    ${index % 2 === 1 ? 'bg-background-light' : 'bg-white'}`}
                                        >
                                            <td className="px-4 py-3 font-medium text-center">{item.name}</td>
                                            <td className="px-4 py-3 text-center">{item.projectName}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="text-center py-6 text-gray-500">
                                            {searchTerm ? 'Peserta tidak ditemukan.' : 'Belum ada data peserta.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 space-y-3 sm:space-y-0">
                        <span>Showing {paginatedData.length ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries</span>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 border rounded bg-primary text-white">
                                {currentPage}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}