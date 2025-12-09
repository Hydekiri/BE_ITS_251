'use client';

import { Search, TrendingUp, Calendar, Award, Clock, ChevronRight, Trash2 } from 'lucide-react';
import Home_Header from '../components/Home_Header';
import { useState, useEffect } from 'react';
import CreateAssessmentModal from '../components/CreateAssessmentModal';
import { useRouter } from 'next/navigation';

const AssessmentContent = () => {
    // 1. Khai báo state để quản lý trạng thái đóng/mở Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [assessments, setAssessments] = useState<any[]>([]);
    const [createdAssessments, setCreatedAssessments] = useState<any[]>([]);



    const router = useRouter();

    // Fetch exercises from backend
    const loadExercises = async () => {
        try {
            const res: any = await (await import('../utils/api-client')).ApiClient.get('/exercises');
            if (res && res.data) {
                setAssessments(res.data.exercises || []);
            }
        } catch (err) {
            console.warn('Failed to load exercises', err);
        }
    };

    const loadLocalExercises = () => {
        try {
            const raw = localStorage.getItem('createdExercises');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setCreatedAssessments(parsed);
            }
        } catch (e) {
            console.warn('Failed to load created exercises from localStorage', e);
        }
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            await loadExercises();
            loadLocalExercises();
        })();
        return () => { mounted = false; };
    }, []);

    // Reload data when page becomes visible (e.g., after creating quiz)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadExercises();
                loadLocalExercises();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Delete assessment handler
    const handleDeleteAssessment = async (assessmentId: string) => {
        if (!confirm('Are you sure you want to delete this assessment?')) {
            return;
        }

        try {
            const ApiClient = (await import('../utils/api-client')).ApiClient;
            await ApiClient.delete(`/exercises/${assessmentId}`);

            // Remove from localStorage
            localStorage.removeItem(`savedProgress-${assessmentId}`);
            const createdExercises = JSON.parse(localStorage.getItem('createdExercises') || '[]');
            const filtered = createdExercises.filter((ex: any) => ex.id !== assessmentId);
            localStorage.setItem('createdExercises', JSON.stringify(filtered));

            // Reload data
            await loadExercises();
            loadLocalExercises();

            alert('Assessment deleted successfully!');
        } catch (error) {
            console.error('Failed to delete assessment:', error);
            alert('Failed to delete assessment. Please try again.');
        }
    };

    // Filter assessments by status
    // In-progress: has saved progress in localStorage
    // New: no saved progress yet
    const inProgressAssessments = assessments.filter((assessment: any) => {
        const savedProgress = localStorage.getItem(`savedProgress-${assessment.id}`);
        return savedProgress !== null;
    });

    const newAssessments = assessments.filter((assessment: any) => {
        const savedProgress = localStorage.getItem(`savedProgress-${assessment.id}`);
        return savedProgress === null;
    });

    return (
        <div className="min-h-screen bg-gray-50 relative"> {/* Thêm relative nếu cần */}
            <Home_Header />

            {/* Hero Section with gradient */}
            <div className="bg-linear-to-r from-[#2AA8D8] to-[#235697] border-2 px-6 py-8 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Assessment Overview</h1>
                            <p className="text-white/80">Practicing Today Now!</p>
                        </div>
                        <div className="flex gap-3">
                            {/* 2. Gắn sự kiện mở Modal vào nút này */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-white text-[#235697] rounded-lg font-semibold hover:bg-gray-100 hover:text-[#235697] transition shadow-sm"
                            >
                                + New Assessment
                            </button>

                            <button className="px-4 py-2 bg-white text-[#235697] rounded-lg font-semibold hover:bg-[#235697] hover:text-white transition">
                                Today
                            </button>
                            <button className="px-6 py-2 bg-white text-[#235697] rounded-lg font-semibold hover:bg-[#235697] hover:text-white transition">
                                View All Assessment
                            </button>
                        </div>
                    </div>

                    {/* Analytics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#235697] backdrop-blur-sm rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-sm">Completion Rate</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">+18%</div>
                            <div className="w-full bg-white rounded-full h-2">
                                <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '18%' }}></div>
                            </div>
                        </div>

                        <div className="bg-[#235697] backdrop-blur-sm rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-5 h-5" />
                                <span className="text-sm">Completion Rate</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">94%</div>
                            <div className="w-full bg-white rounded-full h-2">
                                <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '94%' }}></div>
                            </div>
                        </div>

                        <div className="bg-[#235697] backdrop-blur-sm rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-5 h-5" />
                                <span className="text-sm">Average Score</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">8.4/10.0</div>
                            <div className="w-full bg-white rounded-full h-2">
                                <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '84%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="bg-white rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-5 h-5 text-[#235697]" />
                                <span className="font-semibold text-gray-800">Todays Assessment</span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Clinical Kidney Quiz 1</span>
                                    <span className="text-cyan-600 font-semibold">In 3.2</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Clinical Kidney Quiz 2</span>
                                    <span className="text-gray-400">Not yet Schedule</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Clinical Kidney Quiz 3</span>
                                    <span className="text-gray-400">Not yet Schedule</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Clinical Kidney Quiz 4</span>
                                    <span className="text-gray-400">Not yet Schedule</span>
                                </div>
                            </div>
                            <button className="w-full mt-4 bg-[#235697] text-white py-2 rounded-lg font-semibold hover:bg-[#1d4577] transition">
                                View Full Assessment
                            </button>
                        </div>

                        <div className="bg-white rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-5 h-5 text-[#235697]" />
                                <span className="font-semibold text-gray-800">Recent Activity</span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between text-[#235697] ">
                                    <span className="text-gray-600">Completed Nov 28 8.5</span>
                                    <span className="font-semibold">Nov 28 8.5</span>
                                </div>
                                <div className="flex justify-between text-[#235697] ">
                                    <span className="text-gray-600">Completed Nov 28 8.5</span>
                                    <span className="font-semibold">Nov 28 8.5</span>
                                </div>
                                <div className="flex justify-between text-[#235697] ">
                                    <span className="text-gray-600">Assessment scheduled</span>
                                    <span className="font-semibold">Nov 27 7.0</span>
                                </div>
                                <div className="flex justify-between text-[#235697] ">
                                    <span className="text-gray-600">Sign Up New In Progress</span>
                                    <span className="font-semibold">Nov 25 6.5</span>
                                </div>
                            </div>
                            <button className="w-full mt-4 bg-[#235697] text-white py-2 rounded-lg font-semibold hover:bg-[#1d4577] transition">
                                View Activity
                            </button>
                        </div>

                        <div className="bg-white rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="w-5 h-5 text-[#235697]" />
                                <span className="font-semibold text-gray-800">Performance</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-[#235697] ">
                                    <span className="text-gray-600">Average Score</span>
                                    <span className="font-semibold">8.4/10.0</span>
                                </div>
                                <div className="flex justify-between text-[#235697] ">
                                    <span className="text-gray-600">Completion Date</span>
                                    <span className="text-blue-600 font-semibold">95%</span>
                                </div>
                                <div className="flex justify-between text-[#235697] ">
                                    <span className="text-gray-600">Assessment Growth</span>
                                    <span className="text-green-600 font-semibold">+18%</span>
                                </div>
                                <div className="flex justify-between text-[#235697] ">
                                    <span className="text-gray-600">Assessment In Process</span>
                                    <span className="text-red-500 font-semibold">-12%</span>
                                </div>
                            </div>
                            <button className="w-full mt-4 bg-[#235697] text-white py-2 rounded-lg font-semibold hover:bg-[#1d4577] transition">
                                View Analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Continue Assessment Section - Only paused quizzes */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Continue Assessment</h2>
                            <p className="text-gray-600">Resume your paused assessments and complete them.</p>
                        </div>
                        <button className="text-[#235697] font-semibold hover:underline flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {inProgressAssessments.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                            <p className="text-gray-500">No paused assessments. Start a new one!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {inProgressAssessments.map((assessment: any) => (
                                <div key={assessment.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                                    <div className="bg-linear-to-br from-blue-100 to-cyan-50 p-6 flex items-center justify-center h-48">
                                        <div className="text-center">
                                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                                                <svg className="w-12 h-12 text-[#235697]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                                </svg>
                                            </div>
                                            <div className="text-sm text-gray-600 mb-1">{assessment.id} • {assessment.difficultyLevel || ''}</div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-gray-800 mb-2">{assessment.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{assessment.description}</p>
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Progress</span>
                                                <span className="font-semibold text-[#235697]">{assessment.progressPercentage ?? 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-[#235697] h-2 rounded-full" style={{ width: `${assessment.progressPercentage ?? 0}%` }}></div>
                                            </div>
                                        </div>
                                        <button onClick={() => router.push(`/assessment/question?mode=resume&exerciseId=${assessment.id}`)} className="w-full bg-[#235697] text-white py-2 rounded-lg font-semibold hover:bg-[#1d4577] transition flex items-center justify-center gap-2">
                                            Resume <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Your Assessment Section - New quizzes not started yet */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Your Assessment</h2>
                            <p className="text-gray-600">Start new assessments created from AI or topics.</p>
                        </div>
                        <button className="text-[#235697] font-semibold hover:underline flex items-center gap-1">
                            View All Assessment <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-6 flex gap-3 flex-wrap">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235697]"
                            />
                        </div>
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235697]">
                            <option>Level</option>
                        </select>
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235697]">
                            <option>Recently</option>
                        </select>
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235697]">
                            <option>Occupation</option>
                        </select>
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235697]">
                            <option>Sort by</option>
                        </select>
                    </div>

                    {/* Assessment Cards */}
                    <div className="space-y-4">
                        {[...newAssessments, ...createdAssessments].map((assessment, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6 flex gap-6 hover:shadow-lg transition">
                                <div className="w-48 h-40 bg-linear-to-br from-blue-100 to-cyan-50 rounded-lg shrink-0 flex items-center justify-center">
                                    <svg className="w-24 h-24 text-[#235697]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        <span className="px-3 py-1 bg-blue-100 text-[#235697] text-xs rounded-full font-semibold">{assessment.category}</span>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">{assessment.difficulty}</span>
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">{assessment.level}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{assessment.title}</h3>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">{assessment.subtitle}</p>
                                    <p className="text-sm text-gray-600 mb-3">{assessment.description}</p>
                                    <div className="text-sm text-gray-500">
                                        <span>{assessment.author}</span>
                                        <span className="mx-2">•</span>
                                        <span>{assessment.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => { if (assessment.id) { router.push(`/assessment/question?mode=resume&exerciseId=${assessment.id}`); } else { alert("This assessment is not available yet."); } }} className="px-6 py-2 bg-[#2AA8D8] text-white rounded-lg font-semibold hover:bg-[#2597c4] transition whitespace-nowrap h-fit">
                                        Start Now
                                    </button>
                                    {assessment.id && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteAssessment(assessment.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete assessment">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Render Modal ở cuối cùng để nó nổi lên trên tất cả */}
            <CreateAssessmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

        </div>
    );
};

export default AssessmentContent;



