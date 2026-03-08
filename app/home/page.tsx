"use client";

import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";

import Header from "@/components/ui/Header";
import NoticeCard from "@/components/home/NoticeCard";
import AttendanceLightCard from "@/components/home/AttendanceLightCard";
import StreakCard from "@/components/home/StreakCard";
import CalendarCard from "@/components/home/CalendarCard";
import UploadModal from "@/components/home/UploadModal";
import StatisticsSection from "@/components/home/StatisticsSection";
import InteractionBoard from "@/components/home/InteractionBoard";
import QuickLinksHub from "@/components/home/QuickLinksHub";

import { useAuth } from "@/hooks/useAuth";
import { useAttendance } from "@/hooks/useAttendance";
import { useNotice } from "@/hooks/useNotice";
import { useStatistics } from "@/hooks/useStatistics";
import { useUsers } from "@/hooks/useUsers";

import WeeklyGoalCard from "@/components/goals/WeeklyGoalCard";
import DailyGoalCard from "@/components/goals/DailyGoalCard";
import GoalMaintenanceCard from "@/components/goals/GoalMaintenanceCard";
import { useGoals } from "@/hooks/useGoals";

import { useWeeklyRanking } from "@/hooks/useWeeklyRanking";
import WeeklyRankingCard from "@/components/home/WeeklyRankingCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

export default function HomePage() {
  const authState = useAuth();
  const attendance = useAttendance(authState.user);
  const noticeState = useNotice();
  const usersState = useUsers();
  const ranking = useWeeklyRanking();

  const {
    weeklyGoal,
    dailyGoal,
    isDailySuccess,
    isWeeklySuccess,
    isDailyActive,
    isWeeklyActive,
  } = useGoals(authState.user?.uid);

  useEffect(() => {
    const fetchUsers = async () => {
      await getDocs(collection(db, "users"));
    };
    fetchUsers();
  }, []);

  const statistics = useStatistics(
    usersState.userCount,
    usersState.userMap
  );

  return (
    <div className="bg-mesh min-h-screen pb-24 selection:bg-brand/10 selection:text-brand">
      <Header
        user={authState.user}
        onLogout={authState.logout}
      />

      {/* spacer for fixed Header (Mobile: 200px, Desktop: 112px) */}
      <div className="h-[200px] md:h-28" />

      <div className="relative">
        {/* ====== 좌측 사이드바: AI 뉴스 & 트렌드 ====== */}
        <div className="hidden min-[1700px]:block fixed left-10 top-1/2 -translate-y-1/2 z-20">
          <QuickLinksHub side="left" />
        </div>

        {/* ====== 우측 사이드바: 공모전 & 채용 ====== */}
        <div className="hidden min-[1700px]:block fixed right-10 top-1/2 -translate-y-1/2 z-20">
          <QuickLinksHub side="right" />
        </div>

        <motion.main
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto px-6 py-6 md:p-10 lg:p-12 space-y-10"
        >
          {/* ====== ROW 0: 모바일용 퀵 링크 (AI 뉴스 & Career Hub) ====== */}
          <motion.div variants={item} className="min-[1700px]:hidden space-y-8 pb-4 border-b border-gray-50 mb-4">
            <QuickLinksHub side="left" mobile />
            <QuickLinksHub side="right" mobile />
          </motion.div>

          {/* ====== ROW 1: 출석 인증 배너 (전체 폭) ====== */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <AttendanceLightCard
              user={authState.user}
              streak={attendance.streak}
              onOpenModal={() => attendance.setModalOpen(true)}
            />
          </motion.div>

          {/* ====== ROW 2: 스트릭 + 공지사항 (사이드 바이 사이드) ====== */}
          <motion.div variants={item} className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch">
            <div className="flex-shrink-0 lg:w-[280px]">
              <StreakCard streak={attendance.streak} />
            </div>
            <div className="flex-1 min-w-0">
              <NoticeCard />
            </div>
          </motion.div>

          {/* ====== ROW 3: 주간 + 일일 목표 (2등분) ====== */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div>
              {!isWeeklyActive ? (
                <GoalMaintenanceCard title="주간 목표 점검 중" />
              ) : (
                <WeeklyGoalCard
                  goal={weeklyGoal}
                  isSuccess={isWeeklySuccess}
                />
              )}
            </div>
            <div>
              {!isDailyActive ? (
                <GoalMaintenanceCard title="일일 목표 점검 중" />
              ) : (
                <DailyGoalCard
                  goal={dailyGoal}
                  isSuccess={isDailySuccess}
                />
              )}
            </div>
          </motion.div>

          {/* ====== ROW 4: 출석 달력 (전체 폭) ====== */}
          <motion.div variants={item}>
            <CalendarCard
              currentMonth={attendance.currentMonth}
              setCurrentMonth={attendance.setCurrentMonth}
              activeTab={attendance.activeTab}
              setActiveTab={attendance.setActiveTab}
              attendanceMap={attendance.attendanceMap}
              totalMap={attendance.totalMap}
              participantsMap={attendance.participantsMap}
              userMap={usersState.userMap}
              userCount={usersState.userCount}
              userId={authState.user?.uid}
              onOpenModal={() =>
                attendance.setModalOpen(true)
              }
            />
          </motion.div>

          {/* ====== ROW 5: 주간 랭킹 (전체 폭) ====== */}
          <motion.div variants={item}>
            <WeeklyRankingCard
              ranking={ranking}
              userMap={usersState.userMap}
              userTotals={usersState.userTotals}
              currentUserId={authState.user?.uid}
            />
          </motion.div>

          {/* ====== ROW 6: 통계 (전체 폭, 내부 3등분) ====== */}
          <motion.div variants={item}>
            <StatisticsSection
              todayRate={statistics.todayRate}
              weeklyTop={statistics.weeklyTop}
              monthlyTop={statistics.monthlyTop}
            />
          </motion.div>

          {/* ====== ROW 6: 소통 게시판 (전체 폭) ====== */}
          <InteractionBoard />
        </motion.main>
      </div>


      {/* 🔥 UploadModal */}
      <UploadModal
        modalOpen={attendance.modalOpen}
        onClose={() =>
          attendance.setModalOpen(false)
        }
        onSubmit={attendance.handleAttendance}
        selectedDate={attendance.selectedDate}
        setSelectedDate={
          attendance.setSelectedDate
        }
        file={attendance.file}
        setFile={attendance.setFile}
        previewUrl={attendance.previewUrl}
        setPreviewUrl={
          attendance.setPreviewUrl
        }
        loading={attendance.loading}
        progress={attendance.progress}
        fileInputRef={attendance.fileInputRef}
        problemCount={attendance.problemCount}
        setProblemCount={
          attendance.setProblemCount
        }
      />
    </div>
  );
}
