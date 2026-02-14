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

export default function DailyGoalManager() {
  const [content, setContent] = useState("");
  const [targetCount, setTargetCount] = useState<number>(0);
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    console.log("🔥 일일 목표 저장 클릭");

    if (!content.trim()) {
      alert("목표 내용을 입력하세요");
      return;
    }

    if (!date) {
      alert("날짜를 선택하세요");
      return;
    }

    if (!targetCount || targetCount <= 0) {
      alert("목표 문제 수를 입력하세요");
      return;
    }

    try {
      setSaving(true);

      const q = query(
        collection(db, "goals"),
        where("type", "==", "daily"),
        where("active", "==", true)
      );

      const snap = await getDocs(q);

      for (const d of snap.docs) {
        await updateDoc(doc(db, "goals", d.id), {
          active: false,
        });
      }

      await addDoc(collection(db, "goals"), {
        type: "daily",
        content,
        targetCount,
        startDate: date,
        endDate: date,
        active: true,
        createdAt: serverTimestamp(),
      });

      alert("일일 목표 저장 완료");

      setContent("");
      setTargetCount(0);
      setDate("");

    } catch (err) {
      console.error("❌ 일일 목표 저장 실패:", err);
      alert("저장 중 오류 발생");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow space-y-4">

      <h2 className="text-lg font-semibold">
        📌 일일 목표 설정
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

      <input
        type="date"
        className="border p-2"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

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
