"use client";

import { useInteraction } from "@/hooks/useInteraction";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Clock, CheckCircle2, ShieldCheck, User, MessageSquare } from "lucide-react";
import Card from "@/components/ui/Card";

export default function ProfileQnATab() {
    const { user } = useAuth();
    const { messages, loading } = useInteraction(user);
    const { currentColors } = useTheme();

    // Q&A 페이지만 보여줌 (피드백 제외)
    const filtered = messages.filter(m => m.type === 'qna');

    return (
        <Card className="p-0 overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
                {/* 좌측 사이드바 (정보 섹션) */}
                <div className="lg:col-span-3 bg-gray-50/50 p-6 border-r border-gray-100 space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Message History</h3>
                        <p className="text-[10px] text-gray-400">나의 문의 및 답변 내역</p>
                    </div>

                    <div className="space-y-4">
                        <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-black text-white shadow-md">
                            <HelpCircle size={16} />
                            나의 질문 (Q&A)
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <div
                            className="p-4 rounded-2xl border space-y-2"
                            style={{
                                backgroundColor: `${currentColors.main}10`,
                                borderColor: `${currentColors.main}30`
                            }}
                        >
                            <div className="flex items-center gap-2" style={{ color: currentColors.main }}>
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-bold uppercase">Private & Secure</span>
                            </div>
                            <p
                                className="text-[9px] leading-relaxed font-medium"
                                style={{ color: currentColors.shades?.[60] || currentColors.main }}
                            >
                                질문 내용은 본인과 관리자만 확인할 수 있는 비공개 1:1 상담입니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 우측 콘텐츠 (리스트 전용) */}
                <div className="lg:col-span-9 flex flex-col h-full bg-white">
                    <div className="flex-1 p-6 overflow-y-auto max-h-[500px] custom-scrollbar space-y-6">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-gray-300 text-xs italic">불러오는 중...</div>
                            ) : filtered.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20">
                                    <div className="p-4 rounded-full bg-gray-50 text-gray-200">
                                        <MessageSquare size={40} />
                                    </div>
                                    <p className="text-gray-300 text-xs font-medium">문의 내역이 없습니다.</p>
                                </div>
                            ) : (
                                filtered.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        {/* 질문 */}
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                                <User size={16} />
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-bold text-gray-700">나의 질문</span>
                                                    <span className="text-[9px] text-gray-300">
                                                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : "방금 전"}
                                                    </span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-gray-50 text-sm text-gray-600 leading-relaxed border border-gray-100">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 관리자 답변 */}
                                        {msg.answer && (
                                            <div className="flex gap-4 pl-12">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg"
                                                    style={{ backgroundColor: currentColors.main }}
                                                >
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-bold uppercase tracking-tighter" style={{ color: currentColors.main }}>Official Answer</span>
                                                        <span className="text-[9px] text-gray-300">
                                                            {msg.answeredAt?.toDate ? msg.answeredAt.toDate().toLocaleString() : "방금 전"}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="p-4 rounded-2xl text-sm leading-relaxed border font-medium"
                                                        style={{
                                                            backgroundColor: `${currentColors.main}10`,
                                                            color: currentColors.shades?.[90] || currentColors.main,
                                                            borderColor: `${currentColors.main}20`
                                                        }}
                                                    >
                                                        {msg.answer}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!msg.answer && (
                                            <div className="flex items-center gap-2 pl-16 text-[10px] text-gray-300 italic">
                                                <Clock size={12} />
                                                답변을 기다리고 있습니다...
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 하단 안내 섹션 (입력 불가) */}
                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
                        <p className="text-xs text-gray-400 font-medium">새로운 질문은 우측 하단의 <span className="text-black font-bold">소통 게시판(FAB)</span>을 이용해 주세요.</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
