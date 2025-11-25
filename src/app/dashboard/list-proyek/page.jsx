"use client";
import { useState, useEffect, useMemo } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import api from "@/lib/api"; 
import { Search } from "lucide-react";

export default function ListProyekPage() {
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    useEffect(() => {
        const fetchProjects = async () => {
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
                
                if (!Array.isArray(projects)) {
                    throw new Error("Format data project tidak sesuai.");
                }

                // mapping jumlah anggota berdasarkan project_id
                const memberCountMap = {};
                groups.forEach(group => {
                    if (group.project_id) {
                        memberCountMap[group.project_id] = Array.isArray(group.anggota) 
                            ? group.anggota.length 
                            : 0;
                    }
                });

                console.log("Member Count Map:", memberCountMap);

                // gabungin data project dengan jumlah anggota dari group
                const transformedData = projects.map(project => {
                    return {
                        id: project.id,
                        projectName: project.nama_projek || 'N/A',
                        description: project.deskripsi || '-',
                        ownerName: project.owner?.username || 'N/A',
                        jumlahAnggota: memberCountMap[project.id] || 0,
                        keterangan: project.finalized ? 'Finalized' : 'In Progress',
                        asistenName: project.asisten?.username || 'N/A',
                        ruangan: 'HU208', // hardcode
                    };
                });

                console.log("Transformed Data:", transformedData);
                setOriginalData(transformedData);
                setLoading(false);
            } catch (err) {
                console.error("Gagal memuat data proyek:", err);
                console.error("Error response:", err.response?.data);
                setError(`Gagal memuat data proyek: ${err.response?.data?.message || err.message}`);
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const filteredData = useMemo(() => {
        if (!searchTerm) return originalData;

        const lowerCaseSearch = searchTerm.toLowerCase();
        return originalData.filter(item => 
            item.projectName.toLowerCase().includes(lowerCaseSearch) ||
            item.description.toLowerCase().includes(lowerCaseSearch) ||
            item.ownerName.toLowerCase().includes(lowerCaseSearch)
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
                <DashboardHeader title="List Proyek"/>
                <main className="p-4 text-center">
                    <div className="bg-white rounded-lg shadow-lg p-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data proyek...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error) {
        return (
            <>
                <DashboardHeader title="List Proyek"/>
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
            <DashboardHeader title="List Proyek"/>
            <main className="p-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    
                    {/* Header Filter & Search */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                        
                        {/* Show By */}
                        <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-600">Show by:</span>
                            <select className="border border-gray-300 rounded-md p-1 focus:ring-primary focus:border-primary">
                                <option>Nama Proyek</option>
                                <option>Owner</option>
                                <option>Asisten</option>
                            </select>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="relative w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Search Proyek atau Owner..."
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

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                            <thead>
                                <tr className="text-white text-left text-sm">
                                    <th className="px-4 py-3 font-medium text-center bg-primary rounded-tl-lg">Nama Proyek</th>
                                    <th className="px-4 py-3 font-medium text-center bg-primary">Deskripsi</th>
                                    <th className="px-4 py-3 font-medium text-center bg-primary">Project Owner</th>
                                    <th className="px-4 py-3 font-medium text-center bg-primary">Jumlah Anggota</th>
                                    <th className="px-4 py-3 font-medium text-center bg-primary">Keterangan</th>
                                    <th className="px-4 py-3 font-medium text-center bg-primary">Asisten</th>
                                    <th className="px-4 py-3 font-medium text-center bg-primary rounded-tr-lg">Ruangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item, index) => (
                                        <tr 
                                            key={item.id + '-' + index} 
                                            className={`text-black text-sm 
                                                    ${index % 2 === 1 ? 'bg-background-light' : 'bg-white'} 
                                                    hover:bg-indigo-100 transition-colors`}
                                        >
                                            <td className="px-4 py-3 font-medium text-center">{item.projectName}</td>
                                            <td className="px-4 py-3 text-center max-w-xs truncate">{item.description}</td>
                                            <td className="px-4 py-3 text-center">{item.ownerName}</td>
                                            <td className="px-4 py-3 text-center">{item.jumlahAnggota}</td>
                                            <td className="px-4 py-3 text-center">{item.keterangan}</td>
                                            <td className="px-4 py-3 text-center">{item.asistenName}</td>
                                            <td className="px-4 py-3 text-center">{item.ruangan}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-6 text-gray-500">
                                            {searchTerm ? 'Proyek tidak ditemukan.' : 'Belum ada data proyek.'}
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