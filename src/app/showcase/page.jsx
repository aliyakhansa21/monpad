"use client";

import React, { useState } from 'react';

// === ATOMS ===
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Icon from '@/components/atoms/Icon';

// === MOLECULES ===
import Pagination from '@/components/molecules/Pagination';
import SearchInput from '@/components/molecules/SearchInput';

// === ORGANISMS & Lainnya ===
import Footer from '@/components/organism/Footer';
import DataTable from '@/components/organism/DataTable';
import DashboardHeader from '@/components/organism/DashboardHeader';
import MahasiswaModal from '@/components/organism/MahasiswaModal';
import { AppSidebar } from '@/components/organism/app-sidebar';

const ComponentShowcase = () => {
    // --- Pindahkan semua hooks ke sini ---
    const totalPages = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Pindahkan fungsi ke sini ---
    const handlePageChange = (page) => setCurrentPage(page);
    const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    // --- Mock Data & Functions untuk demonstrasi ---
    const mockData = [
        { id: 1, nama: 'John Doe', email: 'john@example.com', nim: '12345', jabatan: 'FE' },
        { id: 2, nama: 'Jane Smith', email: 'jane@example.com', nim: '67890', jabatan: 'BE' },
    ];
    
    const mockColumns = [
        { key: 'nama', label: 'Nama' },
        { key: 'nim', label: 'NIM' },
        { key: 'jabatan', label: 'Jabatan' },
        { key: 'actions', label: 'Aksi' },
    ];

    const handleSearch = (e) => console.log('Searching for:', e.target.value);
    const handleAdd = () => console.log('Add button clicked');
    const handleEdit = (item) => console.log('Edit item:', item);
    const handleDelete = (item) => console.log('Delete item:', item);
    const handleModalSubmit = (data) => console.log('Modal submitted:', data);

    return (
        <div style={{ display: 'flex' }}>
            {/* App Sidebar - Tampilan menyatu dengan halaman */}
            <AppSidebar isExpanded={isSidebarExpanded} onToggle={toggleSidebar} />

            <div style={{ flexGrow: 1, padding: '20px', backgroundColor: '#e5e5e5' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '40px' }}>
                    Dokumentasi Komponen Proyek
                </h1>

                {/* === Header === */}
                <div style={{ marginBottom: '40px' }}>
                    <h2>Dashboard Header</h2>
                    <DashboardHeader title="Halaman Utama" />
                </div>

                {/* === Bagian ATOMS === */}
                <div style={{ marginBottom: '40px' }}>
                    <h2>Atoms</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                        <Button variant="primary">Tombol Primary</Button>
                        <Button variant="secondary">Tombol Secondary</Button>
                        <Button variant="danger">Tombol Danger</Button>
                        <Button variant="ghost">Tombol Ghost</Button>
                        <Button variant="icon-only"><Icon name="plus-square" /></Button>
                        <Input placeholder="Contoh Input Teks" />
                        <Icon name="edit" />
                        <Icon name="delete" />
                        <Icon name="plus-square" />
                    </div>
                </div>

                {/* === Bagian MOLECULES === */}
                <div style={{ marginBottom: '40px' }}>
                    <h2>Molecules</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <SearchInput placeholder="Cari Data..." onChange={handleSearch} />
                        <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange} />
                    </div>
                </div>

                {/* === Bagian ORGANISMS & Lainnya === */}
                <div style={{ marginBottom: '40px' }}>
                    <h2>Organisms</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <DataTable
                            data={mockData}
                            columns={mockColumns}
                            onSearch={handleSearch}
                            onAdd={handleAdd}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>

                {/* === Bagian MODAL (klik tombol untuk muncul) === */}
                <div style={{ marginBottom: '40px' }}>
                    <h2>Modal</h2>
                    <p>Klik tombol di bawah untuk menampilkan Modal Mahasiswa:</p>
                    <Button onClick={handleOpenModal}>Tampilkan Modal</Button>
                    <MahasiswaModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSubmit={handleModalSubmit}
                        initialData={{}}
                        mode="add"
                    />
                </div>

                {/* === Bagian FOOTER === */}
                <Footer />
            </div>
        </div>
    );
};

export default ComponentShowcase;