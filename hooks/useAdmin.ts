import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

/* ===============================
   🔥 STREAK 계산 함수 (선택 날짜 기준)
================================ */

function calculateStreak(dates: string[], baseDate: string) {
  const base = new Date(baseDate);
  let count = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);

    const key = d.toLocaleDateString("sv-SE");

    if (dates.includes(key)) count++;
    else break;
  }

  return count;
}

export function useAdmin(selectedDate: string) {
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [noticeId, setNoticeId] = useState<string | null>(null);
  const [noticeContent, setNoticeContent] = useState("");
  const [attendanceStatusList, setAttendanceStatusList] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any>({});

  /* ======================
     PENDING (실시간)
  ====================== */

  useEffect(() => {
    const q = query(
      collection(db, "attendances"),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setPendingList(list);
    });

    return () => unsub();
  }, []);

  /* ======================
     NOTICE (실시간)
  ====================== */

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "notices"), (snapshot) => {
      if (!snapshot.empty) {
        const d = snapshot.docs[0];
        setNoticeId(d.id);
        setNoticeContent(d.data().content);
      }
    });

    return () => unsub();
  }, []);

  const saveNotice = async () => {
    if (!noticeId) {
      await addDoc(collection(db, "notices"), {
        content: noticeContent,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, "notices", noticeId), {
        content: noticeContent,
        updatedAt: serverTimestamp(),
      });
    }
  };

  /* ======================
     🔥 날짜별 출석 + streak (실시간 + 정렬)
  ====================== */

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "attendances"),
      async (attendSnap) => {
        const usersSnap = await getDocs(collection(db, "users"));

        const approvedMap: Record<string, string[]> = {};
        const statusMap: Record<string, string> = {};

        attendSnap.forEach((docItem) => {
          const d = docItem.data();

          if (d.status === "approved") {
            if (!approvedMap[d.userId])
              approvedMap[d.userId] = [];

            approvedMap[d.userId].push(d.date);
          }

          if (d.date === selectedDate) {
            statusMap[d.userId] = d.status;
          }
        });

        const result: any[] = [];

        usersSnap.forEach((userDoc) => {
          const userId = userDoc.id;
          const userData = userDoc.data();

          const streak = calculateStreak(
            approvedMap[userId] || [],
            selectedDate
          );

          result.push({
            userId,
            name: userData.name || userData.email,
            status: statusMap[userId] || "none",
            streak,
          });
        });

        /* 🔥 streak 기준 정렬 (내림차순) */
        result.sort((a, b) => {
          if (b.streak !== a.streak) {
            return b.streak - a.streak;
          }
          return a.name.localeCompare(b.name);
        });

        setAttendanceStatusList(result);
      }
    );

    return () => unsub();
  }, [selectedDate]);

  /* ======================
     🔥 통계 계산
  ====================== */

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    const attendSnap = await getDocs(
      query(
        collection(db, "attendances"),
        where("status", "==", "approved")
      )
    );

    const userTotalMap: Record<string, number> = {};

    attendSnap.forEach((docItem) => {
      const d = docItem.data();
      const count = d.problemCount || 0;

      userTotalMap[d.userId] =
        (userTotalMap[d.userId] || 0) + count;
    });

    const rankingList: any[] = [];

    usersSnap.forEach((userDoc) => {
      const userId = userDoc.id;
      const userData = userDoc.data();

      rankingList.push({
        userId,
        name: userData.name || userData.email,
        total: userTotalMap[userId] || 0,
      });
    });

    rankingList.sort((a, b) => b.total - a.total);
    setRanking(rankingList);

    const dist: Record<string, number> = {};

    for (let i = 0; i <= 240; i += 20) {
      const key = `${i}-${i + 20}`;
      dist[key] = 0;
    }

    rankingList.forEach((user) => {
      const t = user.total;
      const bucket = Math.floor(t / 20) * 20;
      const key = `${bucket}-${bucket + 20}`;

      if (dist[key] !== undefined) {
        dist[key]++;
      }
    });

    setDistribution(dist);
  };

  /* ======================
     승인 / 거절
  ====================== */

  const approve = async (id: string) => {
    await updateDoc(doc(db, "attendances", id), {
      status: "approved",
      approvedAt: serverTimestamp(),
    });
  };

  const reject = async (id: string) => {
    await updateDoc(doc(db, "attendances", id), {
      status: "rejected",
    });
  };

  return {
    pendingList,
    attendanceStatusList,
    noticeContent,
    setNoticeContent,
    saveNotice,
    approve,
    reject,
    ranking,
    distribution,
  };
}
