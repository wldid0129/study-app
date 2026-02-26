import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Card({ children, className, noPadding = false, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.12)" }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        glass-card
        rounded-3xl
        ${noPadding ? "" : "p-6 md:p-8"}
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
