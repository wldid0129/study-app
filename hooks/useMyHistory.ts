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

  const getWeekStart = (base: Date) => {
    const day = base.getDay();
    const diff = day === 0 ? 6 : day - 1;

    const monday = new Date(base);
    monday.setDate(base.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

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
        const records: {
          date: Date;
          value: number;
        }[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          if (!data.date || !data.problemCount)
            return;

          records.push({
            date: new Date(data.date),
            value: data.problemCount,
          });
        });

        if (records.length === 0) {
          setAllTimeTotal(0);
          setThisWeekTotal(0);
          setLastWeekTotal(0);
          setWeeklyBreakdown({});
          setIsReady(false);
          return;
        }

        // 날짜 정렬
        records.sort(
          (a, b) =>
            a.date.getTime() - b.date.getTime()
        );

        const latest =
          records[records.length - 1].value;

        setAllTimeTotal(latest);

        const now = new Date();
        const thisWeekStart =
          getWeekStart(now);
        const lastWeekStart =
          getWeekStart(
            new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - 7
            )
          );

        let thisWeekLast = 0;
        let lastWeekLast = 0;
        let beforeLastWeekLast = 0;

        records.forEach((r) => {
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

        setThisWeekTotal(
          thisWeekLast - lastWeekLast
        );

        setLastWeekTotal(
          lastWeekLast - beforeLastWeekLast
        );

        // 주간 breakdown (증가량 기반)
        const breakdown: Record<
          string,
          number
        > = {};

        let prev = 0;

        records.forEach((r) => {
          const weekKey =
            getWeekStart(r.date)
              .toISOString()
              .split("T")[0];

          const diff = r.value - prev;
          prev = r.value;

          breakdown[weekKey] =
            (breakdown[weekKey] || 0) + diff;
        });

        setWeeklyBreakdown(breakdown);

        /* =========================
           🔒 히스토리 오픈 조건
        ========================= */

        const uniqueWeeks = new Set(
          records.map((r) =>
            getWeekStart(r.date)
              .toISOString()
              .split("T")[0]
          )
        );

        if (
          records.length >= 7 &&
          uniqueWeeks.size >= 2
        ) {
          setIsReady(true);
        } else {
          setIsReady(false);
        }
      }
    );

    return () => unsub();
  }, [userId]);

  return {
    thisWeekTotal,
    lastWeekTotal,
    allTimeTotal,
    weeklyBreakdown,
    isReady,
  };
}
