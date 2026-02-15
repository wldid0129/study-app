import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Goal } from "@/types/goal";

const DEFAULT_DAILY_TARGET = 2;
const DEFAULT_WEEKLY_TARGET = 10;

export function useGoals(userId?: string) {
  const [dailyGoal, setDailyGoal] =
    useState<Goal | null>(null);

  const [weeklyGoal, setWeeklyGoal] =
    useState<Goal | null>(null);

  const [isDailySuccess, setIsDailySuccess] =
    useState(false);

  const [isWeeklySuccess, setIsWeeklySuccess] =
    useState(false);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("sv-SE");

  /* =========================
     목표 설정 구독 (선택적)
  ========================= */

  useEffect(() => {
    const dailyQuery = query(
      collection(db, "goals"),
      where("type", "==", "daily"),
      where("active", "==", true)
    );

    const weeklyQuery = query(
      collection(db, "goals"),
      where("type", "==", "weekly"),
      where("active", "==", true)
    );

    const unsubDaily = onSnapshot(
      dailyQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setDailyGoal({
            ...(doc.data() as Goal),
            id: doc.id,
          });
        } else {
          setDailyGoal(null);
        }
      }
    );

    const unsubWeekly = onSnapshot(
      weeklyQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setWeeklyGoal({
            ...(doc.data() as Goal),
            id: doc.id,
          });
        } else {
          setWeeklyGoal(null);
        }
      }
    );

    return () => {
      unsubDaily();
      unsubWeekly();
    };
  }, []);

  /* =========================
     성공 여부 계산
  ========================= */

  useEffect(() => {
    if (!userId) return;

    const attendanceQuery = query(
      collection(db, "attendances"),
      where("userId", "==", userId),
      where("status", "==", "approved")
    );

    const unsub = onSnapshot(
      attendanceQuery,
      (snapshot) => {
        const records: Record<string, number> =
          {};

        snapshot.forEach((doc) => {
          const d = doc.data();
          records[d.date] =
            d.problemCount || 0;
        });

        const today = new Date();
        const todayKey = formatDate(today);

        const yesterday = new Date();
        yesterday.setDate(
          today.getDate() - 1
        );
        const yesterdayKey =
          formatDate(yesterday);

        const todayTotal =
          records[todayKey] || 0;

        const yesterdayTotal =
          records[yesterdayKey] || 0;

        const dailyTarget =
          dailyGoal?.targetCount ??
          DEFAULT_DAILY_TARGET;

        setIsDailySuccess(
          todayTotal - yesterdayTotal >=
            dailyTarget
        );

        // 🔥 Weekly 계산
        const weekStart = new Date(today);
        weekStart.setDate(
          today.getDate() - today.getDay()
        );

        const weekStartKey =
          formatDate(weekStart);

        const weekStartTotal =
          records[weekStartKey] || 0;

        const weeklyTarget =
          weeklyGoal?.targetCount ??
          DEFAULT_WEEKLY_TARGET;

        setIsWeeklySuccess(
          todayTotal - weekStartTotal >=
            weeklyTarget
        );
      }
    );

    return () => unsub();
  }, [userId, dailyGoal, weeklyGoal]);

  return {
  dailyGoal: {
    content: dailyGoal?.content ?? `일일 목표: 누적 +${DEFAULT_DAILY_TARGET}`,
    targetCount: dailyGoal?.targetCount ?? DEFAULT_DAILY_TARGET,
  },
  weeklyGoal: {
    content: weeklyGoal?.content ?? `주간 목표: 누적 +${DEFAULT_WEEKLY_TARGET}`,
    targetCount: weeklyGoal?.targetCount ?? DEFAULT_WEEKLY_TARGET,
  },
  isDailySuccess,
  isWeeklySuccess,
  isDailyActive: dailyGoal?.active ?? false,
  isWeeklyActive: weeklyGoal?.active ?? false,
};

}
