"use client";

export default function GoalMaintenanceCard({
  title,
}: {
  title: string;
}) {
  return (
    <div className="p-8 rounded-2xl shadow bg-white border border-gray-200 flex flex-col items-center justify-center">

      <div className="text-sm text-gray-500 mb-2">
        🚧 {title}
      </div>

      <div className="text-gray-600 text-sm text-center">
        현재 목표 시스템을 점검 중입니다.
        <br />
        곧 다시 활성화됩니다.
      </div>

    </div>
  );
}
