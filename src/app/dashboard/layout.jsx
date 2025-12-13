"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppSidebar } from "@/components/organism/app-sidebar";
import Footer from "@/components/organism/Footer";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
    const { 
        isLoggedIn, 
        isLoading, 
        user,
        role,
        logout 
    } = useAuth();

    const router = useRouter(); 
    const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
    const toggleSidebar = () => { setIsSidebarExpanded(prev => !prev); };

    const currentUserName = user?.username || 'Pengguna';
    const currentUserRoleTitle = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Loading'; 

    React.useEffect(() => {
        if (!isLoading) {
            
            if (!isLoggedIn) {
                console.log("Dashboard Guard: User tidak login, redirect ke /login");
                router.replace('/login'); 
                return; 
            }
            
            if (isLoggedIn && user && role && window.location.pathname === '/dashboard') {
                router.replace(`/dashboard/${role}`);
            }
        }
    }, [isLoading, isLoggedIn, router, user, role]);
    
    if (isLoading || !isLoggedIn || !user || !role) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p>Memuat sesi atau mengarahkan ke halaman login...</p>
            </div>
        );
    }

    return (
        <div className='flex w-full min-h-screen'>
            {/* Sidebar - Fixed position */}
            <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out 
                            ${isSidebarExpanded ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}> 
                <AppSidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={toggleSidebar}                    
                    userRole={role} 
                    userName={currentUserName}
                    userRoleTitle={currentUserRoleTitle}
                    onLogout={logout} 
                />
            </div>

            {/* Toggle button untuk mobile */}
            {!isSidebarExpanded && (
                <button
                    onClick={toggleSidebar}
                    className="fixed top-2 left-2 p-1 z-50 md:hidden 
                            bg-white border border-gray-300 text-dark-purple rounded-md shadow-sm"
                    aria-label="Buka Menu"
                >
                    <Menu className="h-6 w-6" />
                </button>
            )}

            {/* Main Content Area */}
            <div className={`flex flex-col flex-1 w-full relative z-10
                            transition-all duration-300 ease-in-out 
                            ${isSidebarExpanded 
                                ? 'md:ml-[280px]' // Sidebar terbuka
                                : 'md:ml-[72px]'   // Sidebar tertutup
                            } ml-0`}>
                
                {isSidebarExpanded && (
                    <div 
                        className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
                        onClick={toggleSidebar} 
                    />
                )}
                
                {/* Content Area */}
                <div className='flex-1 bg-gray-100'>
                    <main className="p-4 md:p-6 min-h-[calc(100vh-140px)] w-full"> 
                        {children} 
                    </main>
                </div>
                
                <Footer/>
            </div>
        </div>
    );
}