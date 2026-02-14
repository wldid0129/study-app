"use client";

import Card from "@/components/ui/Card";
import { Goal } from "@/types/goal";
import { motion } from "framer-motion";

export default function DailyGoalCard({
  goal,
  successCount,
  totalUserCount,
}: {
  goal: Goal | null;
  successCount: number;
  totalUserCount: number;
}) {
  if (!goal) return null;

  const percent =
    totalUserCount > 0
      ? Math.round(
          (successCount / totalUserCount) * 100
        )
      : 0;

  const achieved = percent === 100;

  return (
    <Card className="p-8 border border-gray-200 relative">

      <div className="text-sm text-gray-500">
        📌 오늘의 목표
      </div>

      <div className="font-semibold mt-2">
        {goal.content}
      </div>

      <div className="mt-4 text-sm">
        {successCount} / {totalUserCount} 명 달성
      </div>

      <div className="w-full bg-gray-200 h-3 rounded mt-2">
        <div
          className="h-3 bg-red-500 rounded transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="text-xs mt-2 text-gray-500">
        달성률 {percent}%
      </div>

      {achieved && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 bg-green-400 text-black px-3 py-1 rounded-full text-xs font-bold"
        >
          🎉 전원 달성
        </motion.div>
      )}

    </Card>
  );
}
