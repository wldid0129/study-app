"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { ExternalLink, Newspaper, Bot, Trophy, Briefcase, Sparkles, TrendingUp, Zap, FileText, Search, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickLink {
    title: string;
    url: string;
    desc: string;
    icon: React.ReactNode;
    gradient: string;
    tag?: string;
}

const LEFT_LINKS: QuickLink[] = [
    { title: "인공지능신문", url: "https://www.aitimes.kr", desc: "산업동향 & 정책", icon: <Sparkles size={18} />, gradient: "from-indigo-500 to-purple-400", tag: "INFO" },
    { title: "허깅페이스 트렌드", url: "https://huggingface.co/papers/trending", desc: "인기 AI 모델", icon: <TrendingUp size={18} />, gradient: "from-pink-500 to-rose-400", tag: "HOT" },
    { title: "HF Space", url: "https://huggingface.co/spaces", desc: "최신 AI 데모", icon: <TrendingUp size={18} />, gradient: "from-purple-500 to-pink-400", tag: "DEMO" },
    { title: "AI 타임스", url: "https://www.aitimes.com", desc: "실시간 AI 뉴스", icon: <Newspaper size={18} />, gradient: "from-blue-500 to-cyan-400", tag: "NEWS" },
    { title: "긱뉴스", url: "https://news.hada.io", desc: "테크 오피니언", icon: <Zap size={18} />, gradient: "from-emerald-500 to-teal-400", tag: "TECH" },
];

const RIGHT_CONTESTS: QuickLink[] = [
    { title: "링커리어", url: "https://linkareer.com", desc: "대외활동 · 인턴", icon: <GraduationCap size={18} />, gradient: "from-rose-500 to-pink-400", tag: "공모전" },
    { title: "Dacon", url: "https://dacon.io", desc: "AI 대회 & 교육", icon: <Trophy size={18} />, gradient: "from-indigo-500 to-blue-400", tag: "대회" },
    { title: "Kaggle", url: "https://www.kaggle.com/competitions", desc: "컴페티션 허브", icon: <Trophy size={18} />, gradient: "from-sky-500 to-blue-400", tag: "ML" },

];

const RIGHT_JOBS: QuickLink[] = [
    { title: "자소설닷컴", url: "https://jasoseol.com", desc: "스마트 자기소개서", icon: <FileText size={18} />, gradient: "from-orange-500 to-yellow-400", tag: "취업" },
    { title: "잡코리아", url: "https://www.jobkorea.co.kr", desc: "대표 채용 플랫폼", icon: <Search size={18} />, gradient: "from-blue-500 to-indigo-400", tag: "채용" },
    { title: "사람인", url: "https://www.saramin.co.kr", desc: "No.1 채용 포털", icon: <Search size={18} />, gradient: "from-blue-600 to-sky-400", tag: "채용" },
    { title: "원티드", url: "https://www.wanted.co.kr", desc: "AI 매칭 이직", icon: <Briefcase size={18} />, gradient: "from-violet-500 to-purple-400", tag: "채용" },
];

export default function QuickLinksHub({ side, mobile }: { side: "left" | "right", mobile?: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const links = side === "left" ? LEFT_LINKS : (mobile ? [...RIGHT_CONTESTS, ...RIGHT_JOBS] : []);
    const title = side === "left" ? "AI & News" : "Career Hub";

    const renderLink = (link: QuickLink, i: number, isMobile?: boolean) => (
        <motion.a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`group rounded-3xl bg-white/80 backdrop-blur-md border border-gray-100/60 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:bg-white hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 cursor-pointer overflow-hidden relative block ${isMobile ? 'w-[160px] flex-shrink-0 p-3' : 'w-full p-4 mb-3 last:mb-0'}`}
        >
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-[0.05] blur-2xl transition-opacity duration-500`} />
            <div className={`flex items-center relative z-10 ${isMobile ? 'flex-col text-center gap-2' : 'gap-3.5'}`}>
                <div className={`p-2 rounded-[1.25rem] bg-gradient-to-br ${link.gradient} text-white shadow-[0_4px_10px_rgba(0,0,0,0.1)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 flex-shrink-0 ${isMobile ? 'p-2' : 'p-2.5'}`}>
                    {link.icon}
                </div>
                <div className="min-w-0 flex-1 w-full">
                    <div className={`flex items-center justify-between mb-0.5 ${isMobile ? 'justify-center' : ''}`}>
                        <span className={`font-extrabold text-gray-800 group-hover:text-brand transition-colors truncate leading-none ${isMobile ? 'text-[11px]' : 'text-[13px]'}`}>
                            {link.title}
                        </span>
                        {!isMobile && <ExternalLink size={10} className="text-gray-200 group-hover:text-brand/50 transition-colors flex-shrink-0" />}
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-gray-400 font-medium group-hover:text-gray-500 transition-colors truncate mb-0.5 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
                            {link.desc}
                        </span>
                        <span className={`font-black uppercase tracking-widest text-gray-300 group-hover:text-gray-400 transition-colors ${isMobile ? 'text-[7px]' : 'text-[8px]'}`}>
                            {link.tag}
                        </span>
                    </div>
                </div>
            </div>
        </motion.a>
    );

    if (mobile) {
        return (
            <div className="w-full">
                <div className="flex items-center gap-2 mb-3 px-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${side === 'left' ? 'bg-blue-400' : 'bg-purple-400'} animate-pulse`} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1 mask-linear-r">
                    {(side === "left" ? LEFT_LINKS : [...RIGHT_CONTESTS, ...RIGHT_JOBS]).map((link, i) => renderLink(link, i, true))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-[200px] flex flex-col items-center">
            {/* 메인 타이틀 */}
            <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm w-full justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${side === 'left' ? 'bg-blue-400' : 'bg-purple-400'} animate-pulse`} />
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">
                    {title}
                </span>
            </div>

            {side === "left" ? (
                <div className="w-full">
                    {LEFT_LINKS.map((link, i) => renderLink(link, i))}
                </div>
            ) : (
                <div className="w-full">
                    {/* Contest Section */}
                    <div className="mb-4">
                        <div className="px-3 py-1 mb-2 flex items-center gap-1.5">
                            <Trophy size={10} className="text-indigo-400" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Contest</span>
                        </div>
                        {RIGHT_CONTESTS.slice(0, isExpanded ? RIGHT_CONTESTS.length : 2).map((link, i) => renderLink(link, i))}
                    </div>

                    {/* Employment Section */}
                    <div>
                        <div className="px-3 py-1 mb-2 flex items-center gap-1.5 border-t border-gray-50 pt-3">
                            <Briefcase size={10} className="text-violet-400" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Employment</span>
                        </div>
                        <AnimatePresence>
                            {RIGHT_JOBS.slice(0, isExpanded ? RIGHT_JOBS.length : 3).map((link, i) => renderLink(link, i))}
                        </AnimatePresence>
                    </div>

                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-400 hover:bg-white hover:text-brand hover:border-brand/30 hover:shadow-sm transition-all duration-300 group"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
                                접기
                            </>
                        ) : (
                            <>
                                <ChevronDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
                                더보기
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* 하단 장식선 */}
            {!isExpanded && side === "right" && (
                <div className="w-10 h-1 bg-gray-200/50 rounded-full mt-4" />
            )}
        </div>
    );
}
