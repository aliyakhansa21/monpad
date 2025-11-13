"use client"
import { Search, LogOut, Menu, ChevronLeft, Home } from "lucide-react"
import  Input  from "@/components/ui/input";
import Link from "next/link"
import { usePathname } from "next/navigation";

const menus = {
  dosen: [
    {title: "Beranda", href: "/dashboard/dosen"},
    {title: "Data Dosen", href: "/dashboard/data-dosen"},
    {title: "Data Asisten", href: "/dashboard/data-asisten"},
    {title: "Data Mahasiswa", href: "/dashboard/data-mahasiswa"},
    {title: "Nilai Individu Mahasiswa", href: "/nilai-individu-mahasiswa"},
    {title: "Proyek & Kelompok", href: "/dashboard/data-proyek"},
    {title: "Matriks Nilai", href: "/dashboard/matriks-nilai"},
    {title: "Laporan Progres", href: "/dashboard/laporan-progres"},
  ],
  asisten: [
    {title: "Beranda", href: "/dashboard/asisten"},
    {title: "List Proyek", href: "/dashboard/list-proyek"},
    {title: "List Peserta", href: "/dashboard/list-peserta"},
    {title: "Presensi Peserta", href: "/dashboard/presensi"},
    {title: "Laporan Mingguan", href: "/dashboard/laporan-mingguan"},
  ],
  mahasiswa: [
    {title: "Beranda", href: "/dashboard/mahasiswa"},
    {title: "Progres Proyek", href: "/dashboard/progres-proyek"},
    {title: "Nilai Anggota Tim", href: "/dashboard/nilai-anggota"},
    {title: "Nilai Akhir", href: "/dashboard/nilai-akhir"},
  ]
}


export function AppSidebar({ isExpanded, onToggle, userRole, userName, userRoleTitle }) { 
  const pathname = usePathname();
  const sidebarWidthClass = isExpanded ? "w-sidebar-width" : "w-[72px]";
  const currentItems = menus[userRole] || [];

  return (
    <div className={`${sidebarWidthClass} bg-dark-purple text-white flex flex-col min-h-screen transition-all duration-300 ease-in-out`}>
      <div className={`flex items-center p-6 mb-4 ${isExpanded ? "justify-between" : "justify-center"}`}>
        {isExpanded && <h1 className="text-4xl font-bold ">MonPAD</h1>}
        <button 
          onClick={onToggle}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isExpanded ? '' : 'mx-auto'}`}
          aria-label={isExpanded ? "Tutup Sidebar" : "Buka Sidebar"}
        >
          <ChevronLeft className={`h-6 w-6 transform transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`} />
        </button>
      </div>

      {isExpanded && (
        <div className="relative mx-4 mb-4">
          <Input 
            type="search"
            placeholder="Search"
            className="bg-indigo-950 border-dark-purple text-white placeholder:text-gray-400 pl-8" 
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 text-gray-400" />
        </div>
      )}

      <nav className={`flex-1 overflow-y-auto px-4 space-y-2`}>         
        {currentItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block py-2 rounded-md transition-colors pl-[16px] pr-2 ${
            pathname === item.href ? "bg-white text-indigo-950 font-semibold" : "text-gray-200 hover:bg-dark-purple/80"
            }`}>
            {item.title}
          </Link>
        ))}

        {isExpanded && (
            <Link
              href="#" // Ganti dengan fungsi atau path Log Out yang sebenarnya
              className={`block py-2 rounded-md transition-colors pl-[16px] pr-2 mt-4 text-gray-200 hover:bg-dark-purple/80 border-t border-indigo-700/50 pt-3`}
            >
              <div className="flex items-center space-x-2">
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </div>
            </Link>
        )}
        
        {/* Hapus elemen Accordion lama sepenuhnya jika tidak digunakan */}
        {/* <Accordion type="single" collapsible className="w-full">...</Accordion> */}
      </nav>

      {/* 4. Tampilan Profil Dinamis */}
      {isExpanded && (
        <div className="p-4 border-t border-indigo-700 mt-auto flex items-center justify-between">
          <div className='flex items-center space-x-2'>
            {/* Avatar Placeholder */}
            <div className='h-8 w-8 rounded-full bg-gray-400 flex-shrink-0'></div>
            <div>
              {/* Menggunakan data dinamis dari props */}
              <p className="font-semibold text-sm">{userName}</p>
              <p className="text-xs text-gray-400">{userRoleTitle}</p>
            </div>
          </div>
            <button aria-label="Detail Profil" className="p-1 rounded-full hover:bg-white/10 transition-colors">
              {/* Ikon untuk detail profil atau Log Out. Kita pakai LogOut ikon di sini agar konsisten */}
              <LogOut className="h-5 w-5 text-gray-400 cursor-pointer hover:text-white" />
            </button>
        </div>
      )}
      
      {/* 5. Icon saat collapsed (Log Out dan Beranda) */}
      {!isExpanded && (
        <div className="flex flex-col items-center justify-center p-2 space-y-4 mt-auto mb-4">
            <button aria-label="Beranda" className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <Home className="h-6 w-6 text-gray-400 hover:text-white transition-colors cursor-pointer" />
            </button>
            <button aria-label="Log Out" className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <LogOut className="h-6 w-6 text-gray-400 hover:text-white transition-colors cursor-pointer" />
            </button>
        </div>
      )}
    </div>
  );
}