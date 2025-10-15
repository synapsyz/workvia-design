"use client";
import { ReactNode, AnchorHTMLAttributes } from "react";

type TextProps = { children: ReactNode; className?: string };
export function Text({ children, className = "" }: TextProps) {
  return <p className={`text-gray-700 ${className}`}>{children}</p>;
}

type TextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };
export function TextLink({ children, className = "", ...props }: TextLinkProps) {
  return (
    <a {...props} className={`text-blue-600 hover:underline ${className}`}>
      {children}
    </a>
  );
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong>{children}</strong>;
}
