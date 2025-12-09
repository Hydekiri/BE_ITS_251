'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from '../utils/cookies';

interface AuthWrapperProps {
    children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        console.log('🔍 Checking authentication...');
        
        // ĐỌC TỪ COOKIE thay vì localStorage
        const isLoggedIn = getCookie('isLoggedIn');
        const userEmail = getCookie('userEmail');
        
        console.log('🍪 Cookies:', { isLoggedIn, userEmail });
        
        if (isLoggedIn !== 'true') {
            console.log('❌ Not logged in, redirecting to /login');
            router.replace('/login');
        } else {
            console.log('✅ Logged in, showing content');
            setTimeout(() => {
                setIsChecking(false);
            }, 0);
        }
    }, [router]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <div className="text-xl font-semibold text-gray-700">Đang tải...</div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthWrapper;