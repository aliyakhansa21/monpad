"use client";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/organism/DashboardHeader";
import DataTable from "@/components/organism/DataTable";
import MahasiswaModal from "@/components/organism/MahasiswaModal";
import api from "@/lib/api"; 

const MAHASISWA_COLUMNS = [
    { key: 'username', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { key: 'nim', label: 'NIM' },
    { key: 'angkatan', label: 'Angkatan' },
    { key: 'prodi', label: 'Program Studi' },
    { key: 'jabatan', label: 'Jabatan' },
    { key: 'actions', label: 'Aksi' },
];

export default function DataMahasiswaPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); 
    const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
    const [mahasiswaData, setMahasiswaData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    
    const fetchMahasiwaData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/mahasiswa');            
            setMahasiswaData(response.data.data); 
        } catch (error) {
            console.error("Gagal mengambil data:", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memuat data.";
            alert(`Gagal memuat data: ${errorMessage}`);
            setMahasiswaData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMahasiwaData();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarExpanded(prev => !prev);
    };
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAddData = () => {
        setModalMode('add');
        setSelectedMahasiswa(null);
        setIsModalOpen(true);
    };

    const handleEditData = (mahasiswa) => {
        setModalMode('edit');
        setSelectedMahasiswa(mahasiswa);
        setIsModalOpen(true);
    };

    const onDeleteMahasiswa = async (mahasiswaToDelete) => {
        const id = mahasiswaToDelete.id;

        try {
            const response = await api.delete(`/mahasiswa/${id}`);            

            if (response.status === 200 || response.status === 204) {
                await fetchMahasiwaData(); 
                alert("Data Mahasiswa berhasil dihapus!");
            } else {                 
                throw new Error("Gagal menghapus data."); 
            }
        } catch (error) {
            console.error("Error saat menghapus data: ", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Cek console untuk detail.";
            alert(`Gagal menghapus data: ${errorMessage}`);
        }    
    };

    const handleModalSubmit = async (formData) => { 
        if (modalMode === 'add') {
            try {               
                const response = await api.post('/mahasiswa', formData);

                await fetchMahasiwaData(); 

                alert('Data berhasil ditambahkan!');

            } catch (error) {
                console.error("Error saat menambahkan data:", error.response || error);
                const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat menambahkan data.";
                alert(`Gagal menambahkan data: ${errorMessage}`);
            }

        } else if (modalMode === 'edit' && selectedMahasiswa) { 
            try {
                const id = selectedMahasiswa.id;
                const response = await api.put(`/mahasiswa/${id}`, formData);

                await fetchMahasiwaData();

                alert('Data berhasil diperbarui!');

            } catch (error) {
                console.error("Error saat memperbarui data:", error.response || error);
                const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat memperbarui data.";
                alert(`Gagal memperbarui data: ${errorMessage}`);
            }

        } else {
            alert('Mode tidak valid atau data mahasiswa tidak terpilih.');
        }
        setIsModalOpen(false); 
    };

    // handler export template csv/xlsx
    const handleExportTemplate = async () => {
        try {
            const response = await api.get('/excel/mahasiswa/template', {
                responseType: 'blob', 
            });

            // bikin URL dari blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'templateMahasiswa.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            alert('Template berhasil didownload!');
        } catch (error) {
            console.error("Error saat export template:", error);
            alert('Gagal mendownload template. Silakan coba lagi.');
        }
    };

    // handler import data dari csv/xlsx
    const handleImportData = async (file) => {
        if (!file) {
            alert('Silakan pilih file terlebih dahulu');
            return;
        }

        // validasi tipe file
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv' // .csv
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('Format file tidak valid. Gunakan file .xlsx, .xls, atau .csv');
            return;
        }

        // transform Excel header dari "Nama Panjang" ke "nama_panjang"
        try {
            setIsLoading(true);            
            const XLSX = await import('xlsx');
            
            // baca file Excel
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // convert ke JSON dengan header asli
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            
            // transform header
            const transformedData = jsonData.map(row => {
                const newRow = {};
                Object.keys(row).forEach(key => {
                    const newKey = key
                        .toLowerCase()
                        .replace(/\s+/g, '_')  // Spasi jadi underscore
                        .replace(/[^\w_]/g, ''); // Hapus karakter spesial
                    newRow[newKey] = row[key];
                });
                return newRow;
            });
            
            // bikin excel baru dengan header yang benar
            const newWorksheet = XLSX.utils.json_to_sheet(transformedData);
            const newWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');
            
            // convert ke blob
            const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            // bikin formData dengan file yang sudah ditransform
            const formData = new FormData();
            formData.append('file', blob, file.name);

            const response = await api.post('/excel/mahasiswa/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.imported === 'success') {
                alert('Data berhasil diimport!');
                await fetchMahasiwaData(); 
            } else if (response.data.imported === 'partially') {
                const failures = response.data.failures;
                let errorMsg = 'Beberapa data gagal diimport:\n\n';
                
                failures.forEach((failure, index) => {
                    errorMsg += `Baris ${failure.row}: ${failure.errors.join(', ')}\n`;
                    if (index >= 4) { 
                        errorMsg += '... dan lainnya';
                        return;
                    }
                });
                
                alert(errorMsg);
                await fetchMahasiwaData(); 
            }
        } catch (error) {
            console.error("Error saat import data:", error);
            
            if (error.response?.status === 422) {
                // validation error
                const failures = error.response.data.failures;
                if (failures && failures.length > 0) {
                    let errorMsg = 'Terdapat error pada data:\n\n';
                    failures.slice(0, 5).forEach(failure => {
                        const errors = Array.isArray(failure.errors) ? failure.errors : Object.values(failure.errors).flat();
                        errorMsg += `Baris ${failure.row}: ${errors.join(', ')}\n`;
                    });
                    if (failures.length > 5) {
                        errorMsg += `... dan ${failures.length - 5} error lainnya\n\n`;
                    }
                    errorMsg += '\nTips: Pastikan format data sesuai dengan template.\n';
                    errorMsg += 'Untuk kolom Jabatan, gunakan nilai: FE, BE, UI/UX, PM, atau Anggota';
                    alert(errorMsg);
                } else {
                    alert('Format data tidak sesuai. Silakan periksa kembali file Anda.');
                }
            } else {
                alert('Gagal mengimport data. Silakan coba lagi.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <DashboardHeader title="Data Mahasiswa"/>
            <main className="p-4">
                <DataTable
                    data={mahasiswaData}
                    columns={MAHASISWA_COLUMNS}
                    title="Data Mahasiswa"
                    onSearch={handleSearch}
                    onAdd={handleAddData}
                    onEdit={handleEditData}
                    onDelete={onDeleteMahasiswa}
                    onExport={handleExportTemplate}
                    onImport={handleImportData}
                    totalPages={5} 
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    isLoading={isLoading} 
                />
            </main>
            <MahasiswaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedMahasiswa}
                mode={modalMode}
            />
        </>
    );
}