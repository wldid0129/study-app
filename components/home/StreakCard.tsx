"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import confetti from "canvas-confetti";
import Card from "@/components/ui/Card";

const MotionCard = motion(Card);

export default function StreakCard({
  streak,
}: {
  streak: number;
}) {
  const prevStreak = useRef<number>(streak);

  /* =========================
     카운트업
  ========================= */

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    Math.floor(latest)
  );

  useEffect(() => {
    const controls = animate(count, streak, {
      duration: 0.8,
      ease: "easeOut",
    });
    return controls.stop;
  }, [streak]);

  /* =========================
     streak 증가 시 confetti
  ========================= */

  useEffect(() => {
    if (streak > prevStreak.current) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    prevStreak.current = streak;
  }, [streak]);

  /* =========================
     메시지
  ========================= */

  const getMessage = () => {
    if (streak === 0) return "다시 시작하자 🔥";
    if (streak < 3) return "좋은 출발";
    if (streak < 7) return "리듬 타는 중";
    if (streak < 14) return "집중력 최고";
    if (streak < 30) return "이건 습관이다";
    return "전설의 스터디러";
  };

  const goldMode = streak >= 30;
  const shakeMode = streak === 0;

  return (
    <MotionCard
      animate={
        shakeMode
          ? { x: [0, -5, 5, -5, 5, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.4 }}
      className={`
        relative
        flex
        flex-col
        items-center
        justify-center
        p-10
        h-full          /* 🔥 부모 높이 따라감 */
        overflow-hidden
        transition
        ${
          goldMode
            ? "border-4 border-yellow-400 shadow-[0_0_25px_rgba(255,215,0,0.6)]"
            : ""
        }
      `}
    >
      {/* 🔥 배경 펄스 */}
      {streak > 0 && (
        <motion.div
          className="absolute w-40 h-40 rounded-full bg-orange-200 opacity-20"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
        />
      )}

      <div className="text-sm text-gray-500 mb-2 z-10">
        🔥 My Streak
      </div>

      <motion.div
        key={streak}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-5xl font-bold z-10 flex items-end gap-2"
      >
        <motion.span>{rounded}</motion.span>
        <span className="text-xl mb-1">days</span>
      </motion.div>

      {streak >= 7 && (
        <>
          <motion.div
            className="absolute text-2xl left-4"
            animate={{ y: [0, -20, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
            }}
          >
            🔥
          </motion.div>

          <motion.div
            className="absolute text-2xl right-4"
            animate={{ y: [0, -25, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
            }}
          >
            🔥
          </motion.div>
        </>
      )}

      <motion.div
        key={streak + "-msg"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-600 mt-4 text-center z-10"
      >
        {getMessage()}
      </motion.div>
    </MotionCard>
  );
}
