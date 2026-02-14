"use client";

interface Props {
  ranking: {
    userId: string;
    name: string;
    total: number;
  }[];
  distribution: Record<string, number>;
}

export default function AdminStatisticsSection({
  ranking,
  distribution,
}: Props) {

  const maxValue = Math.max(
    ...ranking.map((r) => r.total),
    1
  );

  return (
    <div className="bg-white p-10 rounded-2xl shadow-md mt-10">

      <h2 className="text-2xl font-bold mb-8">
        📊 관리자 통계
      </h2>

      {/* =========================
          🏆 랭킹
      ========================= */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">
          전체 랭킹
        </h3>

        {ranking.map((user, index) => (
          <div
            key={user.userId}
            className="flex items-center mb-3"
          >
            <div className="w-8 font-bold">
              {index + 1}
            </div>

            <div className="w-32 truncate">
              {user.name}
            </div>

            <div className="flex-1 bg-gray-200 rounded-full h-5 mx-4 relative">
              <div
                className="bg-indigo-600 h-5 rounded-full"
                style={{
                  width: `${
                    (user.total / maxValue) * 100
                  }%`,
                }}
              />
            </div>

            <div className="w-16 text-right font-semibold">
              {user.total}
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          📈 구간 분포
      ========================= */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          문제 수 구간 분포
        </h3>

        {Object.entries(distribution).map(
          ([range, count]) => (
            <div
              key={range}
              className="flex items-center mb-3"
            >
              <div className="w-24">
                {range}
              </div>

              <div className="flex-1 bg-gray-200 rounded-full h-5 mx-4 relative">
                <div
                  className="bg-green-500 h-5 rounded-full"
                  style={{
                    width: `${
                      (count /
                        Math.max(
                          ...Object.values(distribution),
                          1
                        )) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="w-10 text-right font-semibold">
                {count}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
