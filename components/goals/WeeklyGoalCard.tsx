"use client";

import { Goal } from "@/types/goal";

export default function WeeklyGoalCard({
  goal,
  successCount = 0,
  totalUserCount = 0,
}: {
  goal: Goal | null;
  successCount?: number;
  totalUserCount?: number;
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
    <div className="p-8 rounded-2xl shadow bg-white border border-gray-200 relative">

      <div className="text-sm text-gray-500">
        🎯 이번 주 목표
      </div>

      <div className="text-lg font-semibold mt-2 text-gray-800">
        {goal.content}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        {successCount} / {totalUserCount} 명 달성
      </div>

      <div className="w-full bg-gray-200 h-3 rounded mt-2">
        <div
          className="h-3 bg-indigo-500 rounded transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="text-xs mt-2 text-gray-500">
        달성률 {percent}%
      </div>

      {achieved && (
        <div className="absolute top-4 right-4 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          🎉 전원 달성
        </div>
      )}

    </div>
  );
}
