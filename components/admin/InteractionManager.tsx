"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { Trash2, MessageCircle, HelpCircle, User, Send, CheckCircle2 } from "lucide-react";

interface Props {
    messages: any[];
    onDelete: (id: string) => void;
    onSaveAnswer: (id: string, answer: string) => void;
}

export default function InteractionManager({ messages, onDelete, onSaveAnswer }: Props) {
    const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});

    const handleAnswerChange = (id: string, val: string) => {
        setAnswerInputs(prev => ({ ...prev, [id]: val }));
    };

    const submitAnswer = (id: string) => {
        const ans = answerInputs[id];
        if (!ans?.trim()) return;
        onSaveAnswer(id, ans);
        setAnswerInputs(prev => ({ ...prev, [id]: "" }));
    };

    return (
        <div className="space-y-8">
            <Card className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                        INTERACTION MODERATION ({messages.length})
                    </div>
                    <div className="text-xs text-gray-400">
                        피드백(익명)과 Q&A(1:1 질문)를 관리하고 답변을 남깁니다.
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b text-gray-400 text-[10px] uppercase tracking-widest">
                                <th className="pb-4 font-bold">유형</th>
                                <th className="pb-4 font-bold">작성자 정보</th>
                                <th className="pb-4 font-bold">내용 및 답변</th>
                                <th className="pb-4 font-bold">작성일</th>
                                <th className="pb-4 font-bold text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {messages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-gray-400 text-sm italic">
                                        등록된 소통 메시지가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                messages.map((msg) => (
                                    <tr key={msg.id} className="hover:bg-gray-50/50 transition align-top">
                                        <td className="py-6">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${msg.type === 'feedback'
                                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {msg.type}
                                            </span>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    {/* 익명 피드백이라도 어드민은 실제 정보 확인 가능 */}
                                                    <div className="text-xs font-bold text-gray-800">
                                                        {msg.realName || "Unknown"}
                                                    </div>
                                                    <div className="text-[9px] text-gray-400">
                                                        {msg.realEmail || "No Email"}
                                                    </div>
                                                    {msg.type === 'feedback' && (
                                                        <span className="text-[8px] font-bold text-indigo-400 bg-indigo-50 px-1 rounded">
                                                            ANONYMOUS IN UI
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 max-w-[400px]">
                                            <div className="space-y-4">
                                                <div className="text-sm text-gray-700 font-medium leading-relaxed bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                    {msg.content}
                                                </div>

                                                {/* 답변 내용이 이미 있는 경우 */}
                                                {msg.answer && (
                                                    <div className="flex gap-2 items-start bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                                        <CheckCircle2 size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                                                        <div>
                                                            <div className="text-[10px] font-black text-indigo-600 mb-1 uppercase">답변 완료</div>
                                                            <div className="text-xs text-indigo-900 leading-relaxed font-medium">{msg.answer}</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Q&A 유형인 경우 답변 입력창 */}
                                                {msg.type === 'qna' && (
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={answerInputs[msg.id] || ""}
                                                            onChange={(e) => handleAnswerChange(msg.id, e.target.value)}
                                                            placeholder={msg.answer ? "답변 수정하기..." : "새 답변 작성..."}
                                                            className="flex-1 px-3 py-2 bg-gray-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-indigo-400 outline-none"
                                                        />
                                                        <button
                                                            onClick={() => submitAnswer(msg.id)}
                                                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                                        >
                                                            <Send size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-6 whitespace-nowrap">
                                            <div className="text-[10px] text-gray-400">
                                                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString() : "방금 전"}
                                            </div>
                                        </td>
                                        <td className="py-6 text-right">
                                            <button
                                                onClick={() => onDelete(msg.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="삭제"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
