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
  monthlyBreakdown: Record<string, number>;
  isReady: boolean;
  submissionCount: number;
}

export function useMyHistory(userId?: string): HistoryResult {
  const [thisWeekTotal, setThisWeekTotal] = useState(0);
  const [lastWeekTotal, setLastWeekTotal] = useState(0);
  const [allTimeTotal, setAllTimeTotal] = useState(0);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState<Record<string, number>>({});
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<Record<string, number>>({});
  const [isReady, setIsReady] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);

  // 로컬 시간 기준 YYYY-MM-DD 생성 (가장 안전한 방식)
  const formatLocalISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 로컬 시간 기준 'YYYY-MM-DD' 문자열을 Date 객체로 변환 (시간은 00:00:00)
  const parseLocalISO = (isoStr: string) => {
    const [y, m, d] = isoStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const getWeekStart = (base: Date) => {
    const d = new Date(base);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1; // 월요일 시작
    d.setDate(d.getDate() - diff);
    return d;
  };

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, "attendances"), where("userId", "==", userId));

    const unsub = onSnapshot(q, (snapshot) => {
      const records: { date: Date; value: number; status: string }[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const d = parseLocalISO(data.date);
        if (!isNaN(d.getTime())) {
          records.push({
            date: d,
            value: Number(data.problemCount) || 0,
            status: data.status
          });
        }
      });

      setSubmissionCount(snapshot.size);
      setIsReady(snapshot.size >= 2);

      const approved = records
        .filter(r => r.status === "approved")
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      if (approved.length === 0) {
        setAllTimeTotal(0);
        setThisWeekTotal(0);
        setLastWeekTotal(0);
        setWeeklyBreakdown({});
        return;
      }

      const latestTotal = approved[approved.length - 1].value;
      setAllTimeTotal(latestTotal);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisWeekStart = getWeekStart(today);
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);

      // 주간 히스토리 데이터 생성 (2026년 2월 1일 이후로 제한)
      const weeklyData: Record<string, number> = {};
      const weekKeys: string[] = [];
      const reportStartDate = new Date(2026, 1, 1); // 2026년 2월 1일

      // 2026년 2월까지 역산
      for (let i = 0; i < 20; i++) { // 안전하게 최대 20주까지만 (혹은 2월 도달 시 중단)
        const d = new Date(thisWeekStart);
        d.setDate(thisWeekStart.getDate() - (i * 7));
        if (d < reportStartDate) break;
        weekKeys.push(formatLocalISO(d));
      }

      weekKeys.forEach(mondayStr => {
        const monday = parseLocalISO(mondayStr);
        let weekMax = 0;

        approved.forEach(r => {
          if (formatLocalISO(getWeekStart(r.date)) === mondayStr) {
            if (r.value > weekMax) weekMax = r.value;
          }
        });

        if (weekMax === 0) {
          weeklyData[mondayStr] = 0;
          return;
        }

        let baseline = 0;
        approved.forEach(r => {
          if (r.date < monday && r.value > baseline) baseline = r.value;
        });
        weeklyData[mondayStr] = weekMax - baseline;
      });

      setWeeklyBreakdown(weeklyData);

      // 대시보드 요약 수치
      const thisWeekKey = formatLocalISO(thisWeekStart);
      const lastWeekKey = formatLocalISO(lastWeekStart);

      setThisWeekTotal(weeklyData[thisWeekKey] || 0);
      setLastWeekTotal(weeklyData[lastWeekKey] || 0);

      // 월별 브레이크다운 (2026년 2월 이후로 제한)
      const monthlyData: Record<string, number> = {};
      const monthKeys: string[] = [];

      for (let i = 0; i < 12; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        if (d < reportStartDate) break;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        monthKeys.push(`${y}-${m}`);
      }

      monthKeys.forEach(monthStr => {
        let monthMax = 0;
        const [y, m] = monthStr.split("-").map(Number);
        const monthStart = new Date(y, m - 1, 1);

        approved.forEach(r => {
          const rYear = r.date.getFullYear();
          const rMonth = String(r.date.getMonth() + 1).padStart(2, "0");
          if (`${rYear}-${rMonth}` === monthStr) {
            if (r.value > monthMax) monthMax = r.value;
          }
        });

        if (monthMax === 0) {
          monthlyData[monthStr] = 0;
          return;
        }

        let baseline = 0;
        approved.forEach(r => {
          if (r.date < monthStart && r.value > baseline) baseline = r.value;
        });
        monthlyData[monthStr] = monthMax - baseline;
      });

      setMonthlyBreakdown(monthlyData);
    });

    return () => unsub();
  }, [userId]);

  return {
    thisWeekTotal,
    lastWeekTotal,
    allTimeTotal,
    weeklyBreakdown,
    monthlyBreakdown,
    isReady,
    submissionCount,
  };
}
