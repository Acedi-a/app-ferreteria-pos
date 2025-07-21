import React from "react";

type BadgeVariant = "default" | "destructive";
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "default",
  children,
  ...rest
}) => {
  const colors: Record<BadgeVariant, string> = {
    default: "bg-slate-100 text-slate-800",
    destructive: "bg-red-100 text-red-800",
  };
  return (
    <span
      {...rest}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[variant]} ${className}`}
    >
      {children}
    </span>
  );
};