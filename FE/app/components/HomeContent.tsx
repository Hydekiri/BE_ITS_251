'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Home_Header from './Home_Header';

const HomeContent = () => {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState(
        typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : ''
    );

    

    return (
        <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <Home_Header />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Welcome to ITS
            </h1>
            <p className="text-lg text-gray-600 mb-6">
                Welcome to Learner - Your Integrated Technology Solution
            </p>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <h2 className="text-xl font-bold text-gray-800 mb-3">📊 Dashboard</h2>
                <p className="text-gray-600">View your analytics and statistics</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <h2 className="text-xl font-bold text-gray-800 mb-3">⚙️ Settings</h2>
                <p className="text-gray-600">Manage your account preferences</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <h2 className="text-xl font-bold text-gray-800 mb-3">📞 Support</h2>
                <p className="text-gray-600">Get help and contact our team</p>
            </div>
            </div>
        </div>
        </main>
    );
};

export default HomeContent;
