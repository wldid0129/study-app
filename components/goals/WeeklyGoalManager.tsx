"use client";

import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WeeklyGoalManager() {
  const [content, setContent] = useState("");
  const [targetCount, setTargetCount] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    console.log("🔥 주간 목표 저장 클릭");

    if (!content.trim()) {
      alert("목표 내용을 입력하세요");
      return;
    }

    if (!startDate || !endDate) {
      alert("기간을 선택하세요");
      return;
    }

    if (!targetCount || targetCount <= 0) {
      alert("목표 문제 수를 입력하세요");
      return;
    }

    try {
      setSaving(true);

      // 🔥 기존 active weekly 비활성화
      const q = query(
        collection(db, "goals"),
        where("type", "==", "weekly"),
        where("active", "==", true)
      );

      const snap = await getDocs(q);

      for (const d of snap.docs) {
        await updateDoc(doc(db, "goals", d.id), {
          active: false,
        });
      }

      // 🔥 새 목표 저장
      await addDoc(collection(db, "goals"), {
        type: "weekly",
        content,
        targetCount,
        startDate,
        endDate,
        active: true,
        createdAt: serverTimestamp(),
      });

      console.log("✅ 주간 목표 저장 완료");

      alert("주간 목표 저장 완료");

      // 🔥 입력 초기화
      setContent("");
      setTargetCount(0);
      setStartDate("");
      setEndDate("");

    } catch (err) {
      console.error("❌ 주간 목표 저장 실패:", err);
      alert("저장 중 오류 발생");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow space-y-4">

      <h2 className="text-lg font-semibold">
        🎯 주간 목표 설정
      </h2>

      <input
        className="border p-2 w-full"
        placeholder="목표 내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input
        type="number"
        className="border p-2 w-full"
        placeholder="목표 문제 수"
        value={targetCount || ""}
        onChange={(e) =>
          setTargetCount(Number(e.target.value))
        }
      />

      <div className="flex gap-4">
        <input
          type="date"
          className="border p-2"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={`px-4 py-2 rounded text-white transition ${
          saving
            ? "bg-gray-400"
            : "bg-black hover:bg-gray-800"
        }`}
      >
        {saving ? "저장 중..." : "저장"}
      </button>

    </div>
  );
}

