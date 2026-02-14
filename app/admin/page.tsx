"use client";
export const dynamic = "force-dynamic";


import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";

import AdminHeader from "@/components/admin/AdminHeader";
import NoticeManager from "@/components/admin/NoticeManager";
import AttendanceBoard from "@/components/admin/AttendanceBoard";
import PendingSection from "@/components/admin/PendingSection";
import AdminStatisticsSection from "@/components/admin/AdminStatisticsSection";

import WeeklyGoalManager from "@/components/goals/WeeklyGoalManager";
import DailyGoalManager from "@/components/goals/DailyGoalManager";

type TabType =
  | "notice"
  | "attendance"
  | "pending"
  | "statistics"
  | "goals";



export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab =
    (searchParams.get("tab") as TabType) || "attendance";

  const [activeTab, setActiveTab] =
    useState<TabType>(initialTab);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const admin = useAdmin(selectedDate);

  useEffect(() => {
    router.replace(`?tab=${activeTab}`);
  }, [activeTab, router]);

  const tabStyle = (tab: TabType) =>
    `relative px-5 py-2 rounded-full text-sm font-medium transition ${
      activeTab === tab
        ? "bg-black text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <div className="p-12 bg-gray-100 min-h-screen">

      <AdminHeader />

      {/* 🔥 탭 버튼 영역 */}
      <div className="flex gap-3 mt-8 mb-10 flex-wrap">

        <button
          className={tabStyle("notice")}
          onClick={() => setActiveTab("notice")}
        >
          📢 공지
        </button>

        <button
          className={tabStyle("attendance")}
          onClick={() => setActiveTab("attendance")}
        >
          📅 출석
        </button>

        <button
          className={tabStyle("pending")}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ 승인 대기

          {admin.pendingList.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {admin.pendingList.length}
            </span>
          )}
        </button>

        <button
          className={tabStyle("statistics")}
          onClick={() => setActiveTab("statistics")}
        >
          📊 통계
        </button>

        {/* 🔥 추가된 목표 탭 */}
        <button
          className={tabStyle("goals")}
          onClick={() => setActiveTab("goals")}
        >
          🎯 목표 관리
        </button>

      </div>

      {/* 🔥 탭 컨텐츠 */}

      <div className="transition-opacity duration-200">

        {activeTab === "notice" && (
          <NoticeManager
            noticeContent={admin.noticeContent}
            setNoticeContent={admin.setNoticeContent}
            onSave={admin.saveNotice}
          />
        )}

        {activeTab === "attendance" && (
          <AttendanceBoard
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            list={admin.attendanceStatusList}
          />
        )}

        {activeTab === "pending" && (
          <PendingSection
            list={admin.pendingList}
            onApprove={admin.approve}
            onReject={admin.reject}
          />
        )}

        {activeTab === "statistics" && (
          <AdminStatisticsSection
            ranking={admin.ranking}
            distribution={admin.distribution}
          />
        )}

        {/* 🔥 목표 관리 영역 */}
        {activeTab === "goals" && (
          <div className="space-y-8">
            <WeeklyGoalManager />
            <DailyGoalManager />
          </div>
        )}

      </div>

    </div>
  );
}

