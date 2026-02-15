"use client";

interface RankingItem {
  userId: string;
  total: number;
}

export default function WeeklyRankingCard({
  ranking,
  userMap,
  currentUserId,
}: {
  ranking: RankingItem[];
  userMap: Record<string, string>;
  currentUserId?: string;
}) {
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
                ${
                  index === 0
                    ? "bg-yellow-50 border border-yellow-300 shadow-md"
                    : ""
                }
                ${
                  isMe
                    ? "bg-blue-50 border border-blue-300"
                    : ""
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                </span>

                <span className="text-sm text-gray-700">
                  {userMap[item.userId] ||
                    item.userId}
                  {isMe && " (나)"}
                </span>
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
          <span>
            내 순위: {myRank}위 (
            {userMap[currentUserId || ""] ||
              currentUserId}
            )
          </span>
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
