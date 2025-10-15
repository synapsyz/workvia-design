"use client";
import { ReactNode } from "react";

type FieldProps = { children: ReactNode; className?: string };
export function Field({ children, className = "" }: FieldProps) {
  return <div className={`flex flex-col gap-2 ${className}`}>{children}</div>;
}

type LabelProps = { children: ReactNode; className?: string };
export function Label({ children, className = "" }: LabelProps) {
  return <label className={`font-medium text-gray-700 ${className}`}>{children}</label>;
}
