import Card from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";

interface RankingItem {
  name: string;
  count: number;
}

interface Props {
  title: string;
  data: RankingItem[];
}

const getRankIcon = (index: number) => {
  switch (index) {
    case 0: return "🥇";
    case 1: return "🥈";
    case 2: return "🥉";
    default: return `${index + 1}`;
  }
};

export default function RankingCard({ title, data }: Props) {
  const { currentColors } = useTheme();

  return (
    <Card className="flex-1 overflow-hidden p-6">
      <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
        {title}
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-sm text-gray-400 py-10 text-center">
            데이터 없음
          </div>
        ) : (
          data.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
              className={`flex items-center justify-between p-3 rounded-2xl transition-all ${index === 0
                  ? "bg-brand/5 border border-brand/10 shadow-sm"
                  : "hover:bg-gray-50/50"
                }`}
            >
              <div className="flex items-center gap-4">
                <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-black ${index === 0 ? "bg-brand text-white shadow-lg shadow-brand/20" :
                    index < 3 ? "bg-white border border-gray-100 text-gray-600" :
                      "text-gray-400"
                  }`}>
                  {getRankIcon(index)}
                </span>
                <span className={`text-sm font-bold ${index === 0 ? "text-gray-800" : "text-gray-600"}`}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-gray-800">{item.count}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Solve</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}
