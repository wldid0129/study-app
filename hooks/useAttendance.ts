"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export function useAttendance(user: any) {

  /* ==============================
     🔥 날짜 포맷
  ============================== */

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  /* ==============================
     🔥 상태 선언 (CalendarCard용 포함)
  ============================== */

  const [attendanceMap, setAttendanceMap] =
    useState<Record<string, string>>({});

  const [totalMap, setTotalMap] =
    useState<Record<string, number>>({});

  const [participantsMap, setParticipantsMap] =
    useState<Record<string, string[]>>({});

  const [activeTab, setActiveTab] =
    useState<"total" | "personal" | "history">("total");

  const [currentMonth, setCurrentMonth] =
    useState(new Date());

  const [streak, setStreak] =
    useState(0);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [file, setFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [selectedDate, setSelectedDate] =
    useState(formatDate(new Date()));

  const [problemCount, setProblemCount] =
    useState<number>(0);

  /* ==============================
     🔥 SNAPSHOT
  ============================== */

  useEffect(() => {
    if (!user?.uid) return;

    const q = collection(db, "attendances");

    const unsub = onSnapshot(q, (snapshot) => {
      const personalMap: Record<string, string> = {};
      const approvedDates: string[] = [];
      const totalDateMap: Record<string, number> = {};
      const dateParticipants: Record<string, string[]> = {};

      snapshot.forEach((doc) => {
        const d = doc.data();
        if (!d.date || !d.userId) return;

        const normalizedDate =
          formatDate(parseDate(d.date));

        // 개인 기록
        if (d.userId === user.uid) {
          personalMap[normalizedDate] =
            d.status;

          if (d.status === "approved") {
            approvedDates.push(normalizedDate);
          }
        }

        // 전체 승인 집계 (Calendar total탭용)
        if (d.status === "approved") {
          totalDateMap[normalizedDate] =
            (totalDateMap[normalizedDate] || 0) + 1;
          if (!dateParticipants[normalizedDate]) {
            dateParticipants[normalizedDate] = [];
          }
          if (!dateParticipants[normalizedDate].includes(d.userId)) {
            dateParticipants[normalizedDate].push(d.userId);
          }
        }
      });

      setAttendanceMap(personalMap);
      setTotalMap(totalDateMap);
      setParticipantsMap(dateParticipants);
      calculateStreak(approvedDates);
    });

    return () => unsub();
  }, [user]);

  /* ==============================
     🔥 STREAK
  ============================== */

  const calculateStreak = (dates: string[]) => {
    if (!dates.length) {
      setStreak(0);
      return;
    }

    const dateSet = new Set(dates);

    const today = new Date();
    const todayKey = formatDate(today);

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = formatDate(yesterday);

    let startDate: Date | null = null;

    if (dateSet.has(todayKey)) {
      startDate = today;
    } else if (dateSet.has(yesterdayKey)) {
      startDate = yesterday;
    } else {
      setStreak(0);
      return;
    }

    let count = 0;

    for (let i = 0; i < 365; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() - i);
      const key = formatDate(d);

      if (dateSet.has(key)) count++;
      else break;
    }

    setStreak(count);
  };

  /* ==============================
     🔥 CLOUDINARY
  ============================== */

  const uploadToCloudinary = (file: File) => {
    return new Promise<string>((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", "attendance_preset");

      xhr.open(
        "POST",
        "https://api.cloudinary.com/v1_1/duu9ene1v/image/upload"
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(
            Math.round((e.loaded / e.total) * 100)
          );
        }
      };

      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      };

      xhr.send(formData);
    });
  };

  /* ==============================
     🔥 SUBMIT (diff 기반 승인)
  ============================== */

  const handleAttendance = async () => {
    if (!file || !user?.uid) return;

    const todayReal =
      formatDate(new Date());

    if (selectedDate > todayReal) {
      alert("미래 날짜는 선택 불가");
      return;
    }

    if (attendanceMap[selectedDate]) {
      alert("이미 출석 기록 존재");
      return;
    }

    if (problemCount <= 0) {
      alert("누적 문제 수를 입력하세요.");
      return;
    }

    setLoading(true);

    const imageUrl =
      await uploadToCloudinary(file);

    /* 🔥 이전 최고 누적값 조회 */

    let previousValue = 0;

    const prevQuery = query(
      collection(db, "attendances"),
      where("userId", "==", user.uid),
      where("status", "==", "approved"),
      orderBy("problemCount", "desc"),
      limit(1)
    );

    const prevSnap =
      await getDocs(prevQuery);

    if (!prevSnap.empty) {
      previousValue =
        prevSnap.docs[0].data()
          .problemCount;
    }

    const diff =
      Number(problemCount) -
      previousValue;

    if (diff < 0) {
      alert(
        "누적 문제 수는 이전 기록보다 작을 수 없습니다."
      );
      setLoading(false);
      return;
    }

    /* 🔥 목표 설정 확인 */

    let status: "approved" | "pending" =
      "approved";

    const settingSnap = await getDoc(
      doc(db, "settings", "system")
    );

    if (settingSnap.exists()) {
      const settingData =
        settingSnap.data();

      if (
        settingData.dailyGoalEnabled &&
        diff <
        settingData.dailyGoalValue
      ) {
        status = "pending";
      }
    }

    await addDoc(
      collection(db, "attendances"),
      {
        userId: user.uid,
        date: selectedDate,
        imageUrl,
        problemCount:
          Number(problemCount),
        status,
        createdAt:
          serverTimestamp(),
      }
    );

    /* 🔥 viewer 권한이면 user로 승급 */
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().role === "viewer") {
      await updateDoc(userRef, { role: "user" });
    }

    setLoading(false);
    setModalOpen(false);
    setFile(null);
    setPreviewUrl(null);
    setProblemCount(0);
  };

  return {
    attendanceMap,
    totalMap,
    participantsMap,
    activeTab,
    setActiveTab,
    currentMonth,
    setCurrentMonth,
    streak,
    modalOpen,
    setModalOpen,
    file,
    setFile,
    previewUrl,
    setPreviewUrl,
    loading,
    progress,
    fileInputRef,
    selectedDate,
    setSelectedDate,
    problemCount,
    setProblemCount,
    handleAttendance,
  };
}
