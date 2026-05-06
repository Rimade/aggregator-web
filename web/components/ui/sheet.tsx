'use client';

import { cn } from './ui';
import { useEffect } from 'react';

export function Sheet({
	open,
	onClose,
	title,
	description,
	children,
	/** If set, replaces default title/description/close row (handle stays). */
	header,
}: {
	open: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children: React.ReactNode;
	header?: React.ReactNode;
}) {
	useEffect(() => {
		if (!open) return;
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose();
		}
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
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
			<div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-8px_32px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
				<div className="shrink-0 bg-white px-4 pt-2 shadow-[0_8px_16px_-8px_rgba(15,23,42,0.12)]">
					<div className="mx-auto h-1.5 w-12 shrink-0 rounded-full bg-slate-200" />
					{header ? (
						<div className="mt-3">{header}</div>
					) : title || description ? (
						<div className="mt-3 flex items-start justify-between gap-3 pb-3">
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
									'rounded-xl px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900',
								)}>
								Закрыть
							</button>
						</div>
					) : null}
				</div>
				<div
					className={cn(
						'min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]',
						header || title || description ? 'pt-4' : 'pt-2',
					)}>
					{children}
				</div>
			</div>
		</div>
	);
}
