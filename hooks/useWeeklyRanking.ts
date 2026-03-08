import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface RankingItem {
  userId: string;
  total: number;
  // baseline before current week (used internally but not shown)
  baseline?: number;
}

export function useWeeklyRanking() {
  const [ranking, setRanking] =
    useState<RankingItem[]>([]);

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay(); // 0=일요일
    const diff = day === 0 ? 6 : day - 1;

    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);

    return monday;
  };

  const parseDate = (value: unknown) => {
    if (typeof value !== "string") return null;

    const normalized = value.trim();
    if (!normalized) return null;

    const dateOnly = normalized.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (dateOnly) {
      const [, y, m, d] = dateOnly;
      const parsed = new Date(
        Number(y),
        Number(m) - 1,
        Number(d)
      );

      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  };

  useEffect(() => {
    const q = query(
      collection(db, "attendances"),
      where("status", "==", "approved")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const weekStart = getWeekStart();

      const userRecords: Record<
        string,
        { date: Date; total: number }[]
      > = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.userId || !data.date) return;

        const recordDate = parseDate(data.date);
        if (!recordDate) return;

        const total = Number(data.problemCount ?? 0);
        if (!Number.isFinite(total)) return;

        if (!userRecords[data.userId]) {
          userRecords[data.userId] = [];
        }

        userRecords[data.userId].push({
          date: recordDate,
          total,
        });
      });

      const sorted = Object.entries(userRecords)
        .map(([userId, records]) => {
          records.sort(
            (a, b) => a.date.getTime() - b.date.getTime()
          );

          const beforeWeek = records
            .filter((r) => r.date < weekStart)
            .at(-1);

          const inWeek = records.filter(
            (r) => r.date >= weekStart
          );

          if (!inWeek.length) {
            return { userId, total: 0, baseline: beforeWeek?.total ?? 0 };
          }

          const weekLast = inWeek[inWeek.length - 1];
          const baseline = beforeWeek?.total ?? 0;

          return {
            userId,
            total: Math.max(0, weekLast.total - baseline),
            baseline,
          };
        })
        // remove users whose baseline exceeds threshold so they don't appear in ranking
        .filter((item) => item.total > 0 && item.total <= 40)
        .sort((a, b) => b.total - a.total);

      setRanking(sorted);
    });

    return () => unsub();
  }, []);

  return ranking;
}
