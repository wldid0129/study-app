import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface HistoryResult {
  thisWeekTotal: number;
  lastWeekTotal: number;
  allTimeTotal: number;
  weeklyBreakdown: Record<string, number>;
  isReady: boolean;
  submissionCount: number;
}

export function useMyHistory(userId?: string): HistoryResult {
  const [thisWeekTotal, setThisWeekTotal] =
    useState(0);
  const [lastWeekTotal, setLastWeekTotal] =
    useState(0);
  const [allTimeTotal, setAllTimeTotal] =
    useState(0);
  const [weeklyBreakdown, setWeeklyBreakdown] =
    useState<Record<string, number>>({});
  const [isReady, setIsReady] =
    useState(false);
  const [submissionCount, setSubmissionCount] =
    useState(0);

  const getWeekStart = (base: Date) => {
    const day = base.getDay();
    const diff = day === 0 ? 6 : day - 1;

    const monday = new Date(base);
    monday.setDate(base.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const parseDate = (value: unknown) => {
    if (typeof value !== "string") return null;

    const normalized = value.trim();
    if (!normalized) return null;

    const dateOnly = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

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
    if (Number.isNaN(parsed.getTime())) return null;

    return parsed;
  };

  useEffect(() => {
    if (!userId) return;

    const attendanceQuery = query(
      collection(db, "attendances"),
      where("userId", "==", userId)
    );

    const unsub = onSnapshot(attendanceQuery, (snapshot) => {
      const approvedRecords: {
        date: Date;
        value: number;
      }[] = [];

      let totalSubmissions = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();

        const parsedDate = parseDate(data.date);
        if (!parsedDate) return;

        totalSubmissions += 1;

        if (data.status !== "approved") return;

        const value = Number(data.problemCount);
        if (!Number.isFinite(value)) return;

        approvedRecords.push({
          date: parsedDate,
          value,
        });
      });

      // 히스토리 카드 잠금 해제 기준: 제출(상태 무관) 2회 이상
      setSubmissionCount(totalSubmissions);
      setIsReady(totalSubmissions >= 2);

      if (approvedRecords.length === 0) {
        setAllTimeTotal(0);
        setThisWeekTotal(0);
        setLastWeekTotal(0);
        setWeeklyBreakdown({});
        return;
      }

      approvedRecords.sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      const latest =
        approvedRecords[approvedRecords.length - 1].value;

      setAllTimeTotal(latest);

      const now = new Date();
      const thisWeekStart = getWeekStart(now);
      const lastWeekStart = getWeekStart(
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7
        )
      );

      let thisWeekLast = 0;
      let lastWeekLast = 0;
      let beforeLastWeekLast = 0;

      approvedRecords.forEach((r) => {
        if (r.date < lastWeekStart) {
          beforeLastWeekLast = r.value;
        } else if (
          r.date >= lastWeekStart &&
          r.date < thisWeekStart
        ) {
          lastWeekLast = r.value;
        } else if (r.date >= thisWeekStart) {
          thisWeekLast = r.value;
        }
      });

      setThisWeekTotal(thisWeekLast - lastWeekLast);
      setLastWeekTotal(
        lastWeekLast - beforeLastWeekLast
      );

      const breakdown: Record<string, number> = {};
      let prev = 0;

      approvedRecords.forEach((r) => {
        const weekKey = getWeekStart(r.date)
          .toISOString()
          .split("T")[0];

        const diff = r.value - prev;
        prev = r.value;

        breakdown[weekKey] =
          (breakdown[weekKey] || 0) + diff;
      });

      setWeeklyBreakdown(breakdown);
    });

    return () => unsub();
  }, [userId]);

  return {
    thisWeekTotal,
    lastWeekTotal,
    allTimeTotal,
    weeklyBreakdown,
    isReady,
    submissionCount,
  };
}
