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

  useEffect(() => {
    const weekStart = getWeekStart();

    const q = query(
      collection(db, "attendances"),
      where("status", "==", "approved")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const userTotals: Record<
        string,
        number
      > = {};

      snapshot.forEach((doc) => {
        const data = doc.data();

        const recordDate = new Date(
          data.date
        );

        if (recordDate >= weekStart) {
          userTotals[data.userId] =
            (userTotals[data.userId] || 0) +
            (data.problemCount || 0);
        }
      });

      const sorted = Object.entries(
        userTotals
      )
        .map(([userId, total]) => ({
          userId,
          total,
        }))
        .sort((a, b) => b.total - a.total);

      setRanking(sorted);
    });

    return () => unsub();
  }, []);

  return ranking;
}
