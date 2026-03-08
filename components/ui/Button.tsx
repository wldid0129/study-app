import { useTheme } from "@/context/ThemeContext";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  style?: React.CSSProperties;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  className,
  style,
}: ButtonProps) {
  const { currentColors } = useTheme();

  const base =
    "px-4 py-2 rounded-xl text-sm font-medium transition";

  const styles =
    variant === "primary"
      ? "text-white"
      : "bg-gray-200 hover:bg-gray-300";

  return (
    <button
      onClick={onClick}
      className={`${base} ${styles} ${className || ""}`}
      style={{ ...(variant === "primary" ? { backgroundColor: currentColors.main } : {}), ...(style || {}) }}
    >
      {children}
    </button>
  );
}
