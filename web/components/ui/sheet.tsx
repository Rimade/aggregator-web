"use client";

import { cn } from "./ui";
import { useEffect } from "react";

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-label="Закрыть"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-auto rounded-t-3xl bg-white p-4 ring-1 ring-slate-200">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />
        {(title || description) && (
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              {title ? <div className="text-sm font-semibold">{title}</div> : null}
              {description ? (
                <div className="mt-1 text-xs text-slate-500">{description}</div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "rounded-xl px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              Закрыть
            </button>
          </div>
        )}
        <div className="mt-4">{children}</div>
        <div className="h-6" />
      </div>
    </div>
  );
}

