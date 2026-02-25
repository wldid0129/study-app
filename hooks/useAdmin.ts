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
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { useInteraction } from "@/hooks/useInteraction";

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
  const [noticeList, setNoticeList] = useState<any[]>([]);
  const [interactionMessages, setInteractionMessages] = useState<any[]>([]);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const { saveAnswer } = useInteraction(null, true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
     NOTICE (실시간 - 전체 목록)
  ====================== */
  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNoticeList(list);
    });
    return () => unsub();
  }, []);

  const saveNotice = async () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    setSaveLoading(true);
    try {
      await addDoc(collection(db, "notices"), {
        title: noticeTitle,
        content: noticeContent,
        createdAt: serverTimestamp(),
      });
      setNoticeTitle("");
      setNoticeContent("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert("공지 저장 실패");
    } finally {
      setSaveLoading(false);
    }
  };

  const deleteNotice = async (id: string) => {
    if (!confirm("이 공지사항을 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "notices", id));
    } catch (e) {
      console.error(e);
      alert("삭제 실패");
    }
  };

  /* ======================
     INTERACTIONS (실시간 - 전체 목록)
  ====================== */
  useEffect(() => {
    const q = query(collection(db, "interactions"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setInteractionMessages(list);
    });
    return () => unsub();
  }, []);

  const deleteInteraction = async (id: string) => {
    if (!confirm("이 메시지를 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "interactions", id));
    } catch (e) {
      console.error(e);
      alert("삭제 실패");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("정말로 이 사용자를 영구 삭제하시겠습니까? 관련 출석 데이터도 모두 삭제됩니다.")) return;
    try {
      // 1. 유저 문서 삭제
      await deleteDoc(doc(db, "users", userId));

      // 2. 관련 출석 데이터 삭제
      const q = query(collection(db, "attendances"), where("userId", "==", userId));
      const snap = await getDocs(q);

      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();

      alert("사용자 및 관련 데이터가 삭제되었습니다.");
    } catch (e) {
      console.error(e);
      alert("사용자 삭제 실패");
    }
  };

  /* ======================
     🔥 전체 유저 관리 (실시간)
  ====================== */

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setAllUsers(users);
    });
    return () => unsub();
  }, []);

  const toggleUserVisibility = async (userId: string, isHidden: boolean) => {
    await updateDoc(doc(db, "users", userId), {
      isHidden,
    });
  };

  /* ======================
     🔥 날짜별 출석 + streak (실시간 + 정렬)
  ====================== */

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "attendances"),
      async (attendSnap) => {
        const usersSnap = await getDocs(
          query(collection(db, "users"), where("role", "==", "user"))
        );

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

          if (userData.isHidden) return; // 숨김 유저 제외

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
    const usersSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "user"))
    );
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

      if (userData.isHidden) return; // 숨김 유저 제외

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
    noticeTitle,
    setNoticeTitle,
    noticeContent,
    setNoticeContent,
    noticeList,
    saveNotice,
    deleteNotice,
    saveLoading,
    saveSuccess,
    approve,
    reject,
    ranking,
    distribution,
    allUsers,
    toggleUserVisibility,
    deleteUser,
    interactionMessages,
    deleteInteraction,
    saveAnswer,
  };
}
