"use client"
import { Search, LogOut, Menu, ChevronLeft, Home } from "lucide-react"
import { Input } from "@/components/ui/input";
import Link from "next/link"
import { usePathname } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; 

export function AppSidebar({ isExpanded, onToggle }) { 
  const pathname = usePathname();
  
  // lebarnya penuh saat isExpanded atau kecil saat collapsed
  const sidebarWidthClass = isExpanded ? "w-sidebar-width" : "w-[72px]";

  const items = [
    {title: "Beranda", href: "/"},
    {title: "Data Dosen", href: "/data-dosen"},
    {title: "Data Asisten", href: "/data-asisten"},
    {title: "Data Mahasiswa", href: "/data-mahasiswa"},
    {title: "Nilai Individu Mahasiswa", href: "/nilai-individu-mahasiswa"},
    {title: "Proyek & Kelompok", href: "/proyek-dan-kelompok"},
    {title: "Matriks Nilai", href: "/matriks-nilai"},    
    {title: "Laporan Progres", href: "/laporan-progres"},
  ]

  return (
    // animation
    <div className={`${sidebarWidthClass} bg-dark-purple text-white flex flex-col min-h-screen transition-all duration-300 ease-in-out`}>
      {/* HEADER: MONPAD & TOGGLE */}
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

      {/* SEARCH BAR: hanya tampil saat isExpanded */}
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

      <nav className={`flex-1 overflow-y-auto px-4 space-y-2 ${!isExpanded && 'hidden'}`}>
        <Accordion type="single" collapsible className="w-full">
          {/* accordion untuk menu */}
          <AccordionItem value="menu" className="border-none">
            <AccordionTrigger className="text-white hover:no-underline font-medium">Menu</AccordionTrigger>
            <AccordionContent>
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-2 pl-4 rounded-md transition-colors ${
                    pathname === item.href ? "bg-white text-indigo-950 font-semibold" : "text-gray-200 hover:bg-dark-purple/80"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* accordion untuk akun */}
          <AccordionItem value="account" className="border-none">
            <AccordionTrigger className="text-white hover:no-underline font-medium">Akun</AccordionTrigger>
            <AccordionContent>
              <Link href="#" className="block py-2 pl-4 text-gray-200 hover:bg-dark-purple/80 rounded-md">
                Log Out
              </Link>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </nav>

      {/* info user, hanya tampil saat isExpanded */}
      {isExpanded && (
        <div className="p-4 border-t border-indigo-700 mt-auto flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Nama Dosen</p>
            <p className="text-xs text-gray-400">Dosen</p>
          </div>
          <LogOut className="h-5 w-5 text-gray-400 cursor-pointer hover:text-white" />
        </div>
      )}
      
      {/* jika collapsed, menampilkan logo kecil di bawah */}
      {!isExpanded && (
        <div className="flex flex-col items-center justify-center p-2 space-y-4 mt-auto mb-4">
            <Home className="h-6 w-6 text-gray-400 hover:text-white transition-colors cursor-pointer" />
            <LogOut className="h-6 w-6 text-gray-400 hover:text-white transition-colors cursor-pointer" />
        </div>
      )}
    </div>
  );
}
