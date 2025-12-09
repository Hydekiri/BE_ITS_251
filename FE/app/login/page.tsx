'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Login_Header from '../components/Login_Header';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import Image from 'next/image';
import { AuthService } from '../services/auth.service';
import { setCookie } from '../utils/cookies';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('🔐 Đăng nhập với:', email);

            const response = await AuthService.login({
                email,
                password,
                rememberMe,
            });

            if (response.success && response.data.user) {
                console.log('✅ Đăng nhập thành công:', response.data.user);

                // MANUAL COOKIE SETTING (Bypass AuthService issues)
                console.log('🍪 Setting cookies manually in LoginPage...');
                setCookie('isLoggedIn', 'true');
                setCookie('userEmail', response.data.user.email);
                setCookie('userRole', response.data.user.role || 'student');
                console.log('✅ Cookies set manually');

                // Redirect based on role
                const userRole = response.data.user.role;
                if (userRole === 'teacher') {
                    router.push('/home'); // Teacher dashboard
                } else {
                    router.push('/home'); // Student dashboard
                }
            }
        } catch (err: any) {
            console.error('❌ Lỗi đăng nhập:', err);
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Login_Header />

            <div className="px-4 sm:px-8 lg:px-18">
                <div className="flex">
                    {/* Left Section */}
                    <div className="hidden lg:flex lg:w-1/2 bg-white flex-col justify-center items-center px-12 py-16">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4 italic">Intelligent Tutoring System</h2>
                        <p className="text-2xl text-gray-700 text-center mb-4 leading-relaxed">
                            Supporting Learners through Personalized Learning Pathways !
                        </p>
                        <div className="w-full relative" style={{ aspectRatio: '1/1' }}>
                            <Image
                                src="/bgits1.jpg"
                                alt="Background ITS"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                        <div className="w-full max-w-xl bg-white rounded-[10px] shadow-lg p-8">
                            {/* Tabs */}
                            <div className="flex gap-2 mb-8">
                                <button
                                    onClick={() => setSelectedRole('student')}
                                    className={`w-1/2 py-3 font-bold text-base rounded-[10px] transition-all ${selectedRole === 'student'
                                        ? 'bg-linear-to-r from-[#235697] to-[#1BA7D9] text-white'
                                        : 'bg-gray-200 text-gray-400'
                                        }`}
                                    style={{ boxShadow: selectedRole === 'student' ? 'inset 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05)' }}
                                >
                                    Learner
                                </button>
                                <button
                                    onClick={() => setSelectedRole('teacher')}
                                    className={`w-1/2 py-3 font-bold text-base rounded-[10px] transition-all ${selectedRole === 'teacher'
                                        ? 'bg-linear-to-r from-[#235697] to-[#1BA7D9] text-white'
                                        : 'bg-gray-200 text-gray-400'
                                        }`}
                                    style={{ boxShadow: selectedRole === 'teacher' ? 'inset 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05)' }}
                                >
                                    Teacher
                                </button>
                            </div>

                            {/* Form Title */}
                            <h1 className="text-3xl font-bold text-gray-800 mb-6">ĐĂNG NHẬP</h1>

                            {/* Error */}
                            {error && (
                                <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6 text-sm border border-red-300">
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email */}
                                <div>
                                    <label className="block text-[#235697] font-semibold mb-2 text-md">
                                        Tên đăng nhập
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nguyentu@hcumut.edu.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#235697] focus:ring-2 focus:ring-[#235697]/20 bg-white placeholder-gray-400 transition-all"
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-[#235697] font-semibold mb-2 text-md">Mật khẩu</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="xinchaoLatee123*"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#235697] focus:ring-2 focus:ring-[#235697]/20 bg-white placeholder-gray-400 transition-all"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-3.5 text-gray-600 hover:text-gray-800 transition-colors"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="w-5 h-5" />
                                            ) : (
                                                <EyeIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember me */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-5 h-5 text-[#235697] border-gray-300 rounded focus:ring-[#235697]"
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="remember" className="text-gray-700 text-sm">
                                            Ghi nhớ đăng nhập
                                        </label>
                                    </div>
                                    <a href="#" className="bg-linear-to-r from-[#235697] to-[#1BA7D9] bg-clip-text text-transparent text-sm underline decoration-[#235697] font-semibold">
                                        Quên mật khẩu?
                                    </a>
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full bg-linear-to-r from-[#235697] to-[#1BA7D9] text-white font-bold py-3 rounded-lg transition duration-200 ${isLoading
                                        ? 'opacity-70 cursor-not-allowed'
                                        : 'hover:shadow-lg hover:scale-[1.02]'
                                        }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Đang đăng nhập...
                                        </span>
                                    ) : (
                                        'ĐĂNG NHẬP'
                                    )}
                                </button>
                            </form>

                            {/* Sign up */}
                            <div className="text-center mt-6">
                                <span className="text-gray-600 text-sm">
                                    Chưa có tài khoản?{' '}
                                    <a href="#" className="text-[#235697] font-bold hover:underline">
                                        Đăng ký ngay!
                                    </a>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}