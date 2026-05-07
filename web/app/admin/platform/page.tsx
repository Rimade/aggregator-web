'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

type Cafe = { id: string; name: string; slug: string };
type ProfileRoleRow = { role: 'platform_admin' | 'cafe_staff' } | null;

export default function PlatformAdminPage() {
	const sb = useMemo(() => getSupabaseClient(), []);
	const [sessionToken, setSessionToken] = useState<string | null>(null);
	const [role, setRole] = useState<string | null>(null);
	const [cafes, setCafes] = useState<Cafe[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [cafeName, setCafeName] = useState('');
	const [cafeSlug, setCafeSlug] = useState('');

	const [staffEmail, setStaffEmail] = useState('');
	const [staffPassword, setStaffPassword] = useState('');
	const [staffCafeId, setStaffCafeId] = useState<string>('');
	const [staffRole, setStaffRole] = useState<'cafe_staff' | 'platform_admin'>('cafe_staff');

	async function refresh() {
		setError(null);
		if (!sb) {
			setError('Supabase env не настроены. Заполни web/.env.local.');
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const { data: sess } = await sb.auth.getSession();
			const token = sess.session?.access_token ?? null;
			setSessionToken(token);
			if (!token) {
				setRole(null);
				setCafes([]);
				return;
			}

			const { data: p, error: pErr } = await sb.from('profiles').select('role').maybeSingle();
			if (pErr) throw pErr;
			setRole((p as ProfileRoleRow)?.role ?? null);

			const { data: cs, error: cErr } = await sb
				.from('cafes')
				.select('id, name, slug')
				.order('created_at', { ascending: false });
			if (cErr) throw cErr;
			setCafes((cs as Cafe[]) ?? []);
		} catch {
			setError(
				'Не удалось загрузить данные. Проверь, что ты залогинен и у профиля role=platform_admin.',
			);
			setCafes([]);
			setRole(null);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		const t = setTimeout(() => void refresh(), 0);
		if (!sb) return () => clearTimeout(t);
		const { data: sub } = sb.auth.onAuthStateChange(() => void refresh());
		return () => {
			clearTimeout(t);
			sub.subscription.unsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function callPlatformApi(path: string, payload: unknown) {
		if (!sessionToken) throw new Error('no session');
		const res = await fetch(path, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${sessionToken}`,
			},
			body: JSON.stringify(payload),
		});
		const json = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(json?.error ?? 'request failed');
		return json;
	}

	async function createCafe() {
		setError(null);
		try {
			await callPlatformApi('/api/platform/create-cafe', { name: cafeName, slug: cafeSlug });
			setCafeName('');
			setCafeSlug('');
			await refresh();
		} catch {
			setError('Не удалось создать кафе. Проверь уникальность slug и права platform_admin.');
		}
	}

	async function createStaff() {
		setError(null);
		try {
			await callPlatformApi('/api/platform/create-staff', {
				email: staffEmail,
				password: staffPassword,
				cafeId: staffRole === 'cafe_staff' ? staffCafeId : null,
				role: staffRole,
			});
			setStaffEmail('');
			setStaffPassword('');
			await refresh();
		} catch {
			setError('Не удалось создать сотрудника. Проверь SUPABASE_SERVICE_ROLE_KEY и email/пароль.');
		}
	}

	const origin = typeof window !== 'undefined' ? window.location.origin : '';

	return (
		<div className="min-h-dvh bg-slate-50">
			<header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
				<div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
					<div className="min-w-0">
						<div className="text-xs text-slate-500">Платформа</div>
						<div className="truncate text-sm font-semibold text-slate-900">Управление кафе</div>
					</div>
					<nav className="flex items-center gap-2 text-sm">
						<Link
							className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-transparent transition hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-200"
							href="/admin">
							Назад
						</Link>
						<Link
							className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
							href="/admin/login">
							Войти
						</Link>
					</nav>
				</div>
			</header>

			<main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8 space-y-6">
				{error ? (
					<div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
						{error}
					</div>
				) : null}

				<div className="grid gap-6 lg:grid-cols-2">
					<section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
						<div className="text-xs text-slate-500">Кафе</div>
						<div className="mt-2 text-lg font-semibold">Создать кафе</div>
						<div className="mt-4 grid gap-3">
							<label className="block">
								<div className="mb-1 text-xs text-slate-600">Название</div>
								<input
									value={cafeName}
									onChange={(e) => setCafeName(e.target.value)}
									placeholder="Кафе «Лавка»"
									className="h-11 w-full rounded-2xl bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 outline-none transition focus:ring-slate-300"
								/>
							</label>
							<label className="block">
								<div className="mb-1 text-xs text-slate-600">Slug (URL)</div>
								<input
									value={cafeSlug}
									onChange={(e) => setCafeSlug(e.target.value)}
									placeholder="lavka"
									className="h-11 w-full rounded-2xl bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 outline-none transition focus:ring-slate-300"
								/>
							</label>
							<button
								type="button"
								disabled={loading || role !== 'platform_admin'}
								onClick={createCafe}
								className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60">
								Создать
							</button>
							<div className="text-xs text-slate-500">
								Доступно только для{' '}
								<span className="font-semibold text-slate-900">platform_admin</span>.
							</div>
						</div>
					</section>

					<section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
						<div className="text-xs text-slate-500">Сотрудники</div>
						<div className="mt-2 text-lg font-semibold">Создать пользователя</div>
						<div className="mt-4 grid gap-3">
							<label className="block">
								<div className="mb-1 text-xs text-slate-600">Роль</div>
								<select
									value={staffRole}
									onChange={(e) => setStaffRole(e.target.value as 'cafe_staff' | 'platform_admin')}
									className="h-11 w-full rounded-2xl bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none transition focus:ring-slate-300">
									<option value="cafe_staff">cafe_staff</option>
									<option value="platform_admin">platform_admin</option>
								</select>
							</label>
							{staffRole === 'cafe_staff' ? (
								<label className="block">
									<div className="mb-1 text-xs text-slate-600">Кафе</div>
									<select
										value={staffCafeId}
										onChange={(e) => setStaffCafeId(e.target.value)}
										className="h-11 w-full rounded-2xl bg-white px-3 text-sm text-slate-900 ring-1 ring-slate-200 outline-none transition focus:ring-slate-300">
										<option value="">Выбери кафе…</option>
										{cafes.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name} ({c.slug})
											</option>
										))}
									</select>
								</label>
							) : null}
							<label className="block">
								<div className="mb-1 text-xs text-slate-600">Email</div>
								<input
									value={staffEmail}
									onChange={(e) => setStaffEmail(e.target.value)}
									placeholder="staff@cafe.ru"
									className="h-11 w-full rounded-2xl bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 outline-none transition focus:ring-slate-300"
								/>
							</label>
							<label className="block">
								<div className="mb-1 text-xs text-slate-600">Пароль</div>
								<input
									value={staffPassword}
									onChange={(e) => setStaffPassword(e.target.value)}
									type="password"
									placeholder="••••••••"
									className="h-11 w-full rounded-2xl bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 outline-none transition focus:ring-slate-300"
								/>
							</label>

							<button
								type="button"
								disabled={loading || role !== 'platform_admin'}
								onClick={createStaff}
								className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60">
								Создать пользователя
							</button>
							<div className="text-xs text-slate-500">
								Требует{' '}
								<span className="font-semibold text-slate-900">SUPABASE_SERVICE_ROLE_KEY</span> на
								сервере.
							</div>
						</div>
					</section>
				</div>

				<section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
					<div className="flex items-start justify-between gap-3">
						<div>
							<div className="text-xs text-slate-500">Список</div>
							<div className="mt-2 text-lg font-semibold">Кафе</div>
							<div className="mt-1 text-sm text-slate-600">Ссылки для QR</div>
						</div>
						<button
							type="button"
							onClick={() => void refresh()}
							className="rounded-xl px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">
							Обновить
						</button>
					</div>

					{loading ? (
						<div className="py-6 text-sm text-slate-500">Загружаем…</div>
					) : cafes.length ? (
						<div className="mt-4 grid gap-3 md:grid-cols-2">
							{cafes.map((c) => {
								const url = `${origin}/c/${c.slug}`;
								return (
									<div key={c.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
										<div className="text-sm font-semibold text-slate-900">{c.name}</div>
										<div className="mt-1 text-xs text-slate-500">slug: {c.slug}</div>
										<div className="mt-3">
											<div className="text-xs font-semibold text-slate-600">QR URL</div>
											<div className="mt-1 break-all rounded-2xl bg-white px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-200">
												{origin ? url : 'Открой страницу в браузере, чтобы увидеть origin'}
											</div>
										</div>
										<div className="mt-3 flex gap-2">
											<Link
												href={`/c/${c.slug}`}
												className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-xs font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50">
												Открыть витрину
											</Link>
											<Link
												href="/admin/demo"
												className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
												Открыть заказы
											</Link>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="py-6 text-sm text-slate-500">Пока нет кафе.</div>
					)}
				</section>
			</main>
		</div>
	);
}
