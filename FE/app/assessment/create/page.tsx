'use client';

import { useState } from 'react';
import { 
    ArrowLeft, Save, Plus, Trash2, GripVertical, Image as ImageIcon, 
    CheckCircle2, AlertCircle, Settings, Clock, MoreVertical 
} from 'lucide-react';
import Home_Header from '@/app/components/Home_Header'; 

interface Question {
    id: number;
    text: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options: { id: string; text: string; isCorrect: boolean }[];
}

export default function QuizBuilderPage() {
    const [quizTitle, setQuizTitle] = useState('Clinical Reasoning - Cardio Case 1');
    const [questions, setQuestions] = useState<Question[]>([
        {
        id: 1,
        text: 'What is the primary medication used for initial treatment of...',
        type: 'multiple-choice',
        options: [
            { id: 'a', text: 'Aspirin', isCorrect: true },
            { id: 'b', text: 'Ibuprofen', isCorrect: false },
            { id: 'c', text: 'Paracetamol', isCorrect: false },
            { id: 'd', text: 'None of the above', isCorrect: false },
        ]
        }
    ]);

    // Hàm thêm câu hỏi mới
    const addQuestion = () => {
        const newId = questions.length + 1;
        setQuestions([
        ...questions, 
        {
            id: newId,
            text: '',
            type: 'multiple-choice',
            options: [
            { id: 'opt1', text: 'Option 1', isCorrect: false },
            { id: 'opt2', text: 'Option 2', isCorrect: false },
            ]
        }
        ]);
    };

    // Hàm xóa câu hỏi
    const deleteQuestion = (id: number) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    // Hàm thay đổi text câu hỏi
    const handleQuestionChange = (id: number, newText: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text: newText } : q));
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
        <Home_Header />

        {/* Top Bar Navigation */}
        <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <input 
                type="text" 
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="text-lg font-bold text-gray-800 border-none focus:ring-0 px-2 hover:bg-gray-50 rounded"
                />
                <span className="bg-blue-100 text-[#235697] text-xs px-2 py-1 rounded-full font-medium">Draft</span>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 mr-4">
                    <Clock className="w-4 h-4" />
                    <span>Saved 2m ago</span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                    <Settings className="w-4 h-4" /> Settings
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-[#235697] text-white rounded-lg font-semibold hover:bg-[#1d4577] shadow-md transition">
                    <Save className="w-4 h-4" /> Publish Quiz
                </button>
            </div>
            </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 py-8 flex gap-8">
            
            {/* Left Sidebar: Question Navigator */}
            <div className="hidden lg:block w-64 shrink-0">
                <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
                    <h3 className="font-semibold text-gray-700 mb-4">Questions ({questions.length})</h3>
                    <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                        {questions.map((q, idx) => (
                            <button key={q.id} className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 transition group flex items-start gap-3">
                                <span className="bg-gray-100 text-gray-500 w-6 h-6 flex items-center justify-center rounded text-xs font-bold group-hover:bg-[#235697] group-hover:text-white transition">
                                    {idx + 1}
                                </span>
                                <span className="text-sm text-gray-600 truncate flex-1">
                                    {q.text || 'New Question'}
                                </span>
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={addQuestion}
                        className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-[#235697] hover:text-[#235697] transition flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Question
                    </button>
                </div>
            </div>

            {/* Center: Quiz Editor */}
            <div className="flex-1 space-y-6">
                {questions.map((q, index) => (
                    <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                        {/* Question Header */}
                        <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                                <span className="font-bold text-gray-700">Question {index + 1}</span>
                                <select 
                                    className="text-sm border-gray-300 rounded-md py-1 pl-2 pr-8 focus:ring-[#235697] focus:border-[#235697]"
                                    defaultValue={q.type}
                                >
                                    <option value="multiple-choice">Multiple Choice</option>
                                    <option value="true-false">True / False</option>
                                    <option value="short-answer">Short Answer</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => deleteQuestion(q.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Question Body */}
                        <div className="p-6 space-y-6">
                            {/* Question Text Input */}
                            <div>
                                <textarea 
                                    placeholder="Enter your question here..."
                                    className="w-full text-lg font-medium border-none focus:ring-0 p-0 resize-none placeholder-gray-300 text-gray-800"
                                    rows={2}
                                    value={q.text}
                                    onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                                />
                            </div>

                            {/* Answer Options */}
                            <div className="space-y-3">
                                {q.options.map((opt) => (
                                    <div key={opt.id} className="flex items-center gap-3 group/opt">
                                        <div className="relative">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition ${opt.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                                {opt.isCorrect && <div className="w-3 h-3 bg-green-500 rounded-full" />}
                                            </div>
                                        </div>
                                        <input 
                                            type="text" 
                                            defaultValue={opt.text}
                                            className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition ${opt.isCorrect ? 'border-green-200 bg-green-50/30 focus:ring-green-500' : 'border-gray-200 focus:ring-[#235697]'}`}
                                        />
                                        <div className="opacity-0 group-hover/opt:opacity-100 flex gap-2">
                                            {!opt.isCorrect && (
                                                <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Mark as correct">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                <button className="text-[#235697] font-semibold text-sm hover:underline mt-2 flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> Add Option
                                </button>
                            </div>

                            {/* Question Footer (Explanation) */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 text-blue-500">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Answer Explanation (Optional)</h4>
                                        <textarea 
                                            placeholder="Explain why the correct answer is correct..."
                                            className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add More */}
                <div 
                    onClick={addQuestion}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-[#235697] hover:bg-blue-50/50 transition group"
                >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 group-hover:text-[#235697] transition">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-lg">Add New Question</span>
                </div>
            </div>

        </main>
        </div>
    );
}