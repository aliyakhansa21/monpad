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

    const currentUserName = user?.name || 'Pengguna';
    const currentUserRoleTitle = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Loading'; 

    React.useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push('/login');
        }
        if (!isLoading && isLoggedIn && user && role && window.location.pathname === '/dashboard') {
            router.push(`/dashboard/${role}`);
        }

    }, [isLoading, isLoggedIn, router, user, role]);

    const sidebarWidthOpen = '280px';
    const sidebarWidthClosed = '72px';
    
    const mainContentMargin = isSidebarExpanded 
        ? `md:ml-[${sidebarWidthOpen}] ml-0`  
        : `md:ml-[${sidebarWidthClosed}] ml-0`; 
    
    const sidebarMobileTransform = isSidebarExpanded ? 'translate-x-0' : '-translate-x-full';
    
    
    if (isLoading || !isLoggedIn) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p>Memuat sesi atau mengarahkan ke halaman login...</p>
            </div>
        );
    }

    return (
        <div className='flex w-full min-h-screen'>
            <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out 
                            ${sidebarMobileTransform} md:translate-x-0`}> 
                <AppSidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={toggleSidebar}                    
                    userRole={role} 
                    userName={currentUserName}
                    userRoleTitle={currentUserRoleTitle}
                    onLogout={logout} 
                />
            </div>

            {/* toggle sidebar mobile */}
            {!isSidebarExpanded && (
                <button
                    onClick={toggleSidebar}
                    className="fixed top-4 left-4 p-2 z-50 md:hidden 
                            bg-dark-purple text-white rounded-full shadow-lg"
                    aria-label="Buka Menu"
                >
                    <Menu className="h-6 w-6" />
                </button>
            )}

            <div className={`flex flex-col flex-1 w-full relative z-10
                            transition-all duration-300 ease-in-out 
                            ${mainContentMargin} `}> 
                
                {isSidebarExpanded && (
                    <div 
                        className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
                        onClick={toggleSidebar} 
                    />
                )}
                
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