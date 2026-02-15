"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WeeklyGoalManager() {
  const [targetCount, setTargetCount] =
    useState<number>(10);

  const [goalId, setGoalId] =
    useState<string | null>(null);

  const [active, setActive] =
    useState<boolean>(true);

  const [saving, setSaving] =
    useState(false);

  /* =========================
     기존 목표 불러오기
  ========================= */

  useEffect(() => {
    const fetchGoal = async () => {
      const q = query(
        collection(db, "goals"),
        where("type", "==", "weekly"),
        where("active", "==", true)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        const docData = snap.docs[0];
        const data = docData.data();

        setGoalId(docData.id);
        setTargetCount(data.targetCount || 10);
        setActive(true);
      }
    };

    fetchGoal();
  }, []);

  /* =========================
     저장
  ========================= */

  const handleSave = async () => {
    if (targetCount <= 0) {
      alert("목표 수를 입력하세요");
      return;
    }

    try {
      setSaving(true);

      if (goalId) {
        await updateDoc(
          doc(db, "goals", goalId),
          {
            targetCount,
            content: `주간 목표: 누적 +${targetCount}`,
            active,
            updatedAt: serverTimestamp(),
          }
        );
      } else {
        await addDoc(collection(db, "goals"), {
          type: "weekly",
          targetCount,
          content: `주간 목표: 누적 +${targetCount}`,
          active,
          createdAt: serverTimestamp(),
        });
      }

      alert("주간 목표 저장 완료");
    } catch (err) {
      console.error(err);
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow space-y-6">

      <h2 className="text-lg font-semibold">
        🎯 주간 목표 설정
      </h2>

      <div>
        <label className="text-sm text-gray-500">
          목표 문제 수 (주간 누적 증가량)
        </label>
        <input
          type="number"
          min={1}
          className="border p-2 w-full mt-2 rounded"
          value={targetCount}
          onChange={(e) =>
            setTargetCount(
              Number(e.target.value)
            )
          }
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) =>
            setActive(e.target.checked)
          }
        />
        <span className="text-sm">
          목표 활성화
        </span>
      </div>

      <button
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
