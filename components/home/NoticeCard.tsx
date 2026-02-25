"use client";

import { useNotice } from "@/hooks/useNotice";
import { useState, useMemo } from "react";
import NoticeHistoryModal from "./NoticeHistoryModal";
import { Bell, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Card from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function NoticeCard() {
  const { noticeList } = useNotice();
  const { currentColors } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const displayNotices = useMemo(() => {
    if (!noticeList) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return noticeList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [noticeList, currentPage]);

  const totalPages = Math.ceil((noticeList?.length || 0) / ITEMS_PER_PAGE);

  if (!noticeList || noticeList.length === 0) return null;

  const isNew = (date: any) => {
    if (!(date instanceof Date)) return false;
    const diff = Date.now() - date.getTime();
    return diff < 48 * 60 * 60 * 1000; // 48시간 이내
  };

  return (
    <Card className="p-6 md:p-8 bg-white border border-gray-100 shadow-xl relative overflow-hidden group">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: currentColors.light, color: currentColors.main }}
            >
              <Bell size={20} />
            </div>
            <div>
              <span
                className="block text-[10px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: currentColors.main }}
              >
                Notice Board
              </span>
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">
                📢 공지사항
              </h3>
            </div>
          </div>

          {/* 페이지네이션 컨트롤 */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
                style={{ color: currentColors.main }}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-bold text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
                style={{ color: currentColors.main }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {displayNotices.map((n) => {
                const isExpanded = expandedId === n.id;
                const noticeDate = n.date instanceof Date ? n.date : null;
                const isRecentlyAdded = isNew(noticeDate);

                return (
                  <div key={n.id} className="border-b border-gray-50 last:border-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : n.id)}
                      className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50/50 rounded-xl transition-all text-left"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="flex flex-col min-w-[70px]">
                          <span className="text-[10px] font-bold text-gray-400">
                            {noticeDate ? noticeDate.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : 'NEW'}
                          </span>
                          {isRecentlyAdded && (
                            <div
                              className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-tighter"
                              style={{ color: currentColors.main }}
                            >
                              <Sparkles size={8} fill="currentColor" />
                              NEW
                            </div>
                          )}
                        </div>
                        <span className={`text-sm md:text-base font-semibold truncate ${isExpanded ? '' : 'text-gray-700'}`} style={isExpanded ? { color: currentColors.main } : {}}>
                          {n.title || (n.content?.substring(0, 40) + '...')}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2 text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50/30 rounded-lg mb-2">
                            {n.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}
