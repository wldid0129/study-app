"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  userCount,
  userId,
  onOpenModal,
}: CalendarCardProps) {
  const history = useMyHistory(userId);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const { currentColors } = useTheme();

  const getCellColor = (percent: number) => {
    if (percent === 0) return { className: "bg-gray-100 text-gray-600" };
    if (percent < 30) return { style: { backgroundColor: currentColors.shades?.[20] }, className: "text-gray-700" };
    if (percent < 60) return { style: { backgroundColor: currentColors.shades?.[60] }, className: "text-white" };
    return { style: { backgroundColor: currentColors.main }, className: "text-white" };
  };

  const monthKey = `${year}-${month}`;

  return (
    <Card className="flex-1 p-6 md:p-10 min-h-[500px] md:min-h-[600px]">

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

        {activeTab === "personal" && (
          <Button onClick={onOpenModal} className="w-full sm:w-auto text-sm">
            출석하기
          </Button>
        )}
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
                    whileHover={{
                      scale: 1.05,
                    }}
                    className={`h-16 md:h-24 rounded-lg md:rounded-xl p-1.5 md:p-3 text-xs md:text-sm transition
                    ${activeTab === "total"
                        ? getCellColor(percent).className
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
      )}
    </Card>
  );
}
