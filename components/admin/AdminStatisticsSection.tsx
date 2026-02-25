"use client";

import { AdminUserStat } from "@/hooks/useAdminStats";
import { useUsers } from "@/hooks/useUsers";
import { Trash2, AlertCircle } from "lucide-react";

interface Props {
  growthStats: AdminUserStat[];
  onDeleteUser?: (userId: string) => void;
}

export default function AdminStatisticsSection({
  growthStats,
  onDeleteUser,
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
    userMap[userId] || "Unknown";

  return (
    <div className="space-y-10">

      {/* 📈 성장 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="전체 누적 1위"
          value={totalRanking[0]?.totalSolved ?? 0}
          subtitle={
            totalRanking[0]
              ? getName(totalRanking[0].userId)
              : "-"
          }
          color="indigo"
        />

        <StatCard
          title="이번 주 성장 1위"
          value={weeklyRanking[0]?.weeklyDiff ?? 0}
          subtitle={
            weeklyRanking[0]
              ? getName(weeklyRanking[0].userId)
              : "-"
          }
          color="purple"
        />

        <StatCard
          title="오늘 미달자"
          value={failedUsers.length}
          subtitle="명"
          color="rose"
        />

        <StatCard
          title="총 사용자"
          value={growthStats.length}
          subtitle="명"
          color="emerald"
        />
      </div>

      {/* 📋 사용자 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle size={18} className="text-indigo-500" />
            사용자별 상세 통계
          </h3>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Data real-time update
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50">
                <th className="p-5 text-left">닉네임</th>
                <th className="p-5 text-center">누적 해결</th>
                <th className="p-5 text-center">오늘</th>
                <th className="p-5 text-center">이번 주</th>
                <th className="p-5 text-center">미션 상태</th>
                <th className="p-5 text-right">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {growthStats.map((s) => {
                const name = getName(s.userId);
                const isUnknown = name === "Unknown";

                return (
                  <tr
                    key={s.userId}
                    className="hover:bg-gray-50/50 transition group"
                  >
                    <td className={`p-5 font-bold ${isUnknown ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                      {name}
                    </td>

                    <td className="p-5 text-center font-medium text-gray-600">
                      {s.totalSolved.toLocaleString()}
                    </td>

                    <td className="p-5 text-center text-blue-600 font-black">
                      +{s.todayDiff}
                    </td>

                    <td className="p-5 text-center text-purple-600 font-black">
                      +{s.weeklyDiff}
                    </td>

                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${s.isTodayApproved
                          ? "bg-green-50 text-green-600 border border-green-100"
                          : "bg-red-50 text-red-500 border border-red-100"
                        }`}>
                        {s.isTodayApproved ? "SUCCESS" : "WAITING"}
                      </span>
                    </td>

                    <td className="p-5 text-right">
                      {isUnknown && onDeleteUser && (
                        <button
                          onClick={() => onDeleteUser(s.userId)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1 ml-auto text-[10px] font-bold"
                          title="유령 계정 삭제"
                        >
                          <Trash2 size={14} />
                          DELETE
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* 카드 컴포넌트 */

function StatCard({
  title,
  value,
  subtitle,
  color = "indigo"
}: {
  title: string;
  value: number;
  subtitle: string;
  color?: "indigo" | "purple" | "rose" | "emerald";
}) {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        {title}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-black text-gray-900 tracking-tight">
          {value.toLocaleString()}
        </div>
        <div className="text-xs font-bold text-gray-400">
          {subtitle === "명" ? "명" : ""}
        </div>
      </div>
      {subtitle !== "명" && (
        <div className={`mt-3 inline-block px-3 py-0.5 rounded-full text-[10px] font-black border ${colors[color]}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
