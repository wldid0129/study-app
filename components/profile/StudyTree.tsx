import { motion } from "framer-motion";
import { TreeDeciduous, Sprout, Flower2 } from "lucide-react";

interface Props {
    level: number; // 0 to 10
    flowerCount: number;
    totalProblems: number;
}

export default function StudyTree({ level, flowerCount, totalProblems }: Props) {
    // 성장 단계 정의 (누적 문제 기준)
    let stage = 1;
    if (totalProblems >= 500) stage = 5;
    else if (totalProblems >= 300) stage = 4;
    else if (totalProblems >= 150) stage = 3;
    else if (totalProblems >= 50) stage = 2;

    const renderVisual = () => {
        switch (stage) {
            case 1: // 새싹
                return <Sprout size={100} className="text-green-500" strokeWidth={1.5} />;
            case 2: // 꽃
                return <Flower2 size={120} className="text-pink-400" strokeWidth={1.5} />;
            case 3: // 작은 나무
                return <TreeDeciduous size={180} className="text-green-600" strokeWidth={1.5} />;
            case 4: // 큰 나무
                return <TreeDeciduous size={260} className="text-green-700" strokeWidth={1.2} />;
            case 5: // 완성된 정원
                return (
                    <div className="relative">
                        <TreeDeciduous size={300} className="text-green-800" strokeWidth={1} />
                        {/* 주변 작은 꽃들 */}
                        <div className="absolute -bottom-4 -left-12 text-2xl">🌻</div>
                        <div className="absolute -bottom-2 -right-14 text-xl">🌼</div>
                        <div className="absolute -bottom-6 left-1/2 text-base">🌸</div>
                    </div>
                );
            default:
                return <Sprout size={100} />;
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-end h-[480px] w-full bg-gradient-to-b from-blue-50/20 to-green-50/40 rounded-[3rem] border border-gray-100 overflow-hidden p-10">
            {/* 바닥 지면 */}
            <div className="absolute bottom-0 w-full h-16 bg-green-100/40 blur-2xl" />

            {/* 나무/정원 비주얼 */}
            <motion.div
                animate={{
                    scale: [1, 1.02, 1],
                    y: [0, -6, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 origin-bottom flex items-center justify-center min-h-[300px]"
            >
                {renderVisual()}

                {/* 나무에 열리는 꽃들 (Stage 3 이상부터) */}
                {stage >= 3 && Array.from({ length: Math.min(flowerCount, 30) }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="absolute text-pink-400 text-sm md:text-base pointer-events-none"
                        style={{
                            top: `${Math.random() * 55 + 5}%`,
                            left: `${Math.random() * 65 + 15}%`,
                        }}
                    >
                        🌸
                    </motion.div>
                ))}
            </motion.div>

            <div className="mt-8 text-center z-10">
                <h4 className="text-2xl font-bold text-gray-800 mb-1">나의 성장 정원</h4>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest opacity-70">
                    {stage === 5 ? "아름다운 보금자리가 완성되었습니다!" : stage === 4 ? "숲의 주인이 되어가고 있어요" : stage === 3 ? "무럭무럭 나무로 자랐네요" : stage === 2 ? "청초한 꽃이 피어났습니다" : "작은 가능성이 싹트고 있어요"}
                </p>
            </div>

            {/* 배경 떠다니는 잎사귀 등 */}
            <motion.div
                animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-10 right-20 text-green-200"
            >
                🍃
            </motion.div>
        </div>
    );
}
