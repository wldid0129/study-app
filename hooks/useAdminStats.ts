"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AdminUserStat {
  userId: string;
  totalSolved: number;   // 전체 누적
  todayDiff: number;     // 오늘 증가량
  weeklyDiff: number;    // 이번 주 증가량
  isTodayApproved: boolean; // 오늘 목표 달성 여부
}

export function useAdminStats() {

  const [stats, setStats] =
    useState<AdminUserStat[]>([]);

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "attendances"),
      (snapshot) => {

        // 유저별 데이터 묶기
        const userMap: Record<
          string,
          { date: string; value: number; status: string }[]
        > = {};

        snapshot.forEach((doc) => {
          const d = doc.data();
          if (!d.userId || !d.date) return;

          if (!userMap[d.userId]) {
            userMap[d.userId] = [];
          }

          userMap[d.userId].push({
            date: d.date,
            value: d.problemCount ?? 0,
            status: d.status,
          });
        });

        const todayKey =
          new Date().toISOString().split("T")[0];

        // 이번 주 시작 계산 (월요일 기준)
        const weekStart = new Date();
        const day = weekStart.getDay();
        const diff =
          day === 0 ? 6 : day - 1;

        weekStart.setDate(
          weekStart.getDate() - diff
        );
        weekStart.setHours(0, 0, 0, 0);

        const result: AdminUserStat[] = [];

        Object.keys(userMap).forEach(
          (userId) => {

            const records =
              userMap[userId].sort(
                (a, b) =>
                  new Date(a.date).getTime() -
                  new Date(b.date).getTime()
              );

            let totalSolved = 0;
            let todayDiff = 0;
            let weeklyDiff = 0;
            let prevValue = 0;
            let isTodayApproved = false;

            records.forEach((r) => {

              const recordDate =
                new Date(r.date);

              const diffVal =
                r.value - prevValue;

              prevValue = r.value;
              totalSolved = r.value;

              // 오늘 증가량
              if (r.date === todayKey) {
                todayDiff = diffVal;

                if (r.status === "approved") {
                  isTodayApproved = true;
                }
              }

              // 이번 주 증가량
              if (recordDate >= weekStart) {
                weeklyDiff += diffVal;
              }
            });

            result.push({
              userId,
              totalSolved,
              todayDiff,
              weeklyDiff,
              isTodayApproved,
            });
          }
        );

        setStats(result);
      }
    );

    return () => unsub();

  }, []);

  return stats;
}
