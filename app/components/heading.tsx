"use client";
import { ReactNode } from "react";

type HeadingProps = { children: ReactNode; className?: string };

export function Heading({ children, className = "" }: HeadingProps) {
  return <h1 className={`text-2xl font-bold text-gray-900 ${className}`}>{children}</h1>;
}
