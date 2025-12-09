'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2, XCircle, Home, RotateCcw, Award
} from 'lucide-react';
import Image from 'next/image';

export default function QuizResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('quizResult');
        if (stored) {
            setResult(JSON.parse(stored));
        } else {
            // Redirect back if no result found
            router.push('/assessment');
        }
    }, [router]);

    if (!result) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const { score, total, percentage, details, title } = result;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* --- HEADER --- */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative">
                            <Image src="/ITS_LOGO1.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="font-bold text-[#235697] text-lg hidden sm:block">ITS Assessment Result</span>
                    </div>
                    <div className="hidden md:block font-semibold text-gray-700 truncate max-w-md">
                        {title}
                    </div>
                    <button onClick={() => router.push('/')} className="text-gray-500 hover:text-[#235697]">
                        <Home className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">

                {/* SCORE CARD */}
                <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8 text-center relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-2 ${percentage >= 70 ? 'bg-green-500' : 'bg-red-500'}`}></div>

                    <div className="mb-4 inline-flex items-center justify-center p-4 bg-gray-50 rounded-full">
                        <Award className={`w-12 h-12 ${percentage >= 70 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {percentage >= 70 ? 'Excellent Job!' : 'Keep Practicing!'}
                    </h1>
                    <p className="text-gray-500 mb-6">
                        You scored <span className="font-bold text-gray-900 text-xl">{score}</span> out of <span className="font-bold text-gray-900 text-xl">{total}</span>
                    </p>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => router.push('/assessment')}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#235697] text-white rounded-lg font-semibold hover:bg-[#1d4577] transition shadow-md"
                        >
                            <RotateCcw className="w-4 h-4" /> New Assessment
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                        >
                            <Home className="w-4 h-4" /> Back to Home
                        </button>
                    </div>
                </div>

                {/* DETAILS LIST */}
                <div className="space-y-6">
                    <h2 className="font-bold text-gray-700 text-xl">Detailed Review</h2>
                    {details.map((item: any, index: number) => (
                        <div key={index} className={`bg-white rounded-xl shadow-sm border p-6 border-l-4 ${item.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    {item.isCorrect ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-500" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 mb-3 text-lg">
                                        <span className="text-gray-400 mr-2">Q{index + 1}.</span>
                                        {item.question}
                                    </h3>

                                    <div className="space-y-2">
                                        <div className={`p-3 rounded-lg border ${item.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                            <span className="text-xs font-bold uppercase block mb-1 opacity-70">Your Answer</span>
                                            {item.userAnswerText || <span className="italic text-gray-400">No answer selected</span>}
                                        </div>

                                        {!item.isCorrect && (
                                            <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                                                <span className="text-xs font-bold uppercase block mb-1 opacity-70 text-blue-700">Correct Answer</span>
                                                <span className="text-blue-900">{item.correctAnswerText}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
