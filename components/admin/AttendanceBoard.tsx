interface UserStatus {
  userId: string;
  name: string;
  status: string;
  streak: number;
}

interface Props {
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  list: UserStatus[];
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        출석 완료
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-sm font-semibold">
        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
        승인 대기
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold">
        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
        거절
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-semibold">
      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
      미출석
    </span>
  );
}

export default function AttendanceBoard({
  selectedDate,
  setSelectedDate,
  list,
}: Props) {
  return (
    <div className="bg-white p-10 rounded-2xl shadow mb-12">

      <h2 className="text-xl font-bold mb-6">
        📅 날짜별 출석 현황
      </h2>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="mb-6 border rounded px-3 py-2"
      />

      <div className="space-y-4">

        {list.map((user) => (
          <div
            key={user.userId}
            className="flex justify-between items-center border-b pb-4"
          >
            <div className="flex items-center gap-4">

              <span className="font-medium">
                {user.name}
              </span>

              {/* 🔥 streak */}
              {user.streak > 0 ? (
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    user.streak >= 5
                      ? "bg-red-100 text-red-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  🔥 {user.streak}일
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-400">
                  0일
                </span>
              )}
            </div>

            <StatusBadge status={user.status} />
          </div>
        ))}

      </div>
    </div>
  );
}
