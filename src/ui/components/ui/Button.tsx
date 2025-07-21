import React from "react";

type ButtonVariant = "default" | "outline" | "ghost";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "default",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 px-4 py-2";

  const styles: Record<ButtonVariant, string> = {
    default: "bg-slate-900 text-white hover:bg-slate-700",
    outline:
      "border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-900",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-900",
  };

  return (
    <button {...props} className={`${base} ${styles[variant]} ${className}`} />
  );
};