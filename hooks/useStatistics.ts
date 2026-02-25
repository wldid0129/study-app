"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface AttendanceItem {
  userId: string;
  date: string;
  status: string;
}

export function useStatistics(
  userCount: number,
  userMap: Record<string, string>
) {

  const [attendanceRaw, setAttendanceRaw] =
    useState<AttendanceItem[]>([]);

  /* =========================
     SNAPSHOT 저장만
  ========================= */

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "attendances"),
      (snapshot) => {

        const list: AttendanceItem[] = [];

        snapshot.forEach((doc) => {
          const d = doc.data();
          if (d.status === "approved") {
            list.push({
              userId: d.userId,
              date: d.date,
              status: d.status,
            });
          }
        });

        setAttendanceRaw(list);
      }
    );

    return () => unsub();

  }, []);

  /* =========================
     계산은 useMemo
  ========================= */

  const { todayRate, weeklyTop, monthlyTop } =
    useMemo(() => {

      const now = new Date();
      const todayKey =
        now.toISOString().split("T")[0];

      // 🔥 월요일 시작 주간 계산
      const day = now.getDay(); // 0=일요일
      const diff = day === 0 ? 6 : day - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - diff);
      weekStart.setHours(0, 0, 0, 0);

      const monthlyCount: Record<string, number> = {};
      const weeklyCount: Record<string, number> = {};
      let todayCount = 0;

      attendanceRaw.forEach((item) => {
        // item.date is "YYYY-MM-DD"
        const [y, m, d] = item.date.split("-").map(Number);
        const dateObj = new Date(y, m - 1, d);

        if (item.date === todayKey) {
          todayCount++;
        }

        // 이번 주 (월요일 00:00:00 ~ 현재)
        if (dateObj >= weekStart) {
          weeklyCount[item.userId] =
            (weeklyCount[item.userId] || 0) + 1;
        }

        if (
          dateObj.getMonth() === now.getMonth() &&
          dateObj.getFullYear() === now.getFullYear()
        ) {
          monthlyCount[item.userId] =
            (monthlyCount[item.userId] || 0) + 1;
        }

      });

      const sortDesc = (obj: Record<string, number>) =>
        Object.entries(obj)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([uid, count]) => ({
            name: userMap[uid] || uid,
            count,
          }));

      return {
        todayRate:
          userCount > 0
            ? Math.round((todayCount / userCount) * 100)
            : 0,
        weeklyTop: sortDesc(weeklyCount),
        monthlyTop: sortDesc(monthlyCount),
      };

    }, [attendanceRaw, userMap, userCount]);

  return {
    todayRate,
    weeklyTop,
    monthlyTop,
  };
}
