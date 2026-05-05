import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(1000px_550px_at_50%_-120px,rgba(59,130,246,0.20),transparent_70%),radial-gradient(900px_500px_at_85%_0px,rgba(168,85,247,0.14),transparent_55%),linear-gradient(to_bottom,#070a12,rgba(7,10,18,0.96),#050711)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-white">
              Панель кафе
            </div>
            <div className="text-xs text-white/65">
              Вход для сотрудников (MVP)
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-transparent transition hover:bg-white/5 hover:text-white hover:ring-white/10"
            href="/"
          >
            На главную
          </Link>
          <Link
            className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-transparent transition hover:bg-white/5 hover:text-white hover:ring-white/10"
            href="/c/demo"
          >
            Демо-витрина
          </Link>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-16 pt-6 lg:grid-cols-2 lg:items-start">
        <section className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-xs text-white/60">MVP</div>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight">
            Заказы, меню и настройки — в одном месте
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-sm leading-6 text-white/70">
            В этой панели сотрудники видят только своё кафе (изоляция по{" "}
            <span className="text-white/85">cafe_id</span>). В следующем шаге
            подключим Supabase Auth + RLS и реальные заказы.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Badge title="Заказы" desc="лента + статусы" />
            <Badge title="Меню" desc="категории + позиции" />
            <Badge title="Доступ" desc="оплата на месте" />
          </div>

          <div className="mt-8 rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Демо-режим</div>
                <div className="mt-1 text-xs text-white/60">
                  Пока без авторизации. Нажми ниже, чтобы увидеть каркас панели.
                </div>
              </div>
              <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs text-amber-200 ring-1 ring-amber-400/15">
                mock
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/admin/demo"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm shadow-black/30 transition hover:bg-white/95"
              >
                Открыть демо-панель
              </Link>
              <Link
                href="/admin/setup"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-white/5 px-4 text-sm font-semibold text-white ring-1 ring-white/12 transition hover:bg-white/8"
              >
                Как подключим Supabase
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-white/60">Вход</div>
              <div className="mt-2 text-lg font-semibold">Сотрудники кафе</div>
              <div className="mt-1 text-sm text-white/65">
                Реальный вход добавим через Supabase Auth
              </div>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200 ring-1 ring-emerald-400/15">
              безопасно
            </span>
          </div>

          <form className="mt-6 space-y-3">
            <Field label="Email" placeholder="staff@cafe.ru" />
            <Field label="Пароль" placeholder="••••••••" type="password" />
            <button
              type="button"
              disabled
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white/15 px-4 text-sm font-semibold text-white/70 ring-1 ring-white/10"
              aria-disabled="true"
            >
              Войти (скоро)
            </button>
            <div className="text-xs text-white/50">
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
  type = "text",
}: {
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-white/60">{label}</div>
      <input
        placeholder={placeholder}
        type={type}
        className="h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/10 outline-none transition focus:ring-white/20"
      />
    </label>
  );
}

function Badge({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-white/60">{desc}</div>
    </div>
  );
}

