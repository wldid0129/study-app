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

type TabType =
  | "notice"
  | "attendance"
  | "pending"
  | "statistics"
  | "goals";

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] =
    useState<TabType>("attendance");

  const [selectedDate, setSelectedDate] =
    useState(new Date().toISOString().split("T")[0]);

  const admin = useAdmin(selectedDate);

  /* 🔥 searchParams는 effect 안에서만 사용 */
  useEffect(() => {
    const tab =
      (searchParams.get("tab") as TabType) ||
      "attendance";
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    router.replace(`?tab=${activeTab}`);
  }, [activeTab, router]);

  return (
    <div className="p-12 bg-gray-100 min-h-screen">
      <AdminHeader />

      <div className="flex gap-3 mt-8 mb-10">
        <button
          onClick={() => setActiveTab("notice")}
        >
          공지
        </button>

        <button
          onClick={() =>
            setActiveTab("attendance")
          }
        >
          출석
        </button>

        <button
          onClick={() =>
            setActiveTab("pending")
          }
        >
          승인대기
        </button>

        <button
          onClick={() =>
            setActiveTab("statistics")
          }
        >
          통계
        </button>
      </div>

      {activeTab === "notice" && (
        <NoticeManager
          noticeContent={admin.noticeContent}
          setNoticeContent={
            admin.setNoticeContent
          }
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
    </div>
  );
}
