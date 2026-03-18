import React from "react";

interface HoverPushTextProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverPushText({ children, className = "" }: HoverPushTextProps) {
  return (
    <span className={`relative inline-flex overflow-hidden ${className}`}>
      <span className="w-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:-translate-y-[120%]">
        {children}
      </span>
      <span className="absolute inset-0 w-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] translate-y-[120%] group-hover:translate-y-0 text-inherit">
        {children}
      </span>
    </span>
  );
}
