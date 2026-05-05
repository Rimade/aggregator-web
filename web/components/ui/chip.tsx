import type { ComponentProps } from "react";
import { cn } from "./ui";

export function Chip({
  className,
  active,
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "h-9 shrink-0 rounded-full px-3 text-xs font-semibold ring-1 transition",
        active
          ? "bg-slate-900 text-white ring-slate-900"
          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
        className,
      )}
      {...props}
    />
  );
}

