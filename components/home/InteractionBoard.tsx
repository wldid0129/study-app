"use client";

import { useState, useRef, useEffect } from "react";
import { useInteraction, InteractionMessage } from "@/hooks/useInteraction";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import Card from "@/components/ui/Card";
import {
    MessageSquare,
    Send,
    X,
    HelpCircle,
    MessageCircle,
    Clock,
    User,
    ShieldCheck,
    CheckCircle2,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InteractionBoard() {
    const { user } = useAuth();
    const { messages, addMessage, markAllAsRead, loading } = useInteraction(user);
    const { currentColors } = useTheme();

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'feedback' | 'qna'>('qna');
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 안 읽은 메시지 필터 (답변이 달린 것 중 읽지 않은 것)
    const unreadMessages = messages.filter(m => m.isRead === false);

    // 게시판 열릴 때 읽음 처리
    useEffect(() => {
        if (isOpen && unreadMessages.length > 0) {
            markAllAsRead();
        }
    }, [isOpen, unreadMessages.length, markAllAsRead]);

    // 자동 스크롤
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [activeTab, messages]);

    const filteredMessages = messages.filter(m => m.type === activeTab);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !user || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addMessage(activeTab, content, user);
            setContent("");
        } catch (e) {
            alert("전송 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const boardContent = (
        <div className="flex flex-col h-full bg-white md:rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            {/* 탭 헤더 */}
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                    <button
                        onClick={() => setActiveTab('qna')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'qna'
                            ? 'bg-black text-white'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <HelpCircle size={14} />
                        Q&A
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'feedback'
                            ? 'bg-black text-white'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <MessageCircle size={14} />
                        FEEDBACK
                    </button>
                </div>

                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                >
                    <X size={20} />
                </button>
            </div>

            {/* 정보 알림창 */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                {activeTab === 'feedback' ? (
                    <>
                        <ShieldCheck size={14} className="text-indigo-500" />
                        <p className="text-[10px] text-gray-500 font-medium">
                            피드백은 <span className="text-indigo-600 font-bold">익명</span>으로 관리자에게만 전달됩니다.
                        </p>
                    </>
                ) : (
                    <>
                        <User size={14} className="text-indigo-500" />
                        <p className="text-[10px] text-gray-500 font-medium">
                            질문은 <span className="text-indigo-600 font-bold">1:1 서비스</span>로 운영되며 작성자 본인만 확인 가능합니다.
                        </p>
                    </>
                )}
            </div>

            {/* 메시지 리스트 */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-6 bg-white custom-scrollbar scroll-smooth"
            >
                <AnimatePresence mode="popLayout">
                    {filteredMessages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3"
                        >
                            <div className="p-4 rounded-full bg-gray-50 text-gray-300">
                                {activeTab === 'feedback' ? <MessageSquare size={32} /> : <HelpCircle size={32} />}
                            </div>
                            <p className="text-gray-400 text-xs font-medium leading-relaxed">
                                {activeTab === 'feedback'
                                    ? "여러분의 소중한 의견을 기다리고 있습니다.\n앱을 더 좋게 만들 아이디어를 남겨주세요!"
                                    : "궁금한 점이 있다면 언제든 물어보세요.\n나만의 질문 히스토리를 확인하실 수 있습니다."}
                            </p>
                        </motion.div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-3"
                            >
                                {/* 사용자 질문 */}
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-[9px] text-gray-300 uppercase tracking-tighter">
                                            {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "방금 전"}
                                        </span>
                                        <span className="text-[10px] font-black text-gray-400">
                                            ME
                                        </span>
                                    </div>
                                    <div className="max-w-[85%] px-4 py-3 bg-black text-white rounded-2xl rounded-tr-none text-sm leading-relaxed shadow-lg">
                                        {msg.content}
                                    </div>
                                </div>

                                {/* 관리자 답변 (있는 경우) */}
                                {msg.answer && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-start"
                                    >
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                                <CheckCircle2 size={10} />
                                            </div>
                                            <span className="text-[10px] font-black text-indigo-600">
                                                ADMIN ANSWER
                                            </span>
                                        </div>
                                        <div className="max-w-[85%] px-4 py-3 bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-2xl rounded-tl-none text-sm leading-relaxed">
                                            {msg.answer}
                                        </div>
                                    </motion.div>
                                )}

                                {/* 답변 대기 중 표시 */}
                                {activeTab === 'qna' && !msg.answer && (
                                    <div className="flex items-center gap-1.5 px-1">
                                        <Clock size={10} className="text-gray-300" />
                                        <span className="text-[10px] text-gray-300 italic font-medium">
                                            답변을 기다리는 중입니다...
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* 입력창 */}
            <div className="p-5 bg-white border-t border-gray-50">
                <form onSubmit={handleSubmit} className="relative group">
                    <input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={!user || isSubmitting}
                        placeholder={user ? `${activeTab === 'feedback' ? '익명 피드백' : '비공개 질문'}을 입력하세요...` : "로그인이 필요합니다."}
                        className="w-full pl-4 pr-14 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm leading-relaxed group-hover:bg-gray-100 placeholder:text-gray-300"
                    />
                    <button
                        type="submit"
                        disabled={!content.trim() || !user || isSubmitting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl transition hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 shadow-md shadow-indigo-100"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="fixed bottom-10 right-10 z-50">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100 }}
                        className="absolute bottom-24 right-0 w-[calc(100vw-48px)] max-w-[400px] h-[600px]"
                    >
                        {boardContent}
                    </motion.div>
                ) : (
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                    >
                        {/* 알림 배지 (안 읽은 답변이 있을 때만 표시) */}
                        {unreadMessages.length > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-lg">
                                {unreadMessages.length > 9 ? '9+' : unreadMessages.length}
                            </div>
                        )}
                        <button
                            onClick={() => setIsOpen(true)}
                            className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-indigo-300/40 transition-shadow relative overflow-hidden group border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity" />
                            <div className="relative">
                                <MessageSquare size={30} />
                                <Sparkles size={14} className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 열려있을 때 닫기 플로팅 버튼 */}
            {isOpen && (
                <motion.button
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="w-20 h-20 rounded-full bg-white text-gray-500 flex items-center justify-center shadow-2xl border border-gray-100 mt-4"
                >
                    <X size={30} />
                </motion.button>
            )}
        </div>
    );
}
