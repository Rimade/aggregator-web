import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-slate-900" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-slate-900">
              Aggregator
            </div>
            <div className="text-xs text-slate-500">QR-заказы для заведений</div>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-transparent transition hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-200"
            href="/c/demo"
          >
            Демо-витрина
          </Link>
          <Link
            className="rounded-xl bg-slate-900 px-3 py-2 font-medium text-white shadow-sm transition hover:bg-slate-800"
            href="/admin"
          >
            Войти в админку
          </Link>
        </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
              MVP • зал/самовывоз • оплата на месте
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Меню по QR и приём заказов — красиво, быстро, безопасно
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-slate-600">
              Вы вручную добавляете кафе, они платят за доступ. Гости оформляют
              заказ по QR, а сотрудники видят заказы в панели. В MVP деньги не
              проходят через платформу.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/c/demo"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                Открыть демо-витрину
              </Link>
              <Link
                href="/admin"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-medium text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Перейти в админку
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Stat label="Внедрение" value="10–30 мин" />
              <Stat label="Ошибки в заказах" value="Меньше" />
              <Stat label="Старт без юрболи" value="Да" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-linear-to-b from-slate-100 to-transparent blur-2xl" />
            <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="text-xs text-slate-500">Пример заказа</div>
                <div className="text-xs text-slate-400">#A-1042</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      Кафе “Demo”
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Стол 7 • Комментарий: без лука
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200">
                    new
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <LineItem name="Бургер" qty={1} price="390" />
                  <LineItem name="Картофель фри" qty={1} price="160" />
                  <LineItem name="Лимонад" qty={2} price="180" />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                  <div className="text-slate-500">Итого</div>
                  <div className="font-semibold text-slate-900">910 ₽</div>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Оплата: на месте (наличные/терминал)
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-sm"
            >
              <div className="text-sm font-semibold text-slate-900">
                {f.title}
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">
                {f.description}
              </div>
            </div>
          ))}
        </section>

        <footer className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-8 text-xs text-slate-500 sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} Aggregator</div>
          <div>MVP без онлайн-оплаты — меньше рисков, быстрее старт</div>
        </footer>
      </main>
    </div>
  );
}

const features = [
  {
    title: "QR-меню за 1 минуту",
    description:
      "Гость сканирует QR и делает заказ без приложения. Для кафе — меньше ошибок и быстрее обслуживание.",
  },
  {
    title: "Изоляция данных по кафе",
    description:
      "Каждое заведение видит только своё меню и свои заказы. Основа — multi-tenant модель.",
  },
  {
    title: "Оплата на месте (MVP)",
    description:
      "На старте деньги не проходят через платформу: вы снижаете юрриски и быстрее запускаетесь.",
  },
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function LineItem({
  name,
  qty,
  price,
}: {
  name: string;
  qty: number;
  price: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-slate-900">{name}</div>
        <div className="text-xs text-slate-500">x{qty}</div>
      </div>
      <div className="shrink-0 text-slate-700">{price} ₽</div>
    </div>
  );
}
