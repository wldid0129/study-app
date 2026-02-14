import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Goal } from "@/types/goal";

export function useGoals() {
  const [weeklyGoal, setWeeklyGoal] = useState<Goal | null>(null);
  const [dailyGoal, setDailyGoal] = useState<Goal | null>(null);

  useEffect(() => {

    // 🔥 Weekly 따로 구독
    const weeklyQuery = query(
      collection(db, "goals"),
      where("type", "==", "weekly"),
      where("active", "==", true)
    );

    const unsubWeekly = onSnapshot(weeklyQuery, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setWeeklyGoal({
          ...(doc.data() as Goal),
          id: doc.id,
        });
      } else {
        setWeeklyGoal(null);
      }
    });

    // 🔥 Daily 따로 구독
    const dailyQuery = query(
      collection(db, "goals"),
      where("type", "==", "daily"),
      where("active", "==", true)
    );

    const unsubDaily = onSnapshot(dailyQuery, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setDailyGoal({
          ...(doc.data() as Goal),
          id: doc.id,
        });
      } else {
        setDailyGoal(null);
      }
    });

    return () => {
      unsubWeekly();
      unsubDaily();
    };

  }, []);

  return { weeklyGoal, dailyGoal };
}
