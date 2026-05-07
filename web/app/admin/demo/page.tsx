'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

type OrderStatus = 'new' | 'in_progress' | 'ready' | 'closed' | 'cancelled';

type OrderItemRow = {
	order_id: string;
	name_snapshot: string;
	qty: number;
};

type UiOrder = {
	id: string;
	number: string;
	table?: string;
	totalRub: number;
	status: OrderStatus;
	items: { name: string; qty: number }[];
	createdAt: string;
};

function rub(n: number) {
	return `${n.toLocaleString('ru-RU')} ₽`;
}

function timeAgo(iso: string) {
	const d = new Date(iso).getTime();
	const diff = Math.max(0, Date.now() - d);
	const min = Math.floor(diff / 60000);
	if (min < 1) return 'только что';
	if (min < 60) return `${min} мин назад`;
	const h = Math.floor(min / 60);
	if (h < 24) return `${h} ч назад`;
	const days = Math.floor(h / 24);
	return `${days} д назад`;
}

const columns: Array<{ title: string; hint: string; status: OrderStatus; badge: string }> = [
	{
		title: 'Новые',
		hint: 'только что пришли',
		status: 'new',
		badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
	},
	{
		title: 'В работе',
		hint: 'готовятся',
		status: 'in_progress',
		badge: 'bg-amber-50 text-amber-700 ring-amber-200',
	},
	{
		title: 'Готово',
		hint: 'можно выдавать',
		status: 'ready',
		badge: 'bg-sky-50 text-sky-700 ring-sky-200',
	},
];

function nextStatus(s: OrderStatus): OrderStatus {
	if (s === 'new') return 'in_progress';
	if (s === 'in_progress') return 'ready';
	if (s === 'ready') return 'closed';
	return s;
}

