"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
  onSnapshot,
  getDocs,
} from "firebase/firestore";

export function useAttendance(user: any) {

  const [attendanceMap, setAttendanceMap] =
    useState<Record<string, string>>({});

  const [totalMap, setTotalMap] =
    useState<Record<string, number>>({});

  const [streak, setStreak] = useState(0);

  // 🔥 목표 달성 인원 기준
  const [todayUserSuccessCount, setTodayUserSuccessCount] =
    useState(0);

  const [weeklyUserSuccessCount, setWeeklyUserSuccessCount] =
    useState(0);

  const [totalUserCount, setTotalUserCount] =
    useState(0);

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
    useState(new Date().toISOString().split("T")[0]);

  const [problemCount, setProblemCount] =
    useState<number>(0);

  /* ==============================
     전체 유저 수
  ============================== */

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      setTotalUserCount(snap.size);
    };
    fetchUsers();
  }, []);

  /* ==============================
     PERSONAL + 목표 계산
  ============================== */

  useEffect(() => {
    if (!user) return;

    const q = collection(db, "attendances");

    const unsub = onSnapshot(q, (snapshot) => {
      const map: any = {};
      const approvedDates: string[] = [];

      const today =
        new Date().toISOString().split("T")[0];

      const now = new Date();
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(
        now.getDate() - now.getDay()
      );

      // 🔥 유저별 누적 계산
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

          // 🔥 오늘 목표 달성 여부 판단은 개별 problemCount 기준
          if (d.date === today && d.problemCount > 0) {
            todaySuccessUsers.add(d.userId);
          }

          // 🔥 주간은 사용자별 누적
          const recordDate = new Date(d.date);
          if (recordDate >= firstDayOfWeek) {
            weeklyUserSum[d.userId] =
              (weeklyUserSum[d.userId] || 0) +
              (d.problemCount || 0);
          }
        }
      });

      // 🔥 주간 성공 유저 수 계산 (여기선 1 이상이면 성공 처리, 실제 기준은 GoalCard에서)
      const weeklySuccessCount =
        Object.keys(weeklyUserSum).length;

      setAttendanceMap(map);
      calculateStreak(approvedDates);

      setTodayUserSuccessCount(
        todaySuccessUsers.size
      );

      setWeeklyUserSuccessCount(
        weeklySuccessCount
      );
    });

    return () => unsub();
  }, [user]);

  /* ==============================
     LISTEN TOTAL (캘린더용)
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
    const today = new Date();
    let count = 0;

    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split("T")[0];

      if (dates.includes(key)) count++;
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
     SUBMIT
  ============================== */

  const handleAttendance = async () => {
    if (!file || !user) return;

    const todayReal =
      new Date().toISOString().split("T")[0];

    if (selectedDate > todayReal) {
      alert("미래 날짜는 선택 불가");
      return;
    }

    if (attendanceMap[selectedDate]) {
      alert("이미 출석 기록 존재");
      return;
    }

    setLoading(true);

    const imageUrl =
      await uploadToCloudinary(file);

    await addDoc(collection(db, "attendances"), {
      userId: user.uid,
      date: selectedDate,
      imageUrl,
      problemCount: problemCount || 0,
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
