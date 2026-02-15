"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminStats } from "@/hooks/useAdminStats";

import AdminHeader from "@/components/admin/AdminHeader";
import NoticeManager from "@/components/admin/NoticeManager";
import AttendanceBoard from "@/components/admin/AttendanceBoard";
import PendingSection from "@/components/admin/PendingSection";
import AdminStatisticsSection from "@/components/admin/AdminStatisticsSection";

import DailyGoalManager from "@/components/goals/DailyGoalManager";
import WeeklyGoalManager from "@/components/goals/WeeklyGoalManager";

type TabType =
  | "notice"
  | "attendance"
  | "goal"
  | "pending"
  | "statistics";

type GoalTabType = "daily" | "weekly";

export default function AdminClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] =
    useState<TabType>("attendance");

  const [goalTab, setGoalTab] =
    useState<GoalTabType>("daily");

  const [selectedDate, setSelectedDate] =
    useState(
      new Date().toISOString().split("T")[0]
    );

  /* =============================
     🔥 기존 관리자 로직
  ============================= */

  const admin = useAdmin(selectedDate);

  /* =============================
     🔥 성장 통계 로직
  ============================= */

  const adminStats = useAdminStats();

  /* =============================
     URL → state 동기화
  ============================= */

  useEffect(() => {
    const tab =
      (searchParams.get("tab") as TabType) ||
      "attendance";
    setActiveTab(tab);
  }, [searchParams]);

  /* =============================
     state → URL 동기화
  ============================= */

  useEffect(() => {
    router.replace(`?tab=${activeTab}`);
  }, [activeTab, router]);

  /* =============================
     상위 탭 목록
  ============================= */

  const tabs: { key: TabType; label: string }[] = [
    { key: "notice", label: "공지" },
    { key: "attendance", label: "출석" },
    { key: "goal", label: "목표" },
    { key: "pending", label: "승인대기" },
    { key: "statistics", label: "통계" },
  ];

  /* =============================
     탭 렌더링
  ============================= */

  const renderContent = () => {
    switch (activeTab) {

      case "notice":
        return (
          <NoticeManager
            noticeContent={admin.noticeContent}
            setNoticeContent={admin.setNoticeContent}
            onSave={admin.saveNotice}
          />
        );

      case "attendance":
        return (
          <AttendanceBoard
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            list={admin.attendanceStatusList}
          />
        );

      case "goal":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm">

            {/* Goal 서브탭 */}
            <div className="flex gap-3 mb-6 border-b pb-4">
              {[
                { key: "daily", label: "Daily Goal" },
                { key: "weekly", label: "Weekly Goal" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() =>
                    setGoalTab(
                      tab.key as GoalTabType
                    )
                  }
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${
                      goalTab === tab.key
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {goalTab === "daily" && (
              <DailyGoalManager />
            )}
            {goalTab === "weekly" && (
              <WeeklyGoalManager />
            )}

          </div>
        );

      case "pending":
        return (
          <PendingSection
            list={admin.pendingList}
            onApprove={admin.approve}
            onReject={admin.reject}
          />
        );

      case "statistics":
        return (
          <AdminStatisticsSection
            growthStats={adminStats}
          />
        );

      default:
        return null;
    }
  };

  /* =============================
     렌더링
  ============================= */

  return (
    <div className="min-h-screen bg-gray-100 p-12">

      <AdminHeader />

      {/* 상위 탭 */}
      <div className="flex flex-wrap gap-3 mt-8 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setActiveTab(tab.key)
            }
            className={`px-5 py-2 rounded-lg font-medium transition-all duration-200
              ${
                activeTab === tab.key
                  ? "bg-black text-white shadow-md scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 본문 */}
      <div className="transition-all duration-300">
        {renderContent()}
      </div>

    </div>
  );
}
