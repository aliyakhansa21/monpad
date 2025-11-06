"use client"
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AppSidebar } from "@/components/organism/app-sidebar";
import DashboardHeader from '@/components/organism/DashboardHeader';
import Footer from "@/components/organism/Footer";
import MingguSelect from '@/components/molecules/MingguSelect'; 
import InputNilaiModal from '@/components/organism/InputNilaiModal';

export default function AbsensiPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const toggleSidebar = () => { setIsSidebarExpanded(prev => !prev); };

    
    const mainContentMargin = isSidebarExpanded ? "ml-[256px]" : "ml-[72px]";

    return (
        <div className='flex top-col min-h-screen'>
            {/* Sidebar */}
            <div className='fixed top-0 left-0 h-full z-10'>
                <AppSidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={toggleSidebar}
                />
            </div>

            {/* Main Content Area */}
            <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                <div className='p-3 flex-1 bg-background-light'>
                    <div className={`pl-6`}>
                        <DashboardHeader title="Presensi Peserta"/>
                    </div>
                </div>
                <Footer/>
            </div>
        </div>
    )
}
