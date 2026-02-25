"use client";

import { useInteraction } from "@/hooks/useInteraction";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, HelpCircle, Clock, CheckCircle2, Send, ShieldCheck, User } from "lucide-react";
import Card from "@/components/ui/Card";
import { useState } from "react";

export default function ProfileQnATab() {
    const { user } = useAuth();
    const { messages, addMessage, loading } = useInteraction(user);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeType, setActiveType] = useState<'feedback' | 'qna'>('qna');

    const filtered = messages.filter(m => m.type === activeType);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addMessage(activeType, content, user);
            setContent("");
        } catch (e) {
            alert("전송 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="p-0 overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
                {/* 좌측 사이드바 (필터) */}
                <div className="lg:col-span-3 bg-gray-50/50 p-6 border-r border-gray-100 space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Message History</h3>
                        <p className="text-[10px] text-gray-400">나의 문의 및 피드백 내역</p>
                    </div>

                    <div className="space-y-2">
                        {[
                            { id: 'qna', label: '나의 질문 (Q&A)', icon: HelpCircle },
                            { id: 'feedback', label: '보낸 피드백', icon: MessageSquare },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveType(t.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeType === t.id
                                        ? 'bg-black text-white shadow-md'
                                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                    }`}
                            >
                                <t.icon size={16} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-bold uppercase">Private & Secure</span>
                            </div>
                            <p className="text-[9px] text-indigo-400 leading-relaxed font-medium">
                                {activeType === 'qna'
                                    ? "질문 내용은 본인과 관리자만 확인할 수 있는 비공개 1:1 상담입니다."
                                    : "피드백은 익명으로 전달되어 서비스 품질 개선에만 활용됩니다."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 우측 콘텐츠 (리스트 + 입력) */}
                <div className="lg:col-span-9 flex flex-col h-full bg-white">
                    <div className="flex-1 p-6 overflow-y-auto max-h-[400px] custom-scrollbar space-y-6">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-gray-300 text-xs italic">불러오는 중...</div>
                            ) : filtered.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20">
                                    <div className="p-4 rounded-full bg-gray-50 text-gray-200">
                                        <MessageSquare size={40} />
                                    </div>
                                    <p className="text-gray-300 text-xs font-medium">내역이 없습니다.</p>
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
                                                    <span className="text-[11px] font-bold text-gray-700">나의 {activeType === 'qna' ? '질문' : '의견'}</span>
                                                    <span className="text-[9px] text-gray-300">{msg.createdAt?.toDate?.toLocaleString() || "방금 전"}</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-gray-50 text-sm text-gray-600 leading-relaxed border border-gray-100">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 관리자 답변 */}
                                        {msg.answer && (
                                            <div className="flex gap-4 pl-12">
                                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-tighter">Official Answer</span>
                                                        <span className="text-[9px] text-indigo-300">{msg.answeredAt?.toDate?.toLocaleString() || "방금 전"}</span>
                                                    </div>
                                                    <div className="p-4 rounded-2xl bg-indigo-50 text-sm text-indigo-900 leading-relaxed border border-indigo-100 font-medium">
                                                        {msg.answer}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!msg.answer && activeType === 'qna' && (
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

                    {/* 하단 입력창 */}
                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <input
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={isSubmitting}
                                placeholder={activeType === 'qna' ? "새로운 질문을 입력하세요..." : "소중한 피드백을 남겨주세요..."}
                                className="flex-1 px-5 py-3 rounded-2xl bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={!content.trim() || isSubmitting}
                                className="px-6 py-3 bg-black text-white rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-gray-800 transition shadow-lg disabled:opacity-20"
                            >
                                <Send size={14} />
                                SEND
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Card>
    );
}
