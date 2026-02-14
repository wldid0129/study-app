import Card from "@/components/ui/Card";

interface Props {
  todayRate: number;
}

export default function TodayRateCard({ todayRate }: Props) {
  return (
    <Card className="flex-1 p-10">

      {/* 제목 (다른 카드와 동일 위치) */}
      <div className="text-sm text-gray-500 mb-6">
        TODAY RATE
      </div>

      {/* 숫자만 중앙 배치 */}
      <div className="flex items-center justify-center h-32">
        <div className="text-4xl font-bold">
          {todayRate}%
        </div>
      </div>

    </Card>
  );
}
