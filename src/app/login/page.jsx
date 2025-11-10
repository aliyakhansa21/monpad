"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; 
// import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        role: '',
        password: '',
        remember: false
    });

    const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({
                email: formData.email,
                password: formData.password,
            });
        } catch (error) {
            alert(error.message); 
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b to-login-end from-login-start flex items-center justify-center px-4 py-8 sm:py-12">            
            <div className="
                w-full 
                max-w-xs 
                sm:max-w-md 
                bg-white 
                rounded-2xl 
                sm:rounded-3xl 
                shadow-2xl 
                p-6 
                sm:p-8 
                relative
            ">                
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-sm sm:text-base text-gray-600 hover:text-gray-800 mb-4 sm:mb-6 transition-colors"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali
                </button>

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Log In</h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    {/* Nama */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Nama</label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            placeholder="Masukkan Nama"
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-primary rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                            required
                        />
                    </div>
                    
                    {/* Email */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Masukkan Email"
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-primary rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                            required
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-primary rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none bg-white cursor-pointer text-sm sm:text-base"
                            required
                        >
                            <option value="">Dosen/Asisten/Mahasiswa</option>
                            <option value="dosen">Dosen</option>
                            <option value="asisten">Asisten</option>
                            <option value="mahasiswa">Mahasiswa</option>
                        </select>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Password</label>
                        <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-primary rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
                        required
                        />
                    </div>

                    {/* Remember & Forgot Password */}
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                        <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={formData.remember}
                            onChange={handleChange}
                            className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 border-primary rounded focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="ml-2 text-gray-600">Ingat saya</span>
                        </label>
                        <Link 
                        href="/forgot-password" 
                        className="text-gray-600 font-medium"
                        >
                        Lupa Sandi?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-background-dark text-white font-semibold py-2 sm:py-3 rounded-md transition-all duration-300 shadow-md hover:shadow-lg text-base sm:text-lg"
                    >
                    Masuk
                    </button>
                </form>
            </div>
        </div>
    );
}