"use client";
import { InputHTMLAttributes, ReactNode } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox(props: CheckboxProps) {
  return <input type="checkbox" {...props} />;
}

type CheckboxFieldProps = { children: ReactNode; className?: string };

export function CheckboxField({ children, className = "" }: CheckboxFieldProps) {
  return <div className={`flex items-center gap-2 ${className}`}>{children}</div>;
}
