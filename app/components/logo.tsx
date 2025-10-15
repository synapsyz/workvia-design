"use client";
import { ReactNode } from "react";

type LogoProps = { className?: string; children?: ReactNode };

export function Logo({ className = "", children }: LogoProps) {
  return (
    <div className={`text-2xl font-bold text-blue-600 ${className}`}>
      {children || "Workvia"}
    </div>
  );
}
