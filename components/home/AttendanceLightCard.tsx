"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { Sparkles } from "lucide-react";

export default function AttendanceLightCard({
  user,
  streak,
  onOpenModal,
}: {
  user: any;
  streak: number;
  onOpenModal: () => void;
}) {
  const { currentColors } = useTheme();

  const name = user?.displayName || "00";

  return (
    <Card className="w-full max-w-full p-2 md:p-3 bg-white border border-gray-100 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md" style={{ minHeight: 80 }}>
      <div className="flex items-center justify-between gap-4 h-full">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className="p-2 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: currentColors.light, color: currentColors.main }}
          >
            <Sparkles size={20} />
          </div>

          <div className="min-w-0">
            <span
              className="block text-[10px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: currentColors.main }}
            >
              Attendance Board
            </span>
            <div className="mt-1 truncate">
              <span className="font-bold text-sm md:text-base">{name}님, </span>
              <span className="font-bold text-sm md:text-base">{streak}일차</span>
              <span className="ml-2 text-xs md:text-sm">출석 중입니다 — 오늘도 도전해보세요!</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-4">
          <a
            href="https://programmers.co.kr/learn/challenges"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex flex-col items-center justify-center gap-1.5 px-4 h-20 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 transition-all border border-dashed border-gray-200 group"
          >
            <span className="text-[10px] font-black uppercase tracking-tighter">Go Solve</span>
            <span className="text-xs font-bold text-gray-500 group-hover:text-brand transition-colors">프로그래머스 ↗</span>
          </a>
          <Button
            onClick={onOpenModal}
            className="flex items-center justify-center rounded-2xl shadow-md"
            variant="primary"
            style={{ width: 160, height: 80, padding: 0 }}
          >
            <span className="text-sm">출석인증</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
