import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ className = "", placeholder, children, ...props }) => (
  <select
    {...props}
    className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {children}
  </select>
);