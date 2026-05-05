import type { ComponentProps } from "react";
import { cn } from "./ui";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 outline-none transition focus:ring-slate-300",
        className,
      )}
      {...props}
    />
  );
}

