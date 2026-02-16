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
  const userRecords: Record<
    string,
    { date: Date; total: number }[]
  > = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    const recordDate = new Date(data.date);

    if (recordDate >= weekStart) {
      if (!userRecords[data.userId]) {
        userRecords[data.userId] = [];
      }

      userRecords[data.userId].push({
        date: recordDate,
        total: data.problemCount || 0,
      });
    }
  });

  const userTotals: Record<string, number> =
    {};

  Object.entries(userRecords).forEach(
    ([userId, records]) => {
      // 날짜 정렬
      records.sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      let weeklyIncrease = 0;

      for (let i = 1; i < records.length; i++) {
        const diff =
          records[i].total -
          records[i - 1].total;

        if (diff > 0) {
          weeklyIncrease += diff;
        }
      }

      userTotals[userId] = weeklyIncrease;
    }
  );

  const sorted = Object.entries(userTotals)
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
