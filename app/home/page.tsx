"use client";

import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";

import Header from "@/components/ui/Header";
import NoticeCard from "@/components/home/NoticeCard";
import StreakCard from "@/components/home/StreakCard";
import CalendarCard from "@/components/home/CalendarCard";
import UploadModal from "@/components/home/UploadModal";
import StatisticsSection from "@/components/home/StatisticsSection";

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

  /* =========================
     USER COUNT (기존 유지)
  ========================= */
  useEffect(() => {
    const fetchUsers = async () => {
      await getDocs(collection(db, "users"));
    };
    fetchUsers();
  }, []);

  /* =========================
     STATISTICS
  ========================= */
  const statistics = useStatistics(
    usersState.userCount,
    usersState.userMap
  );

  return (
    <div className="bg-[#f4f6f9] min-h-screen">
      <Header
        user={authState.user}
        onLogout={authState.logout}
      />

      <div className="p-12">

        {/* 🔥 Notice */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <NoticeCard notice={noticeState.notice} />
        </motion.div>

        {/* 🔥 목표 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex gap-8 mt-8 items-stretch"
        >
          <div className="flex-1">
            {!isWeeklyActive ? (
              <GoalMaintenanceCard title="주간 목표 점검 중" />
            ) : (
              <WeeklyGoalCard
                goal={weeklyGoal}
                isSuccess={isWeeklySuccess}
              />
            )}
          </div>

          <div className="flex-1">
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

        {/* 🔥 Streak + Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex gap-10 mt-10 items-stretch"
        >
          <div className="flex-1 min-w-[300px]">
            <StreakCard streak={attendance.streak} />
          </div>

          <div className="flex-[2]">
            <CalendarCard
              currentMonth={attendance.currentMonth}
              setCurrentMonth={attendance.setCurrentMonth}
              activeTab={attendance.activeTab}
              setActiveTab={attendance.setActiveTab}
              attendanceMap={attendance.attendanceMap}
              totalMap={attendance.totalMap}
              userCount={usersState.userCount}
              userId={authState.user?.uid}
              onOpenModal={() =>
                attendance.setModalOpen(true)
              }
            />
          </div>
        </motion.div>

        {/* 🔥 Weekly Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="mt-8"
        >
          <WeeklyRankingCard
            ranking={ranking}
            userMap={usersState.userMap}
            currentUserId={authState.user?.uid}
          />
        </motion.div>

        {/* 🔥 Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-16"
        >
          <StatisticsSection
            todayRate={statistics.todayRate}
            weeklyTop={statistics.weeklyTop}
            monthlyTop={statistics.monthlyTop}
          />
        </motion.div>

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
