import Card from "@/components/ui/Card";
import { motion } from "framer-motion";

interface Props {
  todayRate: number;
}

export default function TodayRateCard({ todayRate }: Props) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (todayRate / 100) * circumference;

  return (
    <Card className="flex-1 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/5 rounded-full blur-3xl group-hover:bg-brand/10 transition-colors duration-500" />
      
      <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">
        Today's Completion
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-40 h-40">
          {/* Background Circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              className="text-gray-100"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="var(--brand-color)"
              strokeWidth="10"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Centered Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-4xl font-black text-gray-800"
            >
              {todayRate}<span className="text-xl text-gray-400 ml-0.5">%</span>
            </motion.span>
          </div>
        </div>
        
        <p className="mt-6 text-sm font-medium text-gray-400">
          {todayRate >= 100 ? "완성! 정말 멋져요 ✨" : "조금만 더 힘내볼까요? 💪"}
        </p>
      </div>
    </Card>
  );
}
