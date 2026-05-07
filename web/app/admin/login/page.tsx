'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
	const sb = useMemo(() => getSupabaseClient(), []);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function signIn() {
		setError(null);
		if (!sb) {
			setError('Supabase env не настроены. Заполни web/.env.local.');
			return;
		}
		setLoading(true);
		try {
			const { error: err } = await sb.auth.signInWithPassword({
				email: email.trim(),
				password,
			});
			if (err) throw err;
			window.location.href = '/admin/demo';
		} catch {
			setError('Не удалось войти. Проверь email/пароль и что пользователь создан в Supabase Auth.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-dvh bg-slate-50">
			<header className="border-b border-slate-200/70 bg-white/85 backdrop-blur">
				<div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-4">
					<div className="min-w-0">
						<div className="text-xs text-slate-500">Админка</div>
						<div className="truncate text-sm font-semibold text-slate-900">
							Вход для сотрудников
						</div>
					</div>
					<nav className="flex items-center gap-2 text-sm">
						<Link
							className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-transparent transition hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-200"
							href="/admin">
							Назад
						</Link>
					</nav>
				</div>
			</header>

			<main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-8">
				<div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
					<div className="text-xs text-slate-500">Auth</div>
					<h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight">Войти</h1>
					<p className="mt-2 text-sm leading-6 text-slate-600">
						Пользователь создаётся в Supabase Auth, а доступ к кафе задаётся в таблице{' '}
						<span className="font-semibold text-slate-900">profiles</span>.
					</p>

					<div className="mt-6 grid gap-3">
						<label className="block">
							<div className="mb-1 text-xs text-slate-600">Email</div>
							<input
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="staff@cafe.ru"
								className="h-11 w-full rounded-2xl bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 outline-none transition focus:ring-slate-300"
							/>
						</label>
						<label className="block">
							<div className="mb-1 text-xs text-slate-600">Пароль</div>
							<input
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								type="password"
								placeholder="••••••••"
								className="h-11 w-full rounded-2xl bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 outline-none transition focus:ring-slate-300"
							/>
						</label>

						<button
							type="button"
							disabled={loading}
							onClick={signIn}
							className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60">
							{loading ? 'Входим…' : 'Войти'}
						</button>

						{error ? (
							<div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
								{error}
							</div>
						) : null}

						<div className="text-xs text-slate-500">
							Если пока нет пользователя — создай его в Supabase Dashboard → Auth → Users.
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
