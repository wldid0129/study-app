interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  className,
}: ButtonProps) {

  const base =
    "px-4 py-2 rounded-xl text-sm font-medium transition";

  const styles =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : "bg-gray-200 hover:bg-gray-300";

  return (
    <button
      onClick={onClick}
      className={`${base} ${styles} ${className || ""}`}
    >
      {children}
    </button>
  );
}
