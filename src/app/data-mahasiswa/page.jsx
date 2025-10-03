"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { useState } from "react";
import { DataTable } from "@/components/DataTable"; 
// import { Footer } from "@/components/Footer"; 

const mahasiswaData = [
    {}
]
nama, email, nim, angkatan, prodi, jabatan
export default function DataMahasiswaPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); 

    const toggleSidebar = () => {
        setIsSidebarExpanded(prev => !prev);
    }
    
    const mainContentMargin = isSidebarExpanded ? "ml-sidebar-width" : "ml-[72px]";

    return (
        <div className="flex flex-col min-h-screen">
            <div className="fixed top-0 left-0 h-full z-10">
                <AppSidebar 
                    isExpanded={isSidebarExpanded} //nerusin status saat ini 
                    onToggle={toggleSidebar}       //nerusin fungsi kontrol 
                />
            </div>

            {/* main content-> bergeser sesuai status utama */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                <div className="flex-1">
                    {/* <DataTable />  */}
                </div>
                {/* <Footer /> */}
            </main>

        </div>
    );
}
