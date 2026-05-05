import Link from "next/link";

const steps = [
  {
    title: "Создаём проект в Supabase",
    body: "Postgres + Auth + Storage. Дальше добавим таблицы и включим RLS.",
  },
  {
    title: "Таблицы + tenant-изоляция",
    body: "`cafes`, `profiles`, `menu_*`, `orders`, `order_items` и политики доступа по `cafe_id`.",
  },
  {
    title: "Auth для сотрудников",
    body: "Сотрудник входит по email, в `profiles` хранится `role` и `cafe_id`.",
  },
  {
    title: "Подключаем витрину и панель",
    body: "Витрина читает меню по `slug`, панель видит только свои заказы и меню.",
  },
];

export default function AdminSetupPage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(1000px_550px_at_50%_-120px,rgba(59,130,246,0.20),transparent_70%),radial-gradient(900px_500px_at_85%_0px,rgba(168,85,247,0.14),transparent_55%),linear-gradient(to_bottom,#070a12,rgba(7,10,18,0.96),#050711)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <div className="min-w-0">
            <div className="text-xs text-white/60">Setup</div>
            <div className="truncate text-sm font-semibold">
              Подключение Supabase (план)
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-transparent transition hover:bg-white/5 hover:text-white hover:ring-white/10"
              href="/admin"
            >
              Назад
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-8">
        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-xs text-white/60">Дальше по плану</div>
          <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight">
            Изоляция кафе через RLS — сначала база, потом UI
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Мы уже сделали UX на мок-данных. Следующий большой шаг — реальная БД и
            доступы так, чтобы сотрудник не мог увидеть другое кафе.
          </p>

          <div className="mt-6 grid gap-3">
            {steps.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl bg-black/25 p-4 ring-1 ring-white/10"
              >
                <div className="text-sm font-semibold">{s.title}</div>
                <div className="mt-1 text-sm text-white/65">{s.body}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/c/demo"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm shadow-black/30 transition hover:bg-white/95"
            >
              Открыть витрину
            </Link>
            <Link
              href="/admin/demo"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white/5 px-4 text-sm font-semibold text-white ring-1 ring-white/12 transition hover:bg-white/8"
            >
              Открыть демо-панель
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

