"use client";

import { AdminUserStat } from "@/hooks/useAdminStats";
import { useUsers } from "@/hooks/useUsers";

interface Props {
  growthStats: AdminUserStat[];
}

export default function AdminStatisticsSection({
  growthStats,
}: Props) {

  /* 🔥 유저 닉네임 매핑 */
  const { userMap } = useUsers();

  const totalRanking =
    [...growthStats].sort(
      (a, b) => b.totalSolved - a.totalSolved
    );

  const weeklyRanking =
    [...growthStats].sort(
      (a, b) => b.weeklyDiff - a.weeklyDiff
    );

  const failedUsers =
    growthStats.filter(
      (s) => !s.isTodayApproved
    );

  const getName = (userId: string) =>
    userMap[userId]|| "Unknown";

  return (
    <div className="space-y-10">

      {/* 📈 성장 통계 카드 */}
      <div className="grid grid-cols-4 gap-6">

        <StatCard
          title="전체 누적 1위"
          value={totalRanking[0]?.totalSolved ?? 0}
          subtitle={
            totalRanking[0]
              ? getName(totalRanking[0].userId)
              : "-"
          }
        />

        <StatCard
          title="이번 주 성장 1위"
          value={weeklyRanking[0]?.weeklyDiff ?? 0}
          subtitle={
            weeklyRanking[0]
              ? getName(weeklyRanking[0].userId)
              : "-"
          }
        />

        <StatCard
          title="오늘 미달자"
          value={failedUsers.length}
          subtitle="명"
        />

        <StatCard
          title="총 사용자"
          value={growthStats.length}
          subtitle="명"
        />

      </div>

      {/* 📋 사용자 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">

          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">닉네임</th>
              <th className="p-4 text-center">누적</th>
              <th className="p-4 text-center">오늘</th>
              <th className="p-4 text-center">이번 주</th>
              <th className="p-4 text-center">목표</th>
            </tr>
          </thead>

          <tbody>
            {growthStats.map((s) => (
              <tr
                key={s.userId}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium">
                  {getName(s.userId)}
                </td>

                <td className="p-4 text-center">
                  {s.totalSolved}
                </td>

                <td className="p-4 text-center text-blue-600">
                  +{s.todayDiff}
                </td>

                <td className="p-4 text-center text-purple-600">
                  +{s.weeklyDiff}
                </td>

                <td
                  className={`p-4 text-center font-semibold ${
                    s.isTodayApproved
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {s.isTodayApproved
                    ? "달성"
                    : "미달"}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

/* 카드 컴포넌트 */

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="text-sm text-gray-500 mb-2">
        {title}
      </div>
      <div className="text-2xl font-bold">
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-1 truncate">
        {subtitle}
      </div>
    </div>
  );
}
