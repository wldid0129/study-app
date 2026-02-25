import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Card from "@/components/ui/Card";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    notices: any[];
}

export default function NoticeHistoryModal({ isOpen, onClose, notices }: Props) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800">📜 공지사항 히스토리</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto p-6 space-y-6">
                        {notices.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                기록된 공지가 없습니다.
                            </div>
                        ) : (
                            notices.map((notice, index) => (
                                <div key={notice.id} className="relative pl-6 border-l-2 border-indigo-100">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white" />
                                    <div className="text-xs text-gray-400 mb-1 font-mono">
                                        {notice.createdAt?.toDate
                                            ? notice.createdAt.toDate().toLocaleString("ko-KR")
                                            : "날짜 정보 없음"}
                                        {index === 0 && <span className="ml-2 text-indigo-600 font-bold">[최신]</span>}
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                                        {notice.content}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-gray-50 text-center">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition text-sm font-medium"
                        >
                            닫기
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
