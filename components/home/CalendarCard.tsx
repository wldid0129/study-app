"use client";

import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface CalendarCardProps {
  currentMonth: Date;
  setCurrentMonth: (d: Date) => void;

  activeTab: "total" | "personal";
  setActiveTab: (v: "total" | "personal") => void;

  attendanceMap: Record<string, string>;
  totalMap: Record<string, number>;
  userCount: number;

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
  onOpenModal,
}: CalendarCardProps) {

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const getColor = (percent: number) => {
    if (percent === 0) return "bg-gray-100";
    if (percent < 30) return "bg-indigo-200";
    if (percent < 60) return "bg-indigo-400";
    return "bg-indigo-600 text-white";
  };

  const monthKey = `${year}-${month}`;

  return (
    <Card className="flex-1 p-10">

      {/* ================= MONTH HEADER ================= */}
      <div className="flex justify-center items-center gap-6 mb-8">

        <Button
          variant="secondary"
          onClick={() => {
            const d = new Date(currentMonth);
            d.setMonth(d.getMonth() - 1);
            setCurrentMonth(d);
          }}
        >
          ◀
        </Button>

        <div className="text-lg font-semibold">
          {year}년 {month + 1}월
        </div>

        <Button
          variant="secondary"
          onClick={() => {
            const d = new Date(currentMonth);
            d.setMonth(d.getMonth() + 1);
            setCurrentMonth(d);
          }}
        >
          ▶
        </Button>

      </div>

      {/* ================= TABS ================= */}
      <div className="flex justify-between mb-8">

        <div className="flex gap-3">
          <Button
            variant={activeTab === "total" ? "primary" : "secondary"}
            onClick={() => setActiveTab("total")}
          >
            이번 달 참여현황
          </Button>

          <Button
            variant={activeTab === "personal" ? "primary" : "secondary"}
            onClick={() => setActiveTab("personal")}
          >
            내 출석 현황
          </Button>
        </div>

        {activeTab === "personal" && (
          <Button onClick={onOpenModal}>
            출석하기
          </Button>
        )}

      </div>

      {/* ================= CALENDAR GRID ================= */}
      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey + activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-7 gap-3"
        >

          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {[...Array(daysInMonth)].map((_, i) => {

            const day = i + 1;
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            const status = attendanceMap[key];
            const total = totalMap[key] || 0;
            const percent = Math.round((total / userCount) * 100);

            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                className={`
                  h-24
                  rounded-xl
                  p-3
                  text-sm
                  transition
                  ${activeTab === "total"
                    ? getColor(percent)
                    : "bg-gray-100"}
                `}
              >

                <div className="text-xs font-medium">
                  {day}
                </div>

                {activeTab === "total" && (
                  <div className="text-xs mt-1 font-semibold">
                    {percent}%
                  </div>
                )}

                {activeTab === "personal" && (
                  <div className="mt-3 text-xs">

                    {status === "approved" && (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                        출석 완료
                      </span>
                    )}

                    {status === "pending" && (
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                        승인 대기
                      </span>
                    )}

                    {!status && (
                      <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                        미출석
                      </span>
                    )}

                  </div>
                )}

              </motion.div>
            );
          })}

        </motion.div>
      </AnimatePresence>

    </Card>
  );
}
