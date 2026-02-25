import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";

interface Props {
    data: Record<string, { date: string; count: number }[]>;
    limitToCurrentMonth?: boolean;
}

export default function ActivityHeatmap({ data, limitToCurrentMonth }: Props) {
    const { currentColors } = useTheme();

    const getCellColor = (count: number) => {
        if (count === 0) return { className: "bg-gray-50 text-gray-300" };
        if (count === 1) return { style: { backgroundColor: currentColors.shades?.[20] }, className: "text-gray-700" };
        if (count === 2) return { style: { backgroundColor: currentColors.shades?.[40] }, className: "text-gray-800" };
        if (count === 3) return { style: { backgroundColor: currentColors.shades?.[60] }, className: "text-white" };
        return { style: { backgroundColor: currentColors.main }, className: "text-white" };
    };

    const getEmoji = (count: number) => {
        if (count >= 4) return "🌸";
        if (count === 3) return "🌼";
        if (count === 2) return "🌿";
        if (count === 1) return "🌱";
        return null;
    };

    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

    // 월별 정렬
    const sortedMonths = Object.keys(data).sort().reverse();
    const visibleMonths = limitToCurrentMonth ? sortedMonths.slice(0, 1) : sortedMonths;

    return (
        <div className="space-y-8">
            {visibleMonths.map((monthKey) => {
                const [year, month] = monthKey.split("-");
                const monthData = data[monthKey];

                // 첫 번째 날의 요일을 구해서 패딩 처리 (일요일 시작)
                const firstDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                const firstDayOfWeek = firstDate.getDay(); // 0: 일요일, 1: 월요일...

                return (
                    <Card key={monthKey} className="p-6 md:p-8 bg-white border-none shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">
                                {year}년 {parseInt(month)}월
                            </h3>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                <div className="flex items-center gap-1"><span className="text-sm">🌱</span> 1개</div>
                                <div className="flex items-center gap-1"><span className="text-sm">🌿</span> 2개</div>
                                <div className="flex items-center gap-1"><span className="text-sm">🌼</span> 3개</div>
                                <div className="flex items-center gap-1"><span className="text-sm">🌸</span> 4개+</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                            {weekdays.map((wd, i) => (
                                <div key={wd} className={`text-center text-[10px] font-bold mb-2 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-300'}`}>
                                    {wd}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 md:gap-2">
                            {/* 빈 칸 채우기 */}
                            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square"></div>
                            ))}

                            {/* 실제 날짜들 (날짜순 정렬 보장) */}
                            {monthData.sort((a, b) => a.date.localeCompare(b.date)).map((item, index) => (
                                <motion.div
                                    key={item.date}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.005 }}
                                    className={`aspect-square rounded-xl transition-all hover:ring-2 hover:ring-brand-light relative group cursor-pointer flex items-center justify-center border border-gray-100/30 shadow-sm ${getCellColor(item.count).className}`}
                                    style={getCellColor(item.count).style}
                                >
                                    <span className={`text-[9px] md:text-[11px] font-bold`}>
                                        {parseInt(item.date.split("-")[2])}
                                    </span>

                                    {getEmoji(item.count) && (
                                        <div className="absolute -top-3 -right-2 text-sm md:text-xl drop-shadow-md select-none group-hover:scale-125 transition-transform">
                                            {getEmoji(item.count)}
                                        </div>
                                    )}

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition shadow-xl border border-gray-700">
                                        {item.date}: {item.count}문제 해결
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
