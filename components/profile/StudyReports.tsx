"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Card from "@/components/ui/Card";
import { Award, TrendingUp, Calendar, Zap, X, ChevronRight, Trophy } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface Report {
    id: string;
    type: "weekly" | "monthly";
    period: string;
    totalProblems: number;
    streak: number;
    grade: "S" | "A" | "B" | "C";
    date: string;
    summary: string;
}

function ReportDetailModal({ report, onClose }: { report: Report; onClose: () => void }) {
    const { currentColors } = useTheme();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* 헤더 */}
                <div
                    className="p-8 text-white relative overflow-hidden"
                    style={{ backgroundColor: currentColors.main }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            {report.type === 'monthly' ? <Calendar size={24} /> : <Zap size={24} />}
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest opacity-80">{report.type} Performance</div>
                            <h3 className="text-2xl font-black">{report.period}</h3>
                        </div>
                    </div>
                </div>

                {/* 컨텐츠 */}
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase mb-1">Final Grade</div>
                            <div className="text-5xl font-black text-brand italic">{report.grade}</div>
                        </div>
                        <div className="text-right">
                            <Trophy size={48} className="text-yellow-400 inline-block" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2 text-gray-400">
                                <TrendingUp size={14} />
                                <span className="text-[10px] font-bold uppercase">Total Solved</span>
                            </div>
                            <div className="text-xl font-black text-gray-800">{report.totalProblems}문제</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2 text-gray-400">
                                <Award size={14} />
                                <span className="text-[10px] font-bold uppercase">Achievement</span>
                            </div>
                            <div className="text-xl font-black text-gray-800">
                                {report.grade === 'S' ? 'Legend' : report.grade === 'A' ? 'Master' : report.grade === 'B' ? 'Running' : 'Starter'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-light/10 p-6 rounded-3xl border border-brand-light/30">
                        <h4 className="text-sm font-bold text-brand mb-2 flex items-center gap-2">
                            Feedback
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            {report.summary}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors shadow-lg"
                    >
                        확인 완료
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function StudyReports({ weeklyData, monthlyData }: { weeklyData: Record<string, number>, monthlyData: Record<string, number> }) {
    const { currentColors } = useTheme();
    const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>("all");

    // 실제 데이터를 Report 형식으로 변환
    const allReports: Report[] = [];

    // 월간 데이터 변환
    Object.entries(monthlyData).forEach(([key, val]) => {
        allReports.push({
            id: `m-${key}`,
            type: "monthly",
            period: `${key.split('-')[1]}월 성과 리포트`,
            totalProblems: val,
            streak: 0,
            grade: val > 100 ? "S" : val > 50 ? "A" : val > 20 ? "B" : "C",
            date: key,
            summary: val > 50
                ? `${key.split('-')[1]}월 한 달 동안 정말 꾸준히 달리셨네요! 50문제 이상 해결하신 열정에 박수를 보냅니다. 다음 달에도 이 기세를 이어가봐요!`
                : `${key.split('-')[1]}월에는 조금 더 힘을 내볼까요? 매일 1문제씩만 더 풀어도 다음 달엔 A등급을 노릴 수 있어요. Ghosty가 응원할게요!`
        });
    });

    // 주간 데이터 변환
    Object.entries(weeklyData).forEach(([key, val]) => {
        allReports.push({
            id: `w-${key}`,
            type: "weekly",
            period: `${key} 주간 리포트`,
            totalProblems: val,
            streak: 0,
            grade: val > 30 ? "S" : val > 15 ? "A" : val > 5 ? "B" : "C",
            date: key,
            summary: val > 20
                ? "이번 주 학습량이 어마어마하시네요! 거의 공부 전문가 수준인데요? 이대로만 하면 금방 목표 티어에 도달할 거예요."
                : "이번 주는 조금 쉬어가는 주였나요? 괜찮아요. 남은 주간에 조금 더 집중해서 유종의 미를 거둬봐요!"
        });
    });

    // 사용 가능한 월 목록 추출 (주간 데이터 기준)
    const availableMonths = Array.from(new Set(
        allReports
            .filter(r => r.type === 'weekly')
            .map(r => r.date.substring(0, 7))
    )).sort((a, b) => b.localeCompare(a));

    // 필터링 및 정렬
    const filteredReports = allReports
        .filter(r => {
            if (r.type !== activeTab) return false;
            if (activeTab === 'weekly' && selectedMonth !== 'all') {
                return r.date.startsWith(selectedMonth);
            }
            return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    if (allReports.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 px-2 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">성장 리포트</h2>
                    <p className="text-sm font-medium text-gray-400 mt-1">나의 학습 발자취를 확인하세요</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-2xl">
                        <button
                            onClick={() => { setActiveTab("weekly"); setSelectedMonth("all"); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'weekly' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            style={activeTab === 'weekly' ? { color: currentColors.main } : {}}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => { setActiveTab("monthly"); setSelectedMonth("all"); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'monthly' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            style={activeTab === 'monthly' ? { color: currentColors.main } : {}}
                        >
                            Monthly
                        </button>
                    </div>

                    {/* 주간 탭일 때의 월별 필터 */}
                    <AnimatePresence>
                        {activeTab === 'weekly' && availableMonths.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex gap-2 overflow-x-auto pb-2 max-w-full no-scrollbar"
                            >
                                <button
                                    onClick={() => setSelectedMonth("all")}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap transition-all border ${selectedMonth === 'all'
                                        ? 'bg-black text-white border-black shadow-md'
                                        : 'bg-white text-gray-400 border-gray-100'
                                        }`}
                                >
                                    전체보기
                                </button>
                                {availableMonths.map(month => (
                                    <button
                                        key={month}
                                        onClick={() => setSelectedMonth(month)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap transition-all border ${selectedMonth === month
                                            ? 'text-white border-transparent shadow-md'
                                            : 'bg-white text-gray-400 border-gray-100'
                                            }`}
                                        style={selectedMonth === month ? { backgroundColor: currentColors.main } : {}}
                                    >
                                        {month.split('-')[1]}월
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {filteredReports.map((report, idx) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="p-8 border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative bg-white ring-1 ring-gray-100">
                                {/* 배경 장식 */}
                                <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-light/10 rounded-full blur-3xl group-hover:bg-brand-light/20 transition-colors" />

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`p-3 rounded-2xl shadow-sm ${report.type === 'monthly' ? 'bg-indigo-50 text-indigo-500' : 'bg-brand-light text-white'}`}
                                            style={report.type === 'weekly' ? { backgroundColor: currentColors.main } : {}}
                                        >
                                            {report.type === 'monthly' ? <Calendar size={20} /> : <Zap size={20} />}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none mb-1">{report.type} Feed</div>
                                            <h3 className="text-lg font-bold text-gray-800 tracking-tight group-hover:text-brand transition-colors" style={{ '--hover-color': currentColors.main } as any}>
                                                {report.period}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="text-4xl font-bold italic tracking-tighter drop-shadow-sm group-hover:scale-110 transition-transform" style={{ color: currentColors.main }}>
                                        {report.grade}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 relative z-10">
                                    <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100/50 group-hover:bg-white group-hover:border-brand-light/30 transition-all">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp size={14} className="text-brand opacity-60" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Problems Solved</span>
                                        </div>
                                        <div className="text-2xl font-black text-gray-800 tracking-tighter">{report.totalProblems}<span className="text-xs ml-1 font-bold opacity-30">개</span></div>
                                    </div>
                                    <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100/50 group-hover:bg-white group-hover:border-brand-light/30 transition-all">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Award size={14} className="text-orange-400 opacity-60" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Achievement</span>
                                        </div>
                                        <div className="text-sm font-black text-gray-700">{report.grade === 'S' ? 'PERFECT' : report.grade === 'A' ? 'GREAT' : 'RUNNING'}</div>
                                    </div>
                                </div>

                                <motion.button
                                    onClick={() => setSelectedReport(report)}
                                    whileHover={{ backgroundColor: currentColors.main, color: "#ffffff", borderColor: currentColors.main }}
                                    className="w-full mt-8 py-4 rounded-2xl bg-gray-50 text-xs font-bold text-gray-400 border border-gray-100 transition-all flex items-center justify-center gap-2 group/btn"
                                >
                                    자세히 보기 <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </motion.button>
                            </Card>
                        </motion.div>
                    ))}

                    {filteredReports.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="text-4xl mb-4 opacity-20">📭</div>
                            <p className="text-gray-400 font-bold">해당 기간의 리포트가 아직 생성되지 않았습니다.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {selectedReport && (
                    <ReportDetailModal
                        report={selectedReport}
                        onClose={() => setSelectedReport(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
