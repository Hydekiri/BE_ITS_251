'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 1. Import useRouter
import { X, BookOpen, Clock, Layers, FileQuestion, Zap } from 'lucide-react';

interface AssessmentForm {
    title: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    questionCount: number;
    timeLimit: number; // minutes
}

interface CreateAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateAssessmentModal = ({ isOpen, onClose }: CreateAssessmentModalProps) => {
  // 2. Khởi tạo router
    const router = useRouter();

    const [formData, setFormData] = useState<AssessmentForm>({
        title: '',
        topic: 'Cardiology',
        difficulty: 'Medium',
        questionCount: 10,
        timeLimit: 15,
    });

    const difficultyLevels: AssessmentForm['difficulty'][] = ['Easy', 'Medium', 'Hard'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Log dữ liệu form (hoặc gửi API tại đây)
        console.log('Creating Assessment:', formData);

        // 3. Chuyển hướng sang trang Quiz Builder (Giả sử bạn đã tạo file app/assessment/create/page.tsx)
        router.push('/assessment/question');

        // Đóng Modal
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-linear-to-r from-[#2AA8D8] to-[#235697] p-6 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-lg">
                    <FileQuestion className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">New Assessment</h3>
                    <p className="text-white/80 text-sm">Create a custom learning quiz</p>
                </div>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
                <X className="w-6 h-6" />
            </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                
                {/* 1. Assessment Title */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Assessment Title</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Clinical Reasoning - Cardio Case 1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#235697] focus:outline-none"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                    />
                </div>

                {/* 2. Topic & Category */}
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-[#235697]" /> Topic / Module
                    </label>
                    <select 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#235697] focus:outline-none bg-white"
                        value={formData.topic}
                        onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Respiratory">Respiratory System</option>
                        <option value="Renal">Renal & Urinary</option>
                        <option value="Neurology">Neurology</option>
                    </select>
                </div>

                {/* 3. Difficulty Selector */}
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Zap className="w-4 h-4 text-[#235697]" /> Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {difficultyLevels.map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => setFormData({...formData, difficulty: level})}
                                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                                    formData.difficulty === level 
                                    ? 'bg-[#235697]/10 border-[#235697] text-[#235697] ring-1 ring-[#235697]' 
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Settings Row (Questions & Time) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                            <Layers className="w-4 h-4 text-[#235697]" /> Questions
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="range" min="5" max="50" step="5"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#235697]"
                                value={formData.questionCount}
                                onChange={(e) => setFormData({...formData, questionCount: parseInt(e.target.value)})}
                            />
                            <span className="text-sm font-bold w-8 text-right">{formData.questionCount}</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                            <Clock className="w-4 h-4 text-[#235697]" /> Time (Min)
                        </label>
                        <input 
                            type="number" 
                            min="5" max="120"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#235697] focus:outline-none"
                            value={formData.timeLimit}
                            onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 px-4 py-2 bg-[#235697] text-white rounded-lg font-semibold hover:bg-[#1d4577] transition shadow-md hover:shadow-lg"
                    >
                        Create Quiz
                    </button>
                </div>
            </form>
        </div>
    </div>
    );
};

export default CreateAssessmentModal;