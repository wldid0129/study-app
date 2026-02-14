import TodayRateCard from "./TodayRateCard";
import RankingCard from "./RankingCard";

interface RankingItem {
  name: string;
  count: number;
}

interface Props {
  todayRate: number;
  weeklyTop: RankingItem[];
  monthlyTop: RankingItem[];
}

export default function StatisticsSection({
  todayRate,
  weeklyTop,
  monthlyTop,
}: Props) {
  return (
    <div className="flex gap-10 mt-16">

      <TodayRateCard todayRate={todayRate} />

      <RankingCard
        title="WEEKLY TOP 3"
        data={weeklyTop}
      />

      <RankingCard
        title="MONTHLY TOP 3"
        data={monthlyTop}
      />

    </div>
  );
}

