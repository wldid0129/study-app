import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
  useSpring,
} from "framer-motion";
import confetti from "canvas-confetti";
import Card from "@/components/ui/Card";
import { Flame, Trophy, Award } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";


export default function StreakCard({
  streak,
}: {
  streak: number;
}) {
  const { currentColors } = useTheme();
  const prevStreak = useRef<number>(streak);
  const cardRef = useRef<HTMLDivElement>(null);

  // 마우스 추적 (3D 틸트 효과용)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);

  const springConfig = { damping: 30, stiffness: 100 }; // 더 부드럽고 느린 틸트
  const springX = useSpring(rotateX, springConfig);
  const springY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  /* =========================
     카운트업 애니메이션
  ========================= */
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.floor(latest));

  useEffect(() => {
    const controls = animate(count, streak, {
      duration: 1.5,
      ease: [0.34, 1.56, 0.64, 1], // 입체적인 스프링 느낌
    });
    return controls.stop;
  }, [streak]);

  /* =========================
     연속 출석 축하 효과 (비례형)
  ========================= */
  useEffect(() => {
    if (streak > prevStreak.current && streak > 0) {
      // 짧고 가벼운 폭죽 효과로 변경 (사용자 렉 완화)
      const bursts = streak >= 30 ? 4 : streak >= 7 ? 3 : 2;
      const baseCount = streak >= 30 ? 80 : streak >= 7 ? 50 : 30;

      for (let i = 0; i < bursts; i++) {
        setTimeout(() => {
          const left = Math.random() * 0.4 + 0.05;
          const right = Math.random() * 0.4 + 0.55;
          confetti({
            particleCount: Math.round(baseCount * (0.8 + Math.random() * 0.4)),
            spread: streak >= 7 ? 80 : 60,
            origin: { x: left, y: Math.random() * 0.2 },
            colors: streak >= 30 ? ['#FFD700', '#FFA500', '#FF4500'] : undefined,
          });
          confetti({
            particleCount: Math.round(baseCount * (0.6 + Math.random() * 0.4)),
            spread: streak >= 7 ? 80 : 60,
            origin: { x: right, y: Math.random() * 0.2 },
            colors: streak >= 30 ? ['#FFD700', '#FFA500', '#FF4500'] : undefined,
          });
        }, i * 180);
      }
    }
    prevStreak.current = streak;
  }, [streak]);

  const getIntensity = () => {
    if (streak === 0) return { color: "from-gray-400 to-gray-600", glow: "shadow-gray-200", msg: "다시 시작해봐요! 🔥" };
    if (streak < 3) return { color: "from-orange-400 to-red-500", glow: "shadow-orange-200", msg: "좋은 출발이에요!" };
    if (streak < 7) return { color: "from-red-500 to-pink-600", glow: "shadow-red-200", msg: "와우! 리듬을 탔어요!" };
    if (streak < 30) return { color: "from-purple-500 to-indigo-600", glow: "shadow-purple-300", msg: "공부 괴물 등판! 👹" };
    return { color: "from-yellow-400 via-orange-500 to-red-600", glow: "shadow-yellow-400", msg: "전설의 스터디 마스터! 👑" };
  };

  const style = getIntensity();

  return (
    <Card
      whileHover={{
        scale: 1.02,
        y: -4,
        boxShadow: `0 20px 50px ${currentColors.main}30`,
        borderColor: `${currentColors.main}60`
      }}
      className="relative h-full overflow-hidden p-8 flex flex-col items-center justify-center border shadow-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px)",
        borderColor: `${currentColors.main}30`
      }}
    >
      {/* 몽환적인 배경 오브 (Floating Orbs) - 훨씬 천천히 움직이게 수정 */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={`orb-${i}`}
          animate={{
            x: [0, i * 20, -i * 20, 0],
            y: [0, -i * 30, i * 10, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full blur-3xl -z-10"
          style={{
            width: 150 + i * 50,
            height: 150 + i * 50,
            backgroundColor: currentColors.main,
            left: `${(i - 1) * 30}%`,
            top: `${(i - 1) * 20}%`,
            filter: "blur(60px)",
          }}
        />
      ))}

      {/* 아이콘 섹션 */}
      <div className="relative mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={streak >= 7 ? "legend" : "flame"}
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: 1,
              rotate: [0, 5, -5, 0],
              boxShadow: [`0 0 20px ${currentColors.main}40`, `0 0 40px ${currentColors.main}60`, `0 0 20px ${currentColors.main}40`]
            }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="p-5 rounded-3xl shadow-lg relative z-10"
            style={{ backgroundColor: currentColors.main }}
          >
            {streak >= 30 ? (
              <Trophy size={48} className="text-white" />
            ) : streak >= 7 ? (
              <Award size={48} className="text-white" />
            ) : (
              <Flame size={48} className="text-white" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* 불꽃 애니메이션 파티클 (streak > 0 일때만) */}
        {/* 불꽃 애니메이션 파티클 - 더욱 화려하게 */}
        {streak > 0 && [1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [-10, -80 - (i * 12)],
              x: [(i - 4) * 5, (i - 4) * 25, (i - 4) * -15, (i - 4) * 10],
              opacity: [0, 0.9, 0],
              scale: [0.4, 1.4, 0.2],
              rotate: [0, 45, -45, 0],
              filter: ["blur(0px)", "blur(3px)", "blur(1px)"]
            }}
            transition={{
              duration: 2.5 + (i % 3) * 0.5, // 입자 속도 하향
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut"
            }}
            className="absolute top-0 left-1/2 -translate-x-1/2 text-orange-400 z-0 pointer-events-none drop-shadow-lg"
          >
            {i % 2 === 0 ? "🔥" : "✨"}
          </motion.div>
        ))}
      </div>

      <div className="text-center z-10">
        <div className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
          Current Streak
        </div>

        <div className="flex items-baseline justify-center gap-2">
          <motion.span
            className="text-7xl font-black bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to bottom, ${currentColors.main}, ${currentColors.main}CC)` }}
          >
            {rounded}
          </motion.span>
          <span className="text-2xl font-bold" style={{ color: currentColors.main }}>DAYS</span>
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-6 px-6 py-2 rounded-2xl bg-gray-50/50 border border-gray-100/50 backdrop-blur-sm shadow-sm relative group"
        >
          <span className="text-sm font-semibold text-gray-700">
            {style.msg}
          </span>

        </motion.div>
      </div>

    </Card>
  );
}
