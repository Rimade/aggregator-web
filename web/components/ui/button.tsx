import type { ComponentProps } from "react";
import { cn } from "./ui";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  const base =
    "inline-flex items-center justify-center font-semibold transition active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:opacity-55";
  const sizes: Record<Size, string> = {
    sm: "h-9 rounded-2xl px-3 text-xs",
    md: "h-11 rounded-2xl px-4 text-sm",
    lg: "h-12 rounded-2xl px-5 text-sm",
  };
  const variants: Record<Variant, string> = {
    primary: "bg-slate-900 text-white shadow-sm hover:bg-slate-800",
    secondary:
      "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-50",
    danger: "bg-red-600 text-white shadow-sm hover:bg-red-500",
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}

