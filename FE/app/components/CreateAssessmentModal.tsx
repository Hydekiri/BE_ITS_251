'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, BookOpen, Clock, Layers, FileQuestion, Zap, Upload, FileText, AlertCircle } from 'lucide-react';
import { ApiClient } from '../utils/api-client';

interface AssessmentForm {
    title: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    questionCount: number;
    timeLimit: number; // minutes
    language: string;
}

interface CreateAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateAssessmentModal = ({ isOpen, onClose }: CreateAssessmentModalProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [sourceType, setSourceType] = useState<'topic' | 'file'>('topic');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Lưu ý: selectedTopic không cần thiết nếu bạn dùng formData.topic
    // const [selectedTopic, setSelectedTopic] = useState<string>('Cardiology');

    const [formData, setFormData] = useState<AssessmentForm>({
        title: '',
        topic: 'Cardiology',
        difficulty: 'Medium',
        questionCount: 10,
        timeLimit: 15,
        language: 'Vietnamese'
    });

    const difficultyLevels: AssessmentForm['difficulty'][] = ['Easy', 'Medium', 'Hard'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            
            // Common fields
            data.append('title', formData.title);
            data.append('difficulty', formData.difficulty);
            data.append('questionCount', formData.questionCount.toString());
            data.append('timeLimit', formData.timeLimit.toString());
            data.append('language', formData.language);

            if (sourceType === 'file') {
                // Case 1: Manual File Upload
                if (selectedFile) {
                    console.log('Creating Assessment from File:', selectedFile.name);
                    data.append('file', selectedFile);
                }
            } else {
                // Case 2: Topic Selection
                // Logic đặc biệt: Nếu chọn topic 'Cardiology', tự động load file PDF mẫu từ thư mục public
                if (formData.topic === 'Cardiology') {
                    console.log('Auto-loading Cardiology PDF from public folder...');
                    try {
                        // Fetch file từ thư mục public (đường dẫn tương đối với root server)
                        // Đảm bảo file cardiologyFile.pdf nằm trong thư mục public của dự án Next.js
                        const response = await fetch('/cardiologyFile.pdf');
                        
                        if (!response.ok) throw new Error('File not found in public folder');
                        
                        const blob = await response.blob();
                        const autoFile = new File([blob], 'cardiologyFile.pdf', { type: 'application/pdf' });
                        data.append('file', autoFile);
                    } catch (err) {
                        console.error("Failed to load auto-file:", err);
                        alert("Không tìm thấy file mẫu 'cardiologyFile.pdf' trong thư mục public! Vui lòng kiểm tra lại.");
                        setIsLoading(false);
                        return;
                    }
                } else {
                    // Các topic khác gửi dưới dạng string bình thường
                    console.log('Creating Assessment from Topic String:', formData.topic);
                    data.append('file', formData.topic);
                }
            }

            const response: any = await ApiClient.postFormData('/ai/generate-quiz', data);

            if (response.success && response.data) {
                localStorage.setItem('generatedQuiz', JSON.stringify(response.data));
                router.push('/assessment/question?mode=generated');
            }

            onClose();
        } catch (error) {
            console.error('Failed to create assessment:', error);
            alert('Failed to generate quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // ... (Phần render UI giữ nguyên như cũ)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="bg-linear-to-r from-[#2AA8D8] to-[#235697] p-6 flex justify-between items-center text-white sticky top-0 z-10">
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
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    {/* Source Toggle */}
                    <div className="bg-gray-50 p-1 rounded-lg flex gap-1 border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setSourceType('topic')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-semibold transition flex items-center justify-center gap-2 ${sourceType === 'topic' ? 'bg-white text-[#235697] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <BookOpen className="w-4 h-4" /> From Topic
                        </button>
                        <button
                            type="button"
                            onClick={() => setSourceType('file')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-semibold transition flex items-center justify-center gap-2 ${sourceType === 'file' ? 'bg-white text-[#235697] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Upload className="w-4 h-4" /> From Knowledge File
                        </button>
                    </div>

                    {/* 2. Topic OR File Upload */}
                    <div>
                        {sourceType === 'topic' ? (
                            <>
                                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                    <BookOpen className="w-4 h-4 text-[#235697]" /> Topic / Module
                                </label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#235697] focus:outline-none bg-white"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                >
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Respiratory">Respiratory System</option>
                                    <option value="Renal">Renal & Urinary</option>
                                    <option value="Neurology">Neurology</option>
                                </select>
                            </>
                        ) : (
                            <>
                                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                    <FileText className="w-4 h-4 text-[#235697]" /> Upload Knowledge (PDF/Txt)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative group">
                                    <input
                                        type="file"
                                        accept=".pdf,.txt,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center">
                                            <FileText className="w-8 h-8 text-[#235697] mb-2" />
                                            <span className="font-semibold text-gray-800">{selectedFile.name}</span>
                                            <span className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-[#235697] transition" />
                                            <span className="font-medium text-gray-600">Click to upload or drag & drop</span>
                                            <span className="text-xs text-gray-400 mt-1">PDF, TXT, DOC up to 10MB</span>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
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
                                    onClick={() => setFormData({ ...formData, difficulty: level })}
                                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${formData.difficulty === level
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
                                    onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
                                />
                                <span className="text-sm font-bold w-12 text-center border rounded py-1">{formData.questionCount}</span>
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
                                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* 4.1 Language Selection */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-[#235697]" /> Language
                        </label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#235697] focus:outline-none bg-white"
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        >
                            <option value="Vietnamese">Vietnamese (Tiếng Việt)</option>
                            <option value="English">English</option>
                        </select>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || (sourceType === 'file' && !selectedFile)}
                            className={`flex-1 px-4 py-2 bg-[#235697] text-white rounded-lg font-semibold hover:bg-[#1d4577] transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${(isLoading || (sourceType === 'file' && !selectedFile)) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                sourceType === 'file' ? 'Generate Quiz' : 'Create Quiz'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAssessmentModal;