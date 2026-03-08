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

      <motion.main 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6 py-8 md:p-10 lg:p-12 space-y-12"
      >
        {/* 1. DASHBOARD OVERVIEW */}
        <section className="space-y-10">
          {/* 🔥 Attendance (light) */}
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

          {/* 🔥 Notice */}
          <motion.div variants={item}>
            <NoticeCard />
          </motion.div>

          {/* 🔥 목표 영역 */}
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

          {/* 🔥 Streak + Calendar */}
          <motion.div variants={item} className="flex flex-col lg:flex-row gap-6 md:gap-10 items-stretch">
            <div className="flex-1 lg:max-w-sm">
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
                participantsMap={attendance.participantsMap}
                userMap={usersState.userMap}
                userCount={usersState.userCount}
                userId={authState.user?.uid}
                onOpenModal={() =>
                  attendance.setModalOpen(true)
                }
              />
            </div>
          </motion.div>

          {/* 🔥 Weekly Ranking */}
          <motion.div variants={item}>
            <WeeklyRankingCard
              ranking={ranking}
              userMap={usersState.userMap}
              userTotals={usersState.userTotals}
              currentUserId={authState.user?.uid}
            />
          </motion.div>

          {/* 🔥 Statistics */}
          <motion.div variants={item}>
            <StatisticsSection
              todayRate={statistics.todayRate}
              weeklyTop={statistics.weeklyTop}
              monthlyTop={statistics.monthlyTop}
            />
          </motion.div>
        </section>

        <InteractionBoard />
      </motion.main>

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
