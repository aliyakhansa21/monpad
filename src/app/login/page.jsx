"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; 

export default function Login() {
    const { login, loginWithGoogle } = useAuth();
    
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
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

    const handleGoogleLogin = () => {
        loginWithGoogle();
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

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2 sm:py-3 rounded-md transition-all duration-300 shadow-sm hover:shadow-md mb-4 sm:mb-6"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm sm:text-base">Masuk dengan Google</span>
                </button>

                {/* Divider */}
                <div className="relative my-4 sm:my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">atau</span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    
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