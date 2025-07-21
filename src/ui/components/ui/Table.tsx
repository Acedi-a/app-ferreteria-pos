import React from "react";

/* ---------- Table ---------- */
export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({
  className = "",
  children,
  ...rest
}) => (
  <div className="w-full overflow-auto">
    <table {...rest} className={`min-w-full border-collapse text-sm ${className}`}>
      {children}
    </table>
  </div>
);

/* ---------- TableHeader ---------- */
export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  children,
  ...rest
}) => (
  <thead {...rest} className={`border-b border-slate-200 ${className}`}>
    {children}
  </thead>
);

/* ---------- TableBody ---------- */
export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  children,
  ...rest
}) => (
  <tbody {...rest} className={`divide-y divide-slate-200 ${className}`}>
    {children}
  </tbody>
);

/* ---------- TableRow ---------- */
export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = "",
  children,
  ...rest
}) => (
  <tr {...rest} className={`group ${className}`}>
    {children}
  </tr>
);

/* ---------- TableHead ---------- */
export const TableHead: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  children,
  ...rest
}) => (
  <th
    {...rest}
    className={`px-4 py-3 text-left align-middle font-medium text-slate-600 ${className}`}
  >
    {children}
  </th>
);

/* ---------- TableCell ---------- */
export const TableCell: React.FC<React.HTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  children,
  ...rest
}) => (
  <td {...rest} className={`px-4 py-3 align-middle ${className}`}>
    {children}
  </td>
);