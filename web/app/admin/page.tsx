import Link from 'next/link';

export default function AdminPage() {
	return (
		<div className="min-h-dvh bg-slate-50">
			<header className="border-b border-slate-200/70 bg-white/85 backdrop-blur">
				<div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
					<div className="flex items-center gap-3">
						<div className="h-9 w-9 rounded-2xl bg-slate-900" />
						<div className="leading-tight">
							<div className="text-sm font-semibold tracking-wide text-slate-900">Панель кафе</div>
							<div className="text-xs text-slate-500">Вход для сотрудников (MVP)</div>
						</div>
					</div>
					<nav className="flex items-center gap-2 text-sm">
						<Link
							className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-transparent transition hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-200"
							href="/">
							На главную
						</Link>
						<Link
							className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-transparent transition hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-200"
							href="/c/demo">
							Демо-витрина
						</Link>
					</nav>
				</div>
			</header>

			<main className="mx-auto grid w-full max-w-7xl gap-6 px-6 pb-16 pt-6 lg:grid-cols-2 lg:items-start">
				<section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
					<div className="text-xs text-slate-500">MVP</div>
					<h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight">
						Заказы, меню и настройки — в одном месте
					</h1>
					<p className="mt-3 max-w-xl text-pretty text-sm leading-6 text-slate-600">
						В этой панели сотрудники видят только своё кафе (изоляция по{' '}
						<span className="text-slate-900">cafe_id</span>). В следующем шаге подключим Supabase
						Auth + RLS и реальные заказы.
					</p>

					<div className="mt-6 grid gap-3 sm:grid-cols-3">
						<Badge title="Заказы" desc="лента + статусы" />
						<Badge title="Меню" desc="категории + позиции" />
						<Badge title="Доступ" desc="оплата на месте" />
					</div>

					<div className="mt-8 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
						<div className="flex items-start justify-between gap-3">
							<div>
								<div className="text-sm font-semibold">Демо-режим</div>
								<div className="mt-1 text-xs text-slate-500">
									Пока без авторизации. Нажми ниже, чтобы увидеть каркас панели.
								</div>
							</div>
							<span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700 ring-1 ring-amber-200">
								mock
							</span>
						</div>
						<div className="mt-4 flex flex-col gap-3 sm:flex-row">
							<Link
								href="/admin/demo"
								className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
								Открыть демо-панель
							</Link>
							<Link
								href="/admin/platform"
								className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50">
								Панель платформы
							</Link>
							<Link
								href="/admin/setup"
								className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50">
								Как подключим Supabase
							</Link>
						</div>
					</div>
				</section>

				<section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
					<div className="flex items-start justify-between gap-3">
						<div>
							<div className="text-xs text-slate-500">Вход</div>
							<div className="mt-2 text-lg font-semibold">Сотрудники кафе</div>
							<div className="mt-1 text-sm text-slate-600">
								Реальный вход добавим через Supabase Auth
							</div>
						</div>
						<span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200">
							безопасно
						</span>
					</div>

					<form className="mt-6 space-y-3">
						<Field label="Email" placeholder="staff@cafe.ru" />
						<Field label="Пароль" placeholder="••••••••" type="password" />
						<button
							type="button"
							disabled
							className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-200 px-4 text-sm font-semibold text-slate-500"
							aria-disabled="true">
							Войти (скоро)
						</button>
						<div className="text-xs text-slate-500">
							В MVP вы вручную создаёте сотрудников и выдаёте доступ.
						</div>
					</form>
				</section>
			</main>
		</div>
	);
}

function Field({
	label,
	placeholder,
	type = 'text',
}: {
	label: string;
	placeholder?: string;
	type?: string;
}) {
	return (
		<label className="block">
			<div className="mb-1 text-xs text-slate-600">{label}</div>
			<input
				placeholder={placeholder}
				type={type}
				className="h-11 w-full rounded-2xl bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 outline-none transition focus:ring-slate-300"
			/>
		</label>
	);
}

function Badge({ title, desc }: { title: string; desc: string }) {
	return (
		<div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
			<div className="text-sm font-semibold text-slate-900">{title}</div>
			<div className="mt-1 text-xs text-slate-500">{desc}</div>
		</div>
	);
}
