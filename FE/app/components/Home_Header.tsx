'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCookie, deleteCookie } from '../utils/cookies';
import { Bell } from 'lucide-react';

export default function Home_Header() {
    const router = useRouter();
    const pathname = usePathname(); 

    const [userEmail] = useState(() => {
        if (typeof window !== 'undefined') {
            return getCookie('userEmail') || '';
        }
        return '';
    });
    
    const [userName] = useState(() => {
        if (typeof window !== 'undefined') {
            const email = getCookie('userEmail');
            if (email) {
                const name = email.split('@')[0];
                return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._-]/g, ' ');
            }
        }
        return 'User';
    });

    const handleLogout = () => {
        console.log('🚪 Logging out...');
        deleteCookie('isLoggedIn');
        deleteCookie('userEmail');
        router.replace('/login');
    };


    const getLinkClass = (path: string) => {
        const isActive = pathname === path;
        
        return isActive 
            ? "text-white font-bold border-b-[3px] border-white pb-1 transition-all whitespace-nowrap" 
            : "text-white font-medium hover:text-gray-200 border-b-[3px] border-transparent pb-1 transition-all whitespace-nowrap"; 
    };

    return (

        <header className="bg-linear-to-r from-[#1BA7D9] to-[#235697] px-6 lg:px-12 py-4">
            <div className="flex justify-between items-center">
                {/* Left - Logo and Brand */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 relative">
                        <Image 
                            src="/ITS_LOGO1.png" 
                            alt="ITS Logo" 
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="text-white font-bold text-xl sm:text-2xl tracking-wide">ITS</span>
                </div>

                {/* Center - Navigation (Desktop) */}
                <nav className="hidden lg:flex items-center gap-8">
                    <Link href="/home" className={getLinkClass('/home')}>
                        Home
                    </Link>
                    
                    <a href="#" className={getLinkClass('/courses')}>
                        Courses
                    </a>

                    <Link href="/assessment" className={getLinkClass('/assessment')}>
                        Assessment
                    </Link>

                    <a href="#" className={getLinkClass('/progress')}>
                        Progress
                    </a>
                    <a href="#" className={getLinkClass('/blog')}>
                        Blog
                    </a>
                    <a href="#" className={getLinkClass('/about-us')}>
                        About Us
                    </a>
                </nav>

                {/* Right - Notification, User Profile, and Logout */}
                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <button className="relative p-2 hover:bg-white/10 rounded-full transition">
                        <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {/* User Avatar */}
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white overflow-hidden flex items-center justify-center relative">
                                <Image 
                                    src="/ITS_LOGO1.png" 
                                    alt="User Avatar" 
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                />
                            </div>
                            {/* User Name */}
                            <span className="text-white font-semibold hidden sm:block text-sm sm:text-base">
                                {userName || "User"}
                            </span>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="
                                bg-white text-[#235697]
                                px-3 py-1.5
                                sm:px-6 sm:py-2
                                rounded-full font-semibold
                                hover:bg-red-600 hover:text-white
                                transition
                                text-xs sm:text-base
                            "
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="lg:hidden flex items-center gap-4 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {/* ĐỒNG BỘ CHO MOBILE LUÔN */}
                <Link href="/home" className={getLinkClass('/home')}>
                    Home
                </Link>
                
                <a href="#" className={getLinkClass('/courses')}>
                    Courses
                </a>
                
                <Link href="/assessment" className={getLinkClass('/assessment')}>
                    Assessment
                </Link>

                <a href="#" className={getLinkClass('/progress')}>
                    Progress
                </a>
                <a href="#" className={getLinkClass('/blog')}>
                    Blog
                </a>
                <a href="#" className={getLinkClass('/about-us')}>
                    About Us
                </a>
            </nav>
        </header>
    );
}