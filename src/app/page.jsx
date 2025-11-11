import Link from 'next/link';
import Footer from "@/components/organism/Footer";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-t to-login-end from-login-start">
        
        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20 md:py-24">
            <div className="
                bg-[#E2E8F0] 
                shadow-2xl 
                w-full 
                max-w-sm 
                sm:max-w-lg 
                lg:max-w-[1315px] 
                rounded-[20px] 
                py-16 
                sm:py-20 
                md:py-[96px] 
                px-8 
                sm:px-12 
                md:px-[130px] 
                text-center
            ">
            <h1 className="
                text-3xl 
                sm:text-5xl 
                md:text-7xl 
                font-bold 
                text-primary 
                mb-4 
                sm:mb-6 
                leading-tight
            ">
                Welcome To MonPAD
            </h1>
            <p className="
                text-base 
                sm:text-xl 
                md:text-2xl 
                text-[#1E1E1E] 
                mb-8 
                sm:mb-10 
                md:mb-12
            ">
                Web Monitoring Proyek Aplikasi Dasar
            </p>
            <Link 
                href="/login"
                className="
                    inline-block 
                    bg-primary 
                    hover:bg-background-dark 
                    text-white 
                    font-semibold 
                    text-base 
                    sm:text-lg 
                    w-full 
                    sm:w-auto 
                    px-12 
                    sm:px-16 
                    py-3 
                    sm:py-4 
                    rounded-md 
                    transition-all 
                    duration-300 
                    shadow-lg 
                    hover:shadow-xl
                "
            >
                Log In
            </Link>
            </div>
        </main>

        {/* Footer */}
        <Footer/>
        </div>
    );
}