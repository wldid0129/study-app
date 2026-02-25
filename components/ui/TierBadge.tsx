import { motion } from "framer-motion";

export type TierType =
    | "B3" | "B2" | "B1"
    | "S3" | "S2" | "S1"
    | "G3" | "G2" | "G1"
    | "P" | "D" | "M";

interface Props {
    count: number;
    showText?: boolean;
    size?: "sm" | "md" | "lg";
}

export const getTier = (count: number): { label: string; color: string; bg: string; border: string; icon: string } => {
    if (count < 40) return { label: "Bronze III", color: "text-[#ad7044]", bg: "bg-[#ad7044]/10", border: "border-[#ad7044]/30", icon: "🥉" };
    if (count < 80) return { label: "Bronze II", color: "text-[#ad7044]", bg: "bg-[#ad7044]/10", border: "border-[#ad7044]/30", icon: "🥉" };
    if (count < 120) return { label: "Bronze I", color: "text-[#ad7044]", bg: "bg-[#ad7044]/10", border: "border-[#ad7044]/30", icon: "🥉" };

    if (count < 170) return { label: "Silver III", color: "text-[#a1a1a1]", bg: "bg-[#a1a1a1]/10", border: "border-[#a1a1a1]/30", icon: "🥈" };
    if (count < 210) return { label: "Silver II", color: "text-[#a1a1a1]", bg: "bg-[#a1a1a1]/10", border: "border-[#a1a1a1]/30", icon: "🥈" };
    if (count < 250) return { label: "Silver I", color: "text-[#a1a1a1]", bg: "bg-[#a1a1a1]/10", border: "border-[#a1a1a1]/30", icon: "🥈" };

    if (count < 300) return { label: "Gold III", color: "text-[#eab308]", bg: "bg-yellow-50", border: "border-yellow-200", icon: "🥇" };
    if (count < 340) return { label: "Gold II", color: "text-[#eab308]", bg: "bg-yellow-50", border: "border-yellow-200", icon: "🥇" };
    if (count < 380) return { label: "Gold I", color: "text-[#eab308]", bg: "bg-yellow-50", border: "border-yellow-200", icon: "🥇" };

    if (count < 470) return { label: "Platinum", color: "text-[#2dd4bf]", bg: "bg-teal-50", border: "border-teal-200", icon: "💎" };
    if (count < 520) return { label: "Diamond", color: "text-[#3b82f6]", bg: "bg-blue-50", border: "border-blue-200", icon: "💠" };

    return { label: "Master", color: "text-[#a855f7]", bg: "bg-purple-50", border: "border-purple-200", icon: "👑" };
};

export const getNextTierRequirement = (count: number): { nextLabel: string; remaining: number } | null => {
    if (count < 40) return { nextLabel: "Bronze II", remaining: 40 - count };
    if (count < 80) return { nextLabel: "Bronze I", remaining: 80 - count };
    if (count < 120) return { nextLabel: "Silver III", remaining: 120 - count };
    if (count < 170) return { nextLabel: "Silver II", remaining: 170 - count };
    if (count < 210) return { nextLabel: "Silver I", remaining: 210 - count };
    if (count < 250) return { nextLabel: "Gold III", remaining: 250 - count };
    if (count < 300) return { nextLabel: "Gold II", remaining: 300 - count };
    if (count < 340) return { nextLabel: "Gold I", remaining: 340 - count };
    if (count < 380) return { nextLabel: "Platinum", remaining: 380 - count };
    if (count < 470) return { nextLabel: "Diamond", remaining: 470 - count };
    if (count < 520) return { nextLabel: "Master", remaining: 520 - count };
    return null;
};

export default function TierBadge({ count, showText = true, size = "sm" }: Props) {
    const tier = getTier(count);

    const sizeStyles = {
        sm: "px-2 py-0.5 text-[10px] gap-1.5",
        md: "px-3 py-1 text-xs gap-2",
        lg: "px-5 py-2 text-base gap-3 rounded-2xl border-2"
    };

    const iconSizes = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-2xl"
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center font-bold rounded-full border ${tier.bg} ${tier.color} ${tier.border} ${sizeStyles[size]}`}
        >
            <span className={iconSizes[size]}>{tier.icon}</span>
            {showText && <span>{tier.label}</span>}
        </motion.div>
    );
}
