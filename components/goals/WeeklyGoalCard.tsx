"use client";

import Card from "@/components/ui/Card";
import { DisplayGoal, Goal } from "@/types/goal";
import { motion } from "framer-motion";

export default function WeeklyGoalCard({
  goal,
  isSuccess,
}: {
  goal: DisplayGoal | null;
  isSuccess: boolean;
}) {
  if (!goal) return null;

  return (
    <Card className="p-8 border border-gray-200 relative">

      <div className="text-sm text-gray-500">
        🎯 이번 주 목표
      </div>

      <div className="text-lg font-semibold mt-2 text-gray-800">
        {goal.content}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        목표 기준: 누적 +{goal.targetCount}
      </div>

      <div className="mt-6">
        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-indigo-100 text-indigo-700 px-4 py-3 rounded-lg text-sm font-semibold"
          >
            🎉 이번 주 목표 달성!
          </motion.div>
        ) : (
          <div className="bg-gray-100 text-gray-600 px-4 py-3 rounded-lg text-sm">
            아직 이번 주 목표를 달성하지 못했습니다.
          </div>
        )}
      </div>

      {isSuccess && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold"
        >
          SUCCESS
        </motion.div>
      )}
    </Card>
  );
}

