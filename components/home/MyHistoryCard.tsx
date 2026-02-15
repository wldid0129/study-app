"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface Props {
  thisWeekTotal: number;
  lastWeekTotal: number;
  allTimeTotal: number;
  isReady: boolean;
}

export default function MyHistoryCard({
  thisWeekTotal,
  lastWeekTotal,
  allTimeTotal,
  isReady,
}: Props) {

  const diff = thisWeekTotal - lastWeekTotal;
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <div className="relative bg-white p-8 rounded-2xl shadow border border-gray-200 overflow-hidden">

      {/* ======================
          실제 히스토리 내용
      ====================== */}

      <div className={isReady ? "" : "blur-sm opacity-50 pointer-events-none"}>

        <div className="text-sm text-gray-500 mb-6">
          📈 내 학습 히스토리
        </div>

        <div className="grid grid-cols-3 gap-6 text-center">

          {/* 이번 주 */}
          <div>
            <div className="text-xs text-gray-400">
              이번 주
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold mt-2"
            >
              {thisWeekTotal}
            </motion.div>
          </div>

          {/* 지난 주 */}
          <div>
            <div className="text-xs text-gray-400">
              지난 주
            </div>
            <div className="text-2xl font-bold mt-2 text-gray-600">
              {lastWeekTotal}
            </div>
          </div>

          {/* 전체 누적 */}
          <div>
            <div className="text-xs text-gray-400">
              전체 누적
            </div>
            <div className="text-2xl font-bold mt-2 text-indigo-600">
              {allTimeTotal}
            </div>
          </div>

        </div>

        {/* 증감 표시 */}
        <div className="mt-6 text-center text-sm">
          {diff === 0 && (
            <span className="text-gray-500">
              지난 주와 동일합니다.
            </span>
          )}

          {isUp && (
            <span className="text-green-600 font-medium">
              ▲ 지난 주 대비 +{diff}
            </span>
          )}

          {isDown && (
            <span className="text-red-600 font-medium">
              ▼ 지난 주 대비 {diff}
            </span>
          )}
        </div>

      </div>

      {/* ======================
          🔒 잠금 오버레이
      ====================== */}

      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md text-center p-6">

          <Lock className="w-8 h-8 text-gray-500 mb-3" />

          <div className="text-sm font-medium text-gray-700">
            학습 히스토리 준비 중
          </div>

          <div className="text-xs text-gray-500 mt-2">
            최소 2주 이상의 기록이 쌓이면
            <br />
            자동으로 열립니다.
          </div>

        </div>
      )}

    </div>
  );
}