export default function AdminDemoPage() {
	const sb = useMemo(() => getSupabaseClient(), []);
	const [loading, setLoading] = useState(true);
	const [authed, setAuthed] = useState(false);
	const [orders, setOrders] = useState<UiOrder[]>([]);
	const [error, setError] = useState<string | null>(null);

	async function load() {
		setError(null);
		if (!sb) {
			setError('Supabase env не настроены. Заполни web/.env.local.');
			setOrders([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const { data: session } = await sb.auth.getSession();
			setAuthed(Boolean(session.session));
			if (!session.session) {
				setOrders([]);
				setLoading(false);
				return;
			}

			const { data: orderRows, error: oErr } = await sb
				.from('orders')
				.select('id, order_number, table_label, total_rub, status, created_at')
				.order('created_at', { ascending: false })
				.limit(60);
			if (oErr) throw oErr;

			const ids = (orderRows ?? []).map((o) => o.id);
			let itemRows: OrderItemRow[] = [];
			if (ids.length) {
				const { data: items, error: iErr } = await sb
					.from('order_items')
					.select('order_id, name_snapshot, qty')
					.in('order_id', ids);
				if (iErr) throw iErr;
				itemRows = (items ?? []) as OrderItemRow[];
			}

			const byOrder = new Map<string, { name: string; qty: number }[]>();
			for (const it of itemRows) {
				const list = byOrder.get(it.order_id) ?? [];
				list.push({ name: it.name_snapshot, qty: it.qty });
				byOrder.set(it.order_id, list);
			}

			const ui = (orderRows ?? []).map((o) => ({
				id: o.id,
				number: o.order_number,
				table: o.table_label ? o.table_label.replace(/^Стол\s*/i, '').trim() : undefined,
				totalRub: o.total_rub,
				status: o.status,
				createdAt: timeAgo(o.created_at),
				items: byOrder.get(o.id) ?? [],
			}));

			setOrders(ui);
		} catch {
			setError('Не удалось загрузить заказы. Проверь RLS/профиль пользователя (profiles.cafe_id).');
			setOrders([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		const t = setTimeout(() => void load(), 0);
		if (!sb) return;
		const { data: sub } = sb.auth.onAuthStateChange(() => void load());
		return () => {
			clearTimeout(t);
			sub.subscription.unsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function signOut() {
		if (!sb) return;
		await sb.auth.signOut();
	}

	async function advance(o: UiOrder) {
		if (!sb) return;
		const to = nextStatus(o.status);
		if (to === o.status) return;
		setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: to } : x)));
		const { error: uErr } = await sb.from('orders').update({ status: to }).eq('id', o.id);
		if (uErr) {
			setError('Не удалось обновить статус. Проверь политику update для orders.');
			void load();
		}
	}

	return (
		<div className="min-h-dvh bg-slate-50">
			<header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
				<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
					<div className="min-w-0">
						<div className="text-xs text-slate-500">Панель</div>
						<div className="truncate text-sm font-semibold text-slate-900">Заказы</div>
					</div>
					<nav className="flex items-center gap-2 text-sm">
						<Link
							className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-transparent transition hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-200"
							href="/admin">
							Назад
						</Link>
						<Link
							className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-transparent transition hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-200"
							href="/c/demo?t=7">
							Открыть QR (стол 7)
						</Link>
						{authed ? (
							<button
								type="button"
								onClick={signOut}
								className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900">
								Выйти
							</button>
						) : (
							<Link
								className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
								href="/admin/login">
								Войти
							</Link>
						)}
					</nav>
				</div>
			</header>

			<main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-8">
				{error ? (
					<div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
						{error}
					</div>
				) : null}

				{!authed ? (
					<div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
						<div className="text-sm font-semibold text-slate-900">Нужен вход</div>
						<p className="mt-1 text-sm text-slate-600">
							Заказы видны только сотрудникам. Войди через Supabase Auth.
						</p>
						<div className="mt-4 flex gap-2">
							<Link
								href="/admin/login"
								className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
								Перейти к входу
							</Link>
						</div>
					</div>
				) : (
					<div className="grid gap-6 lg:grid-cols-3">
						{columns.map((c) => (
							<section
								key={c.status}
								className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
								<div className="flex items-start justify-between gap-3 px-2 pb-3">
									<div>
										<div className="text-sm font-semibold text-slate-900">{c.title}</div>
										<div className="mt-1 text-xs text-slate-500">{c.hint}</div>
									</div>
									<div className={`rounded-full px-2 py-1 text-xs ring-1 ${c.badge}`}>
										{orders.filter((o) => o.status === c.status).length}
									</div>
								</div>

								{loading ? (
									<div className="px-2 py-6 text-sm text-slate-500">Загружаем…</div>
								) : (
									<div className="space-y-3">
										{orders
											.filter((o) => o.status === c.status)
											.map((o) => (
												<article
													key={o.id}
													className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
													<div className="flex items-start justify-between gap-3">
														<div className="min-w-0">
															<div className="truncate text-sm font-semibold text-slate-900">
																#{o.number}
															</div>
															<div className="mt-1 text-xs text-slate-500">
																{o.table ? `Стол ${o.table}` : 'Самовывоз'} • {o.createdAt}
															</div>
														</div>
														<div className="shrink-0 text-sm font-semibold text-slate-900">
															{rub(o.totalRub)}
														</div>
													</div>

													<div className="mt-3 space-y-1 text-xs text-slate-600">
														{o.items.length ? (
															o.items.map((i, idx) => (
																<div key={idx} className="flex items-center justify-between gap-3">
																	<div className="truncate">{i.name}</div>
																	<div className="shrink-0 text-slate-500">x{i.qty}</div>
																</div>
															))
														) : (
															<div className="text-slate-500">позиции не загружены</div>
														)}
													</div>

													<div className="mt-4 grid grid-cols-2 gap-2">
														<button
															type="button"
															onClick={() => void load()}
															className="h-10 rounded-2xl bg-white text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">
															Обновить
														</button>
														<button
															type="button"
															onClick={() => void advance(o)}
															className="h-10 rounded-2xl bg-slate-900 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
															След. статус
														</button>
													</div>
												</article>
											))}
									</div>
								)}
							</section>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
