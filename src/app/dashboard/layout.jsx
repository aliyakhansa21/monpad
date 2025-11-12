"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppSidebar } from "@/components/organism/app-sidebar";
import DashboardHeader from '@/components/organism/DashboardHeader';
import Footer from "@/components/organism/Footer";

export default function DashboardLayout({ children }) {
    const { isLoggedIn, isLoading, user } = useAuth();
    const router = useRouter();    
    const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
    const toggleSidebar = () => { setIsSidebarExpanded(prev => !prev); };

    React.useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push('/login');
        }
    }, [isLoading, isLoggedIn, router]);

    const mainContentMargin = isSidebarExpanded ? "md:ml-[256px]" : "md:ml-[72px]";

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
                />
            </div>

            <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>                
                <div className='p-3 flex-1 bg-background-light'>
                    <div className={`pl-6`}>
                        <main className="p-4 md:p-6">
                            {children} 
                        </main>
                    </div>
                </div>
                
                <Footer/>
            </div>
        </div>
    );
}