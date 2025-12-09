'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2,
    PauseCircle, PlayCircle, Save // Import thêm các icon cần thiết
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiClient } from '../../utils/api-client';

// 1. Cấu hình số câu mỗi trang
const QUESTIONS_PER_PAGE = 3;

const DEFAULT_QUIZ = {
    title: "Clinical Reasoning: Cardiovascular Case Study 1",
    duration: 15 * 60,
    questions: Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        text: `Question ${i + 1}: A 65-year-old male presents with symptoms related to cardiovascular issues. Based on the clinical data provided in Case ${i + 1}, what is the best course of action?`,
        options: [
            { id: 'A', text: `Option A for Question ${i + 1}`, isCorrect: true },
            { id: 'B', text: `Option B for Question ${i + 1}`, isCorrect: false },
            { id: 'C', text: `Option C for Question ${i + 1}`, isCorrect: false },
            { id: 'D', text: `Option D for Question ${i + 1}`, isCorrect: false },
        ]
    }))
};

export default function QuizTakingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');

    // --- STATE ---
    const [quizData, setQuizData] = useState<any>(DEFAULT_QUIZ);
    const [currentPage, setCurrentPage] = useState(0);
    const [timeLeft, setTimeLeft] = useState(DEFAULT_QUIZ.duration);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [flagged, setFlagged] = useState<number[]>([]);
    const [exerciseId, setExerciseId] = useState<string | null>(null);
    
    // State quản lý trạng thái Pause Modal
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (mode === 'generated') {
            const stored = localStorage.getItem('generatedQuiz');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    console.log('Loading generated quiz:', parsed);

                    if (parsed.exerciseId) {
                        setExerciseId(parsed.exerciseId);
                    }

                    const transformedQuestions = parsed.questions.map((q: any, i: number) => ({
                        id: i + 1,
                        text: q.text,
                        explanation: q.explanation,
                        options: q.options.map((opt: any) => ({
                            id: opt.id,
                            text: opt.text,
                            isCorrect: opt.isCorrect === true || String(opt.isCorrect).toLowerCase() === 'true'
                        }))
                    }));

                    setQuizData({
                        title: parsed.title,
                        duration: (parsed.timeLimit || 15) * 60,
                        questions: transformedQuestions
                    });
                    setTimeLeft((parsed.timeLimit || 15) * 60);

                } catch (e) {
                    console.error("Failed to load generated quiz", e);
                }
            }
        }
    }, [mode]);

    useEffect(() => {
        if (mode === 'resume') {
            const exerciseIdParam = searchParams.get('exerciseId');
            if (!exerciseIdParam) return;

            setExerciseId(exerciseIdParam);

            (async () => {
                try {
                    const res: any = await ApiClient.get(`/exercises/${exerciseIdParam}`);
                    if (res && res.data) {
                        const data = res.data;
                        const transformedQuestions = (data.questions || []).map((q: any, i: number) => ({
                            id: i + 1,
                            text: q.questionText || q.question,
                            explanation: q.explanation,
                            options: q.options ? Object.keys(q.options).map((k) => ({
                                id: k,
                                text: q.options[k],
                                isCorrect: q.correctAnswer === k
                            })) : []
                        }));

                        setQuizData({ title: data.title, duration: data.timeLimit || 15 * 60, questions: transformedQuestions });
                        
                        const saved = localStorage.getItem(`savedProgress-${exerciseIdParam}`);
                        if (saved) {
                            try {
                                const parsed = JSON.parse(saved);
                                if (parsed.answers) {
                                    const map: Record<number, string> = {};
                                    parsed.answers.forEach((a: any) => {
                                        map[a.questionId] = a.selectedOption || a.answerText || '';
                                    });
                                    setAnswers(map);
                                }
                                if (parsed.timeLeft) setTimeLeft(parsed.timeLeft);
                            } catch (e) {
                                // ignore
                            }
                        }
                    }
                } catch (err) {
                    console.warn('Failed to load exercise for resume', err);
                }
            })();
        }
    }, [mode, searchParams]);

    // --- LOGIC TÍNH TOÁN PHÂN TRANG ---
    const totalQuestions = quizData.questions.length;
    const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
    const startIndex = currentPage * QUESTIONS_PER_PAGE;
    const currentQuestions = quizData.questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);

    // --- HANDLERS ---
    const handleSubmit = useCallback(() => {
        let correctCount = 0;
        const details = quizData.questions.map((q: any) => {
            const userAnswerId = answers[q.id];
            const correctOption = q.options.find((opt: any) => opt.isCorrect);
            const userOption = q.options.find((opt: any) => opt.id === userAnswerId);
            const isCorrect = correctOption?.id === userAnswerId;

            if (isCorrect) correctCount++;
            if (!correctOption) {
                console.error(`Câu hỏi ID ${q.id} không tìm thấy đáp án đúng (thiếu isCorrect: true)`);
            }

            return {
                questionId: q.id,
                question: q.text,
                options: q.options,
                userAnswerId,
                userAnswerText: userOption?.text,
                correctAnswerId: correctOption?.id,
                correctAnswerText: correctOption?.text,
                isCorrect,
                correctOption,
                explanation: q.explanation || null
            };
        });

        const resultData = {
            title: quizData.title,
            score: correctCount,
            total: totalQuestions,
            percentage: Math.round((correctCount / totalQuestions) * 100),
            details
        };

        if (exerciseId) {
            localStorage.removeItem(`savedProgress-${exerciseId}`);
        }
        localStorage.removeItem('savedProgress-local');

        localStorage.setItem('quizResult', JSON.stringify(resultData));
        router.push('/assessment/result');
    }, [answers, quizData, totalQuestions, router, exerciseId]);

    // Timer logic: Chỉ chạy khi KHÔNG bị Pause
    useEffect(() => {
        if (timeLeft <= 0 || isPaused) return; // Dừng timer nếu isPaused = true
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isPaused]); // Thêm isPaused vào dependency array

    useEffect(() => {
        if (timeLeft === 0) handleSubmit();
    }, [timeLeft, handleSubmit]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSelectOption = (qId: number, optId: string) => {
        setAnswers(prev => ({ ...prev, [qId]: optId }));
    };

    const toggleFlag = (qId: number) => {
        setFlagged(prev => prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 0) setCurrentPage(prev => prev - 1);
    };

    const jumpToQuestion = (qIndex: number) => {
        const targetPage = Math.floor(qIndex / QUESTIONS_PER_PAGE);
        setCurrentPage(targetPage);
    };

    // --- NEW: Hàm xử lý Save & Exit ---
    const handleSaveAndExit = async () => {
        const answersArray = Object.keys(answers).map((qid) => ({ 
            questionId: Number(qid), 
            selectedOption: answers[Number(qid)], 
            answerText: '' 
        }));

        if (exerciseId) {
            localStorage.setItem(`savedProgress-${exerciseId}`, JSON.stringify({ answers: answersArray, timeLeft }));
            try {
                await ApiClient.post(`/exercises/${exerciseId}/save-progress`, { answers: answersArray, timeLeft });
            } catch (err) {
                console.warn('Failed to persist progress to backend', err);
            }
        } else {
            localStorage.setItem('savedProgress-local', JSON.stringify({ answers: answersArray, timeLeft }));
        }
        
        router.push('/assessment');
    };

    const progressPercentage = ((Object.keys(answers).length) / totalQuestions) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* --- PAUSE MODAL --- */}
            {isPaused && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 text-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
                        
                        <div className="w-16 h-16 bg-[#235697] text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <PauseCircle className="w-8 h-8" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Paused</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                            Time is stopped. Do you want to continue answering or save your progress and exit?
                        </p>
                        
                        <div className="space-y-3">
                            {/* Resume Button */}
                            <button 
                                onClick={() => setIsPaused(false)}
                                className="w-full py-3 bg-[#235697] text-white rounded-xl font-bold text-base hover:bg-gradient-to-r from-[#1BA7D9] to-[#235697] transition flex items-center justify-center gap-2 shadow-lg"
                            >
                                <PlayCircle className="w-5 h-5" /> Resume Quiz
                            </button>

                            {/* Save & Exit Button */}
                            <button 
                                type="button"
                                onClick={handleSaveAndExit}
                                className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-base hover:bg-[#1BA7D9] hover:text-white hover:border-gray-300 transition flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" /> Save & Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative">
                            <Image src="/ITS_LOGO1.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="font-bold text-[#235697] text-lg hidden sm:block">ITS Assessment</span>
                    </div>

                    <div className="hidden md:block font-semibold text-gray-700 truncate max-w-md">
                        {quizData.title}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-blue-50 text-[#235697]'}`}>
                            <Clock className="w-5 h-5" />
                            {formatTime(timeLeft)}
                        </div>
                        
                        {/* Nút Pause kích hoạt Modal */}
                        <button 
                            onClick={() => setIsPaused(true)} 
                            className="bg-[#1BA7D9] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#FAA300] transition shadow-md"
                        >
                            Pause
                        </button>
                        
                        <button onClick={handleSubmit} className="bg-[#235697] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#04910C] transition shadow-md">
                            Submit
                        </button>
                    </div>
                </div>
                <div className="w-full bg-gray-200 h-1.5">
                    <div className="bg-green-500 h-1.5 transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </header>

            {/* --- MAIN CONTENT (Phần câu hỏi và sidebar - giữ nguyên logic cũ) --- */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex gap-6">
                
                {/* LEFT: Sidebar */}
                <aside className="hidden lg:block w-72 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700">Question Palette</h3>
                            <span className="text-xs text-gray-500">{Object.keys(answers).length}/{totalQuestions} Answered</span>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            {quizData.questions.map((q: any, idx: number) => {
                                const isAnswered = answers[q.id] !== undefined;
                                const isFlagged = flagged.includes(q.id);
                                const isOnCurrentPage = Math.floor(idx / QUESTIONS_PER_PAGE) === currentPage;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => jumpToQuestion(idx)}
                                        className={`
                                            h-10 w-10 rounded-lg flex items-center justify-center text-sm font-semibold border transition relative
                                            ${isOnCurrentPage ? 'ring-2 ring-[#235697] border-[#235697] z-10' : ''}
                                            ${isAnswered ? 'bg-[#235697] text-white border-[#235697]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                                        `}
                                    >
                                        {idx + 1}
                                        {isFlagged && (
                                            <div className="absolute -top-1 -right-1">
                                                <div className="w-3 h-3 bg-[#1BA7D9] rounded-full border border-white"></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Legend */}
                        <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="w-3 h-3 bg-[#235697] rounded"></div> Answered
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div> Not Answered
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="w-3 h-3 bg-[#1BA7D9] border border-white rounded-full ring-1 ring-gray-200"></div> Flagged
                            </div>
                        </div>
                    </div>
                </aside>

                {/* CENTER: Questions Area */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="space-y-6">
                        {currentQuestions.map((question: any, index: number) => {
                            const globalIndex = startIndex + index + 1;
                            return (
                                <div key={question.id} className="bg-white rounded-xl shadow-sm border flex flex-col">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 rounded-t-xl">
                                        <div>
                                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Question {globalIndex}</span>
                                            <h2 className="text-lg font-bold text-gray-800 mt-2 leading-relaxed">
                                                {question.text}
                                            </h2>
                                        </div>
                                        <button
                                            onClick={() => toggleFlag(question.id)}
                                            className={`p-2 rounded-lg transition ${flagged.includes(question.id) ? 'bg-blue-50 text-[#1BA7D9]' : 'text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            <Flag className={`w-5 h-5 ${flagged.includes(question.id) ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-3">
                                        {question.options.map((option: any) => {
                                            const isSelected = answers[question.id] === option.id;
                                            return (
                                                <label
                                                    key={option.id}
                                                    className={`
                                                        flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all group
                                                        ${isSelected ? 'border-[#235697] bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'}
                                                    `}
                                                >
                                                    <div className="relative">
                                                        <input
                                                            type="radio"
                                                            name={`question-${question.id}`}
                                                            className="peer sr-only"
                                                            checked={isSelected}
                                                            onChange={() => handleSelectOption(question.id, option.id)}
                                                        />
                                                        <div className={`
                                                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                                            ${isSelected ? 'border-[#235697] bg-[#235697]' : 'border-gray-300 group-hover:border-blue-300'}
                                                        `}>
                                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                        </div>
                                                    </div>
                                                    <span className={`text-base ${isSelected ? 'font-semibold text-[#235697]' : 'text-gray-700'}`}>
                                                        {option.text}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Pagination */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center sticky bottom-4 z-40">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 0}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="w-5 h-5" /> Previous Page
                        </button>

                        <span className="text-sm font-medium text-gray-500">
                            Page {currentPage + 1} of {totalPages}
                        </span>

                        {currentPage === totalPages - 1 ? (
                            <button
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md"
                            >
                                Finish Quiz <CheckCircle2 className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleNextPage}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#235697] text-white rounded-lg font-semibold hover:bg-[#1d4577] transition shadow-md"
                            >
                                Next Page <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}