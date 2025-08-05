import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Card: React.FC<CardProps> = ({ className = "", children, ...rest }) => (
  <div
    {...rest}
    className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}
  >
    {children}
  </div>
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardHeader: React.FC<CardHeaderProps> = ({ className = "", children, ...rest }) => (
  <div {...rest} className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle: React.FC<CardTitleProps> = ({ className = "", children, ...rest }) => (
  <h3 {...rest} className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export const CardDescription: React.FC<CardDescriptionProps> = ({
  className = "",
  children,
  ...rest
}) => (
  <p {...rest} className={`text-sm text-slate-500 ${className}`}>
    {children}
  </p>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardContent: React.FC<CardContentProps> = ({ className = "", children, ...rest }) => (
  <div {...rest} className={`p-6  ${className}`}>
    {children}
  </div>
);