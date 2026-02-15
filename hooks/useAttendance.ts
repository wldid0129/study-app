"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

export function useAttendance(user: any) {
  /* ==============================
     날짜 포맷 (KST)
  ============================== */
  const formatDate = (date: Date) =>
    date.toLocaleDateString("sv-SE");

  /* ============================== */

  const [attendanceMap, setAttendanceMap] =
    useState<Record<string, string>>({});

  const [totalMap, setTotalMap] =
    useState<Record<string, number>>({});

  const [streak, setStreak] = useState(0);

  const [todayUserSuccessCount, setTodayUserSuccessCount] =
    useState(0);

  const [weeklyUserSuccessCount, setWeeklyUserSuccessCount] =
    useState(0);

  const [totalUserCount, setTotalUserCount] =
    useState(11); // 🔥 고정

  const [activeTab, setActiveTab] =
    useState<"total" | "personal">("total");

  const [currentMonth, setCurrentMonth] =
    useState(new Date());

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
     PERSONAL + 목표 계산
  ============================== */

  useEffect(() => {
    if (!user) return;

    const q = collection(db, "attendances");

    const unsub = onSnapshot(q, (snapshot) => {
      const map: any = {};
      const approvedDates: string[] = [];

      const today = formatDate(new Date());

      const now = new Date();
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(
        now.getDate() - now.getDay()
      );

      const todaySuccessUsers = new Set<string>();
      const weeklyUserSum: Record<string, number> = {};

      snapshot.forEach((doc) => {
        const d = doc.data();

        if (d.userId === user.uid) {
          map[d.date] = d.status;
          if (d.status === "approved") {
            approvedDates.push(d.date);
          }
        }

        if (d.status === "approved") {
          if (d.date === today && d.problemCount > 0) {
            todaySuccessUsers.add(d.userId);
          }

          const recordDate = new Date(d.date);
          if (recordDate >= firstDayOfWeek) {
            weeklyUserSum[d.userId] =
              (weeklyUserSum[d.userId] || 0) +
              (d.problemCount || 0);
          }
        }
      });

      setAttendanceMap(map);
      calculateStreak(approvedDates);
      setTodayUserSuccessCount(todaySuccessUsers.size);
      setWeeklyUserSuccessCount(
        Object.keys(weeklyUserSum).length
      );
    });

    return () => unsub();
  }, [user]);

  /* ==============================
     LISTEN TOTAL
  ============================== */

  useEffect(() => {
    const q = collection(db, "attendances");

    const unsub = onSnapshot(q, (snapshot) => {
      const map: any = {};
      snapshot.forEach((doc) => {
        const d = doc.data();
        if (d.status === "approved") {
          map[d.date] =
            (map[d.date] || 0) + 1;
        }
      });
      setTotalMap(map);
    });

    return () => unsub();
  }, []);

  /* ==============================
     STREAK
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

    let currentDate: Date;

    if (dateSet.has(todayKey)) {
      currentDate = today;
    } else if (dateSet.has(yesterdayKey)) {
      currentDate = yesterday;
    } else {
      setStreak(0);
      return;
    }

    let count = 0;

    for (let i = 0; i < 365; i++) {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() - i);
      const key = formatDate(d);

      if (dateSet.has(key)) count++;
      else break;
    }

    setStreak(count);
  };

  /* ==============================
     CLOUDINARY
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
        if (e.lengthComputable)
          setProgress(
            Math.round((e.loaded / e.total) * 100)
          );
      };

      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      };

      xhr.send(formData);
    });
  };

  /* ==============================
     SUBMIT (🔥 핵심 수정)
  ============================== */

  console.log("현재 problemCount:", problemCount);

  const handleAttendance = async () => {
    if (!file || !user) return;

    const todayReal = formatDate(new Date());

    if (selectedDate > todayReal) {
      alert("미래 날짜는 선택 불가");
      return;
    }

    if (attendanceMap[selectedDate]) {
      alert("이미 출석 기록 존재");
      return;
    }

    if (problemCount <= 0) {
      alert("총 문제 개수를 입력하세요.");
      return;
    }

    // 🔥 제출 시점 값 고정
    const solvedAtSubmit = Number(problemCount);

    console.log("저장될 문제 개수:", solvedAtSubmit);

    setLoading(true);

    const imageUrl =
      await uploadToCloudinary(file);

    await addDoc(collection(db, "attendances"), {
      userId: user.uid,
      date: selectedDate,
      imageUrl,
      problemCount: solvedAtSubmit,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setLoading(false);
    setModalOpen(false);
    setFile(null);
    setPreviewUrl(null);
    setProblemCount(0);
  };

  return {
    attendanceMap,
    totalMap,
    streak,
    todayUserSuccessCount,
    weeklyUserSuccessCount,
    totalUserCount,
    activeTab,
    setActiveTab,
    currentMonth,
    setCurrentMonth,
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
