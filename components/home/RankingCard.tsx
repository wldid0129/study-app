import Card from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";

interface RankingItem {
  name: string;
  count: number;
}

interface Props {
  title: string;
  data: RankingItem[];
}

export default function RankingCard({ title, data }: Props) {
  const { currentColors } = useTheme();

  return (
    <Card className="flex-1 p-10">

      <div className="text-sm text-gray-500 mb-6">
        {title}
      </div>

      {data.length === 0 && (
        <div className="text-sm text-gray-400">
          데이터 없음
        </div>
      )}

      {data.map((item, index) => (
        <div
          key={index}
          className="flex justify-between mb-3 text-sm"
        >
          <span
            className={index === 0 ? "font-bold" : ""}
            style={index === 0 ? { color: currentColors.main } : {}}
          >
            {index + 1}. {item.name}
          </span>
          <span>{item.count}회</span>
        </div>
      ))}

    </Card>
  );
}
