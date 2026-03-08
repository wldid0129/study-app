"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTheme } from "@/context/ThemeContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import MyHistoryCard from "@/components/home/MyHistoryCard";
import { useMyHistory } from "@/hooks/useMyHistory";

interface CalendarCardProps {
  currentMonth: Date;
  setCurrentMonth: (d: Date) => void;

  activeTab: "total" | "personal" | "history";
  setActiveTab: (
    v: "total" | "personal" | "history"
  ) => void;

  attendanceMap: Record<string, string>;
  totalMap: Record<string, number>;
  participantsMap: Record<string, string[]>;
  userMap: Record<string, string>;
  userCount: number;

  userId?: string;

  onOpenModal: () => void;
}

export default function CalendarCard({
  currentMonth,
  setCurrentMonth,
  activeTab,
  setActiveTab,
  attendanceMap,
  totalMap,
  participantsMap,
  userMap,
  userCount,
  userId,
  onOpenModal,
}: CalendarCardProps) {
  const history = useMyHistory(userId);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const firstDay = new Date(year, month, 1).getDay();

  const { currentColors } = useTheme();

  // click-only / touch popup bound to the tab root
  const [popupInfo, setPopupInfo] = useState<null | { left: number; top: number; participants: string[]; dateKey: string }>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeout = useRef<number | null>(null);

  const getCellColor = (percent: number) => {
    if (percent === 0) return { className: "bg-gray-100 text-gray-600" };
    if (percent < 30) return { style: { backgroundColor: currentColors.shades?.[20] }, className: "text-gray-700" };
    if (percent < 60) return { style: { backgroundColor: currentColors.shades?.[60] }, className: "text-white" };
    return { style: { backgroundColor: currentColors.main }, className: "text-white" };
  };

  const monthKey = `${year}-${month}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  // render click/touch popup inside calendar root so it stays attached to the tab while scrolling
  let popupPortal: null | React.ReactPortal = null;
  if (popupInfo && rootRef.current) {
    popupPortal = createPortal(
      <motion.div
        key={`click-${popupInfo.dateKey}`}
        ref={popupRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.16 }}
        style={{ position: 'absolute', left: `${popupInfo.left}px`, top: `${popupInfo.top}px`, zIndex: 99999 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white p-0 w-[300px] max-w-[92vw] overflow-hidden" style={{ borderRadius: 12, border: `1px solid ${currentColors.shades?.[20] || '#e6f4ea'}`, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${currentColors.shades?.[10] || '#f0f0f0'}` }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: currentColors.shades?.[40] || '#e6fff0', color: currentColors.main }}>📅</div>
              <div className="text-sm font-semibold" style={{ color: (currentColors as any).textPrimary || undefined }}>{popupInfo.dateKey} 참여자</div>
            </div>
            <button onClick={() => setPopupInfo(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="p-3 max-h-48 overflow-auto">
            {popupInfo.participants.length === 0 ? (<div className="text-sm text-gray-500">참여자가 없습니다.</div>) : (
              <ul className="space-y-3">{popupInfo.participants.map((n, idx) => (
                <li key={idx} className="flex items-center gap-3"><div className="w-9 h-9 rounded-full text-white flex items-center justify-center font-medium text-sm" style={{ backgroundColor: currentColors.main }}>{getInitials(n)}</div><div className="text-sm" style={{ color: (currentColors as any).textPrimary || undefined }}>{n}</div></li>
              ))}</ul>
            )}
          </div>
          <div className="px-4 py-2 text-center text-xs" style={{ borderTop: `1px solid ${currentColors.shades?.[10] || '#f0f0f0'}`, color: (currentColors as any).textSecondary || '#6b7280' }}>총 {popupInfo.participants.length}명 참여</div>
        </div>
      </motion.div>,
      rootRef.current
    );
  }

  // close popup when clicking outside the root (keeps popup bound to tab)
  useEffect(() => {
    const handleDocClick = (ev: MouseEvent) => {
      const tar = ev.target as Node | null;
      if (!tar) return;
      if (!rootRef.current) return;
      if (rootRef.current.contains(tar)) return; // click inside tab => ignore
      setPopupInfo(null);
    };
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  /* 선택된 날짜의 참여자 목록 (popupInfo 기반) */
  const selectedParticipants = popupInfo?.dateKey
    ? (participantsMap[popupInfo.dateKey] || []).map((uid) => userMap[uid] || "Unknown")
    : [];

  return (
    <Card className="flex-1 p-6 md:p-10 min-h-[500px] md:min-h-[600px]">
      <div ref={rootRef} className="w-full relative">

      {/* ================= MONTH HEADER ================= */}
      {activeTab !== "history" && (
        <div className="flex justify-center items-center gap-4 md:gap-6 mb-6 md:mb-8">
          <Button
            variant="secondary"
            className="px-3 py-1 md:px-4 md:py-2"
            onClick={() => {
              const d = new Date(currentMonth);
              d.setMonth(d.getMonth() - 1);
              setCurrentMonth(d);
            }}
          >
            ◀
          </Button>

          <div className="text-base md:text-lg font-semibold">
            {year}년 {month + 1}월
          </div>

          <Button
            variant="secondary"
            className="px-3 py-1 md:px-4 md:py-2"
            onClick={() => {
              const d = new Date(currentMonth);
              d.setMonth(d.getMonth() + 1);
              setCurrentMonth(d);
            }}
          >
            ▶
          </Button>
        </div>
      )}

      {/* ================= TABS ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">

        <div className="flex flex-wrap gap-2 md:gap-3">
          <Button
            variant={
              activeTab === "total"
                ? "primary"
                : "secondary"
            }
            className="text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2"
            onClick={() => setActiveTab("total")}
          >
            이번 달 참여현황
          </Button>

          <Button
            variant={
              activeTab === "personal"
                ? "primary"
                : "secondary"
            }
            className="text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2"
            onClick={() =>
              setActiveTab("personal")
            }
          >
            내 출석 현황
          </Button>

          <Button
            variant={
              activeTab === "history"
                ? "primary"
                : "secondary"
            }
            className="text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2"
            onClick={() =>
              setActiveTab("history")
            }
          >
            내 히스토리
          </Button>
        </div>

        {/* 출석하기 버튼: 내 출석 현황 탭에서는 제거 (AttendanceLightCard에서 사용) */}
      </div>

      {/* ================= HISTORY VIEW ================= */}
      {activeTab === "history" && (
        <MyHistoryCard
          thisWeekTotal={
            history.thisWeekTotal
          }
          lastWeekTotal={
            history.lastWeekTotal
          }
          allTimeTotal={
            history.allTimeTotal
          }
          isReady={history.isReady}
          submissionCount={history.submissionCount}
          weeklyBreakdown={history.weeklyBreakdown}
        />
      )}

      {/* ================= CALENDAR VIEW ================= */}
      {activeTab !== "history" && (
        <>
        <AnimatePresence mode="wait">
          <motion.div
            key={monthKey + activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-7 gap-1.5 md:gap-3"
          >
            {[...Array(firstDay)].map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                />
              )
            )}

            {[...Array(daysInMonth)].map(
              (_, i) => {
                const day = i + 1;

                const key = `${year}-${String(
                  month + 1
                ).padStart(2, "0")}-${String(
                  day
                ).padStart(2, "0")}`;

                const status =
                  attendanceMap[key];

                const total =
                  totalMap[key] || 0;

                const percent =
                  Math.round(
                    (total / userCount) * 100
                  );

                return (
                  <motion.div
                    key={day}
                    onClick={async (e) => {
                      if (activeTab !== "total") return;
                      e.stopPropagation();
                      // toggle same date
                      if (popupInfo && popupInfo.dateKey === key) {
                        setPopupInfo(null);
                        return;
                      }

                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const rootRect = rootRef.current?.getBoundingClientRect();
                      let left = rect.right - (rootRect?.left ?? 0) + 8;
                      let top = rect.bottom - (rootRect?.top ?? 0) + 8;
                      const popupWidth = 300;
                      const popupHeightEstimate = 220;
                      if (rootRect) {
                        if (rootRect.width <= popupWidth + 16) {
                          left = Math.max(8, Math.round((rootRect.width - popupWidth) / 2));
                        } else {
                          const maxLeft = rootRect.width - popupWidth - 8;
                          if (left < 8) left = 8;
                          if (left > maxLeft) left = maxLeft;
                        }
                        const maxTop = rootRect.height - popupHeightEstimate - 8;
                        if (top < 8) top = 8;
                        if (top > Math.max(8, maxTop)) top = Math.max(8, maxTop);
                      } else {
                        // fallback: clamp to viewport
                        const minViewportLeft = 8;
                        const maxViewportLeft = Math.max(8, window.innerWidth - popupWidth - 8);
                        left = Math.min(Math.max(left, minViewportLeft), maxViewportLeft);
                        const minViewportTop = 8;
                        const maxViewportTop = Math.max(8, window.innerHeight - popupHeightEstimate - 8);
                        top = Math.min(Math.max(top, minViewportTop), maxViewportTop);
                      }

                      try {
                        const q = query(collection(db, "attendances"), where("date", "==", key), where("status", "==", "approved"));
                        const snap = await getDocs(q);
                        const ids: string[] = [];
                        snap.forEach((d) => {
                          const dt = d.data();
                          if (dt.userId) ids.push(dt.userId);
                        });
                        const names = ids.map((id) => userMap?.[id] || "Unknown");
                        setPopupInfo({ left, top, participants: names, dateKey: key });
                      } catch (err) {
                        setPopupInfo({ left, top, participants: [], dateKey: key });
                      }
                    }}
                    onTouchStart={async (e) => {
                      if (activeTab !== "total") return;
                      e.stopPropagation();

                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const rootRect = rootRef.current?.getBoundingClientRect();
                      let left = rect.right - (rootRect?.left ?? 0) + 8;
                      let top = rect.bottom - (rootRect?.top ?? 0) + 8;
                      const popupWidth = 300;
                      const popupHeightEstimate = 220;
                      if (rootRect) {
                        if (rootRect.width <= popupWidth + 16) {
                          left = Math.max(8, Math.round((rootRect.width - popupWidth) / 2));
                        } else {
                          const maxLeft = rootRect.width - popupWidth - 8;
                          if (left < 8) left = 8;
                          if (left > maxLeft) left = maxLeft;
                        }
                        const maxTop = rootRect.height - popupHeightEstimate - 8;
                        if (top < 8) top = 8;
                        if (top > Math.max(8, maxTop)) top = Math.max(8, maxTop);
                      } else {
                        const minViewportLeft = 8;
                        const maxViewportLeft = Math.max(8, window.innerWidth - popupWidth - 8);
                        left = Math.min(Math.max(left, minViewportLeft), maxViewportLeft);
                        const minViewportTop = 8;
                        const maxViewportTop = Math.max(8, window.innerHeight - popupHeightEstimate - 8);
                        top = Math.min(Math.max(top, minViewportTop), maxViewportTop);
                      }

                      try {
                        const q = query(collection(db, "attendances"), where("date", "==", key), where("status", "==", "approved"));
                        const snap = await getDocs(q);
                        const ids: string[] = [];
                        snap.forEach((d) => {
                          const dt = d.data();
                          if (dt.userId) ids.push(dt.userId);
                        });
                        const names = ids.map((id) => userMap?.[id] || "Unknown");
                        setPopupInfo({ left, top, participants: names, dateKey: key });
                      } catch (err) {
                        setPopupInfo({ left, top, participants: [], dateKey: key });
                      }
                    }}
                    className={`h-16 md:h-24 rounded-lg md:rounded-xl p-1.5 md:p-3 text-xs md:text-sm transition ${
                      activeTab === "total"
                        ? `${getCellColor(percent).className} cursor-pointer`
                        : "bg-gray-100"
                    }`}
                    style={activeTab === "total" ? getCellColor(percent).style : {}}
                  >
                    <div className="text-[10px] md:text-xs font-medium">
                      {day}
                    </div>

                    {activeTab ===
                      "total" && (
                        <div className="text-[10px] md:text-xs mt-0.5 md:mt-1 font-semibold">
                          {percent}%
                        </div>
                      )}

                    {activeTab ===
                      "personal" && (
                        <div className="mt-1 md:mt-3 text-[10px] md:text-xs">
                          {status ===
                            "approved" && (
                              <span
                                className="px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-bold truncate block text-center md:inline shadow-sm"
                                style={{ backgroundColor: currentColors.main, color: '#fff' }}
                              >
                                {/* 모바일에서는 텍스트 줄임 */}
                                <span className="hidden md:inline">출석 완료</span>
                                <span className="md:hidden">완료</span>
                              </span>
                            )}

                          {status ===
                            "pending" && (
                              <span
                                className="px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-bold truncate block text-center md:inline shadow-sm"
                                style={{ backgroundColor: currentColors.shades?.[40], color: '#fff' }}
                              >
                                <span className="hidden md:inline">승인 대기</span>
                                <span className="md:hidden">대기</span>
                              </span>
                            )}

                          {!status && (
                            <span className="px-1.5 py-0.5 md:px-2 md:py-1 rounded-full bg-gray-200 text-gray-600 block text-center md:inline">
                              <span className="hidden md:inline">미출석</span>
                              <span className="md:hidden">X</span>
                            </span>
                          )}
                        </div>
                      )}
                  </motion.div>
                );
              }
            )}
          </motion.div>
        </AnimatePresence>
        {popupPortal}
        </>
      )}

      </div>
    </Card>
  );
}

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1);
  return (parts[0].slice(0, 1) + parts[1].slice(0, 1)).toUpperCase();
}
