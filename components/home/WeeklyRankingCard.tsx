"use client";

import TierBadge from "@/components/ui/TierBadge";
import { useTheme } from "@/context/ThemeContext";

interface RankingItem {
  userId: string;
  total: number;
}

export default function WeeklyRankingCard({
  ranking,
  userMap,
  userTotals,
  currentUserId,
}: {
  ranking: RankingItem[];
  userMap: Record<string, string>;
  userTotals: Record<string, number>;
  currentUserId?: string;
}) {
  const { currentColors } = useTheme();
  const top3 = ranking.slice(0, 3);

  const myRank =
    ranking.findIndex(
      (item) => item.userId === currentUserId
    ) + 1;

  return (
    <div className="bg-white p-8 rounded-2xl shadow border border-gray-200">

      <div className="text-sm text-gray-500 mb-4">
        🏆 이번 주 누적 랭킹
      </div>

      {ranking.length === 0 && (
        <div className="text-sm text-gray-400">
          이번 주 데이터가 아직 없습니다.
        </div>
      )}

      {/* 🔥 Top 3 */}
      <div className="space-y-4">
        {top3.map((item, index) => {
          const isMe =
            item.userId === currentUserId;

          return (
            <div
              key={item.userId}
              className={`flex justify-between items-center p-3 rounded-lg transition
                ${index === 0 ? "bg-yellow-50 border border-yellow-300 shadow-md" : ""}
                ${isMe ? "border" : ""}
              `}
              style={{
                backgroundColor: index === 0 ? undefined : isMe ? currentColors.light : "transparent",
                borderColor: index === 0 ? undefined : isMe ? currentColors.shades?.[20] : "transparent",
                borderStyle: (index === 0 || isMe) ? "solid" : "none",
                borderWidth: "1px"
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                </span>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 font-medium">
                      {userMap[item.userId] || item.userId}
                    </span>
                    <TierBadge count={userTotals[item.userId] || 0} />
                  </div>
                  {isMe && <span className="text-[10px] text-blue-500 font-bold">YOU</span>}
                </div>
              </div>

              <div className="text-sm font-semibold">
                +{item.total}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 내 순위 표시 (Top3 밖일 경우) */}
      {myRank > 3 && (
        <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-300 text-sm flex justify-between">
          <div className="flex items-center gap-2">
            <span>
              내 순위: {myRank}위 ({userMap[currentUserId || ""] || currentUserId})
            </span>
            <TierBadge count={userTotals[currentUserId || ""] || 0} />
          </div>
          <span>
            +
            {
              ranking.find(
                (r) =>
                  r.userId === currentUserId
              )?.total
            }
          </span>
        </div>
      )}
    </div>
  );
}
