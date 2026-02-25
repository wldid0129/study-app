"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export function useActivityHeatmap(userId: string | undefined) {
    const [attendances, setAttendances] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, "attendances"),
            where("userId", "==", userId),
            where("status", "==", "approved")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const dailyMax: Record<string, number> = {};

            snapshot.forEach((doc) => {
                const d = doc.data();
                if (d.date && d.problemCount !== undefined) {
                    const count = Number(d.problemCount);
                    if (!dailyMax[d.date] || count > dailyMax[d.date]) {
                        dailyMax[d.date] = count;
                    }
                }
            });

            const sortedDates = Object.keys(dailyMax).sort();
            const deltas: Record<string, number> = {};

            for (let i = 0; i < sortedDates.length; i++) {
                const currDate = sortedDates[i];
                const currVal = dailyMax[currDate];

                if (i === 0) {
                    // 첫 기록은 이전 기록이 없으므로 일단 해당 값 그대로 (또는 0에서 시작했다 가정)
                    // 유저 피드백에 따라 "오늘 기입한 문제수 - 전날 문제수" 임.
                    // 첫 기록은 이전 기록이 없으니 0으로 처리하거나, 이전 누적값을 알 수 없으므로 0으로 둡니다.
                    deltas[currDate] = 0;
                } else {
                    const prevDate = sortedDates[i - 1];
                    const prevVal = dailyMax[prevDate];
                    deltas[currDate] = Math.max(0, currVal - prevVal);
                }
            }
            setAttendances(deltas);
        });

        return () => unsub();
    }, [userId]);

    const heatmapData = useMemo(() => {
        const today = new Date();
        const months: Record<string, { date: string, count: number }[]> = {};

        // 최근 3개월 (현재 월 포함)
        for (let m = 0; m < 3; m++) {
            const targetMonth = new Date(today.getFullYear(), today.getMonth() - m, 1);
            const year = targetMonth.getFullYear();
            const month = targetMonth.getMonth() + 1;
            const monthKey = `${year}-${String(month).padStart(2, '0')}`;

            const lastDay = new Date(year, month, 0).getDate();
            const monthDays = [];

            for (let d = 1; d <= lastDay; d++) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                monthDays.push({
                    date: dateStr,
                    count: attendances[dateStr] || 0
                });
            }
            months[monthKey] = monthDays.reverse(); // 달력 순서대로? 아님 그냥 둘까요. 
            // 보통 잔디는 왼쪽에서 오른쪽이므로 날짜순(1일~末日)이 맞음.
            months[monthKey] = monthDays;
        }

        return months;
    }, [attendances]);

    return heatmapData;
}
