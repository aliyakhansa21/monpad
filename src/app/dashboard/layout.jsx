"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppSidebar } from "@/components/organism/app-sidebar";
import Footer from "@/components/organism/Footer";

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

    const mainContentMargin = isSidebarExpanded ? "md:ml-[280px]" : "md:ml-[72px]"; 

    if (isLoading || !isLoggedIn) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p>Memuat sesi atau mengarahkan ke halaman login...</p>
            </div>
        );
    }

    return (
        <div className='flex flex-col min-h-screen'>
            <div className='fixed top-0 left-0 h-full z-20'>
                <AppSidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={toggleSidebar}                    
                    userRole={role} 
                    userName={currentUserName}
                    userRoleTitle={currentUserRoleTitle}
                    onLogout={logout} 
                />
            </div>

            <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}> 
                <div className='flex-1 bg-gray-100'>
                    <main className="p-4 md:p-6 min-h-[calc(100vh-140px)]"> 
                        {children} 
                    </main>
                </div>
                
                <Footer/>
            </div>
        </div>
    );
}