import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  noHover?: boolean;
}

export default function Card({ children, className, noHover, ...props }: CardProps) {
  const hoverClass = noHover ? "" : "";
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.12)" }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        bg-white
        rounded-2xl
        shadow-md
        border border-gray-100
        ${hoverClass}
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
