"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useMemo } from "react";

interface Props {
  thisWeekTotal: number;
  lastWeekTotal: number;
  allTimeTotal: number;
  isReady?: boolean;
  submissionCount?: number;
  weeklyBreakdown?: Record<string, number>;
}

export function WeeklyTrendChart({ breakdown }: { breakdown: Record<string, number> }) {
  const { currentColors } = useTheme();

  // 날짜를 YYYY-MM-DD 로 포맷팅 (로컬 시간 기준)
  const formatToLocalISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 지난 5주간의 월요일 날짜들을 정확히 계산
  const displayData = useMemo(() => {
    const keys = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 이번 주 월요일 찾기
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const thisMon = new Date(now);
    thisMon.setDate(now.getDate() - diff);

    for (let i = 4; i >= 0; i--) {
      const d = new Date(thisMon);
      d.setDate(thisMon.getDate() - (i * 7));
      const key = formatToLocalISO(d);
      keys.push({
        key,
        count: breakdown[key] || 0
      });
    }
    return keys;
  }, [breakdown]);

  const maxVal = Math.max(...displayData.map((d) => d.count), 5);

  return (
    <div className="mt-10 pt-6 border-t border-gray-50 h-40"> {/* 명시적 높이 부여 */}
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">Weekly Trend</div>
      <div className="flex items-end justify-between h-24 gap-3 overflow-visible">
        {displayData.map((data, idx) => {
          const height = (data.count / maxVal) * 100;
          const isLatest = idx === displayData.length - 1;

          return (
            <div key={data.key} className="flex-1 flex flex-col items-center gap-2 group relative h-full"> {/* h-full 보강 */}
              <div className="flex-1 w-full flex items-end justify-center min-h-[40px]">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 8)}%` }} // 최소 시인성 8%
                  className={`w-full rounded-t-xl transition-all shadow-sm ${isLatest ? '' : 'bg-gray-300 group-hover:bg-gray-400'}`}
                  style={isLatest ? {
                    backgroundColor: currentColors?.main || '#3b82f6',
                    boxShadow: `0 10px 15px -3px ${currentColors?.main || '#3b82f6'}40`
                  } : {}}
                />
              </div>
              <span className="text-[9px] font-bold mt-1" style={{ color: isLatest ? (currentColors?.main || '#3b82f6') : '#9ca3af' }}>
                {isLatest ? 'NOW' : `${idx + 1}W`}
              </span>

              {/* 툴팁 */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-xl font-bold">
                {data.count}문제
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyHistoryCard({
  thisWeekTotal,
  lastWeekTotal,
  allTimeTotal,
  isReady,
  submissionCount = 0,
  weeklyBreakdown = {},
}: Props) {
  const { currentColors } = useTheme();

  const diff = thisWeekTotal - lastWeekTotal;
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <div className="relative bg-white p-8 rounded-2xl shadow border border-gray-200 overflow-hidden min-h-[380px]">

      {/* ======================
          실제 히스토리 내용
      ====================== */}

      <div className={isReady ? "" : "blur-sm opacity-50 pointer-events-none"}>

        <div className="text-sm text-gray-500 mb-6 font-bold flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-gray-50">📈</span> 내 학습 히스토리
        </div>

        <div className="grid grid-cols-3 gap-6 text-center">

          {/* 이번 주 */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              이번 주
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold mt-1"
              style={{ color: currentColors?.main || '#3b82f6' }}
            >
              {thisWeekTotal}
            </motion.div>
          </div>

          {/* 지난 주 */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              지난 주
            </div>
            <div className="text-2xl font-bold mt-1 text-gray-600">
              {lastWeekTotal}
            </div>
          </div>

          {/* 전체 누적 */}
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              전체 누적
            </div>
            <div className="text-2xl font-bold mt-1 text-gray-800">
              {allTimeTotal}
            </div>
          </div>

        </div>

        {/* 증감 표시 */}
        <div className="mt-8 flex justify-center">
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border ${diff === 0 ? "bg-gray-50 text-gray-500 border-gray-100" :
            isUp ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
              "bg-rose-50 text-rose-600 border-rose-100"
            }`}>
            {diff === 0 ? "지난 주와 성취도가 동일합니다" :
              isUp ? `▲ 지난 주보다 ${diff}문제 더 풀었어요!` :
                `▼ 지난 주보다 ${Math.abs(diff)}문제 쉬어갔어요`}
          </div>
        </div>

        {/* 주간 트렌드 차트 추가 */}
        {isReady && <WeeklyTrendChart breakdown={weeklyBreakdown} />}

      </div>

      {/* ======================
          🔒 잠금 오버레이
      ====================== */}

      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md text-center p-6 z-40">
          <div className="p-4 rounded-3xl bg-white shadow-2xl border border-gray-100 scale-90 md:scale-100">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-base font-black text-gray-800">
              학습 히스토리 분석 중
            </div>
            <div className="text-[11px] text-gray-500 mt-2 leading-relaxed">
              성공적인 분석을 위해 <span className="font-bold text-gray-800">최소 2회 이상</span><br /> 출석 기록이 필요합니다.
            </div>
            <div className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-xl text-[10px] font-bold">
              현재 제출 {submissionCount}회
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
