'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2, XCircle, Home, RotateCcw, Award, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import Image from 'next/image';

export default function QuizResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<any>(null);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('quizResult');
        if (stored) {
            const data = JSON.parse(stored);
            setResult(data);
            // Expand all questions by default
            if (data.details) {
                setExpandedIds(data.details.map((_: any, index: number) => index));
            }
        } else {
            router.push('/assessment');
        }
    }, [router]);

    const toggleExpand = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    if (!result) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const { score, total, percentage, details, title } = result;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
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

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#2AA8D8] to-[#235697] text-white pt-10 pb-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                        <Award className="w-4 h-4 text-yellow-300" /> Assessment Completed
                    </div>
                    <h1 className="text-4xl font-bold mb-2">
                        {percentage >= 70 ? 'Excellent Job!' : 'Keep Practicing!'}
                    </h1>
                    <p className="text-white/90">You scored {percentage}% on {title}.</p>
                </div>
            </div>

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 -mt-16 relative z-10 pb-12">

                {/* Score Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 grid grid-cols-2 md:grid-cols-3 gap-6 text-center divide-x divide-gray-100">
                    <div>
                        <span className={`text-4xl font-bold ${percentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                            {percentage}%
                        </span>
                        <p className="text-sm text-gray-500">Total Score</p>
                    </div>
                    <div>
                        <span className="text-4xl font-bold text-[#235697]">{score}/{total}</span>
                        <p className="text-sm text-gray-500">Correct Answers</p>
                    </div>
                    <div className="border-r-0">
                        <span className="text-4xl font-bold text-purple-600">{total}</span>
                        <p className="text-sm text-gray-500">Total Questions</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center">
                    <button
                        onClick={() => router.push('/assessment')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#235697] text-white rounded-xl font-bold hover:bg-[#1d4577] transition shadow-md"
                    >
                        <RotateCcw className="w-5 h-5" /> New Assessment
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                    >
                        <Home className="w-5 h-5" /> Back to Home
                    </button>
                </div>

                {/* Detailed Review List */}
                {details.map((item: any, index: number) => {
                    const isExpanded = expandedIds.includes(index);
                    const isCorrect = item.isCorrect;

                    return (
                        <div key={index} className={`bg-white rounded-xl shadow-sm border-l-4 overflow-hidden mb-6 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            
                            {/* Header click to expand */}
                            <div onClick={() => toggleExpand(index)} className="p-6 cursor-pointer hover:bg-gray-50 transition">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 shrink-0">
                                        {isCorrect ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 text-lg mb-2">
                                            Question {index + 1}: <span className="font-normal">{item.question}</span>
                                        </h3>
                                        
                                        {/* Summary text (Optional - can remove if you show full options below) */}
                                        <div className="flex gap-4 text-sm mt-2">
                                            <span className={isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                                Your Answer: {item.userAnswerText || 'Skipped'}
                                            </span>
                                            {!isCorrect && (
                                                <span className="text-green-600 font-semibold">
                                                    Correct Answer: {item.correctAnswerText}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button className="text-gray-400">
                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* EXPANDED CONTENT - PHẦN QUAN TRỌNG CẦN SỬA */}
                            {isExpanded && (
                                <div className="px-6 pb-6 pt-0">
                                    <div className="border-t border-gray-100 my-4"></div>

                                    {/* Render Options List */}
                                    <div className="space-y-3 mb-6">
                                        {item.options && item.options.map((opt: any) => {
                                            // Logic tô màu
                                            const isSelected = opt.id === item.userAnswerId;
                                            const isTheCorrectAnswer = opt.id === item.correctAnswerId;
                                            
                                            let styleClass = "border-gray-200 bg-white"; // Mặc định
                                            let icon = null;

                                            if (isSelected && isTheCorrectAnswer) {
                                                // Người dùng chọn ĐÚNG -> Màu xanh
                                                styleClass = "border-green-500 bg-green-50 text-green-800";
                                                icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                                            } else if (isSelected && !isTheCorrectAnswer) {
                                                // Người dùng chọn SAI -> Màu đỏ
                                                styleClass = "border-red-500 bg-red-50 text-red-800";
                                                icon = <XCircle className="w-5 h-5 text-red-600" />;
                                            } else if (!isSelected && isTheCorrectAnswer) {
                                                // Đáp án đúng mà người dùng KHÔNG chọn -> Viền xanh (để nhắc nhở)
                                                styleClass = "border-green-500 bg-white text-green-700";
                                                icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                                            }

                                            return (
                                                <div key={opt.id} className={`p-4 rounded-lg border flex justify-between items-center ${styleClass}`}>
                                                    <div className="flex gap-3">
                                                        <span className="font-bold">{opt.id}.</span>
                                                        <span>{opt.text}</span>
                                                    </div>
                                                    {icon}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Explanation */}
                                    {item.explanation && (
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                            <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold text-sm uppercase">
                                                <AlertCircle className="w-4 h-4" /> Explanation
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed">{item.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </main>
        </div>
    );
}
