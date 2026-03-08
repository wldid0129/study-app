interface CardProps {
  children: React.ReactNode;
  className?: string;
  noHover?: boolean;
}

export default function Card({ children, className, noHover }: CardProps) {
  const hoverClass = noHover ? "" : "transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg";
  return (
    <div
      className={`
        bg-white
        rounded-2xl
        shadow-md
        border border-gray-100
        ${hoverClass}
        ${className || ""}
      `}
    >
      {children}
    </div>
  );
}
