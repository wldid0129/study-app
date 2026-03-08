"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { useAttendance } from "@/hooks/useAttendance";
import { useActivityHeatmap } from "@/hooks/useActivityHeatmap";
import Header from "@/components/ui/Header";
import TierBadge, { getNextTierRequirement, getTier } from "@/components/ui/TierBadge";
import ActivityHeatmap from "@/components/home/ActivityHeatmap";
import Card from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { User, Award, Flame, Sprout, BarChart3, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useMyHistory } from "@/hooks/useMyHistory";
import StudyReports from "@/components/profile/StudyReports";
import ProfileQnATab from "@/components/profile/ProfileQnATab";
import QuickLinksHub from "@/components/home/QuickLinksHub";

export default function ProfileClient() {
    const { user, logout } = useAuth();
    const { userTotals } = useUsers();
    const { currentColors } = useTheme();
    const attendance = useAttendance(user);
    const heatmapData = useActivityHeatmap(user?.uid);
    const history = useMyHistory(user?.uid);

    const [activeTab, setActiveTab] = useState<string>('garden');

    useEffect(() => {
        const saved = localStorage.getItem('profile_active_tab');
        if (saved) setActiveTab(saved);
    }, []);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        localStorage.setItem('profile_active_tab', tab);
    };

    if (!user) return null;

    const totalProblems = userTotals[user.uid] || 0;
    const nextTier = getNextTierRequirement(totalProblems);
    const currentTier = getTier(totalProblems);

    return (
        <div className="bg-[#f4f6f9] min-h-screen pb-20">
            <Header user={user} onLogout={logout} />

            {/* spacer for fixed Header (Mobile: 200px, Desktop: 112px) */}
            <div className="h-[200px] md:h-28" />

            <main className="max-w-4xl mx-auto px-4 py-4 md:py-10">
                {/* ====== 모바일용 퀵 링크 (AI 뉴스 & Career Hub) ====== */}
                <div className="min-[1700px]:hidden space-y-8 mb-8 pb-8 border-b border-gray-100">
                    <QuickLinksHub side="left" mobile />
                    <QuickLinksHub side="right" mobile />
                </div>

                <Link
                    href="/home"
                    className="text-sm text-brand font-bold mb-8 flex items-center gap-2 hover:translate-x-[-4px] transition-transform w-fit"
                >
                    <span>←</span>
                    <span>대시보드로 돌아가기</span>
                </Link>

                {/* 상단 프로필 카드 */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="p-8 md:p-10 mb-10 overflow-hidden relative border-none shadow-xl bg-white">
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="relative">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-lg">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-brand-light/30 flex items-center justify-center text-brand">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-center md:text-left flex-1">
                                <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">
                                    Study Member
                                </div>
                                <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-4">
                                    <h1 className="text-3xl md:text-5xl font-bold text-gray-800 tracking-tight">
                                        {user.displayName || "공부하는 열정인"}
                                    </h1>
                                    <TierBadge count={totalProblems} size="lg" />
                                </div>
                                <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-6">
                                    <p className="text-gray-400 font-medium">{user.email}</p>
                                    {nextTier && (
                                        <div className="hidden md:block w-1 h-1 bg-gray-300 rounded-full" />
                                    )}
                                    {nextTier && (
                                        <p
                                            className="text-xs font-bold"
                                            style={{ color: currentColors.main }}
                                        >
                                            {nextTier.nextLabel}까지 <span style={{ color: currentColors.shades?.[80] }}>{nextTier.remaining}문제</span> 남음
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="px-5 py-2.5 rounded-2xl bg-orange-50/50 border border-orange-100/50 flex items-center gap-2">
                                        <Flame size={18} className="text-orange-500" />
                                        <span className="text-base font-bold text-gray-700">{attendance.streak}일 연속</span>
                                    </div>
                                    <div className="px-5 py-2.5 rounded-2xl bg-blue-50/50 border border-blue-100/50 flex items-center gap-2">
                                        <Award size={18} className="text-blue-500" />
                                        <span className="text-base font-bold text-gray-700">누적 {totalProblems}문제</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 배경 데코레이션 */}
                        <div className="absolute top-1/2 -right-8 -translate-y-1/2 opacity-[0.05] pointer-events-none select-none">
                            <span className="text-[180px] drop-shadow-2xl grayscale blur-[4px]">
                                {currentTier.icon}
                            </span>
                        </div>
                    </Card>
                </motion.div>

                {/* 탭 네비게이션 */}
                <div className="flex gap-1 bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-8 w-fit mx-auto md:mx-0">
                    {[
                        { id: 'garden', label: '활동 정원', icon: Sprout },
                        { id: 'report', label: '리포트', icon: BarChart3 },
                        { id: 'qna', label: 'Q&A', icon: MessageCircle },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                                ? 'shadow-lg text-white'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            style={activeTab === tab.id ? { backgroundColor: currentColors.main } : {}}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 탭 콘텐츠 */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'garden' && (
                            <motion.div
                                key="garden"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="mb-4 text-center md:text-left">
                                    <h2 className="text-xl font-bold text-gray-800 mb-1">코테 공부방</h2>
                                    <p className="text-sm text-gray-400 font-medium tracking-tight">나의 코딩테스트 학습 기록이 꽃으로 피어납니다.</p>
                                </div>
                                <ActivityHeatmap data={heatmapData} limitToCurrentMonth={true} />
                            </motion.div>
                        )}

                        {activeTab === 'report' && (
                            <motion.div
                                key="report"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                            >
                                <StudyReports weeklyData={history.weeklyBreakdown} monthlyData={history.monthlyBreakdown} />
                            </motion.div>
                        )}

                        {activeTab === 'qna' && (
                            <motion.div
                                key="qna"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ProfileQnATab />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ====== PC용 추가 여백 ====== */}
            </main>
        </div>
    );
}
