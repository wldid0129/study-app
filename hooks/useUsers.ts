"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export function useUsers() {

  const [userCount, setUserCount] = useState(0);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [userTotals, setUserTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    // 1. 유저 정보 (이름, 역할 등)
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const names: Record<string, string> = {};
      let count = 0;
      snapshot.forEach((doc) => {
        const d = doc.data();
        if (d.role === "user" && !d.isHidden) {
          names[doc.id] = d.name || d.email || "Unknown";
          count++;
        }
      });
      setUserMap(names);
      setUserCount(count);
    });

    // 2. 누적 문제 수 (티어용)
    const unsubAttend = onSnapshot(
      query(collection(db, "attendances"), where("status", "==", "approved")),
      (snapshot) => {
        const totals: Record<string, number> = {};
        snapshot.forEach((doc) => {
          const d = doc.data();
          const current = Number(d.problemCount || 0);
          if (!totals[d.userId] || current > totals[d.userId]) {
            totals[d.userId] = current;
          }
        });
        setUserTotals(totals);
      }
    );

    return () => {
      unsubUsers();
      unsubAttend();
    };
  }, []);

  return {
    userMap,
    userCount,
    userTotals,
  };
}
