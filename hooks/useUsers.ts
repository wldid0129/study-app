"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export function useUsers() {

  const [userCount, setUserCount] = useState(1);
  const [userMap, setUserMap] =
    useState<Record<string, string>>({});

  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "users"),
      (snapshot) => {

        const map: Record<string, string> = {};

        snapshot.forEach((doc) => {
          const d = doc.data();
          map[doc.id] =
            d.name || d.email || "Unknown";
        });

        setUserMap(map);
        setUserCount(snapshot.size || 1);
      }
    );

    return () => unsub();

  }, []);

  return {
    userMap,
    userCount,
  };
}
