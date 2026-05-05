import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(59,130,246,0.25),transparent_70%),radial-gradient(900px_500px_at_10%_0px,rgba(168,85,247,0.18),transparent_55%),linear-gradient(to_bottom,#0b1020,rgba(11,16,32,0.92),#070a12)] text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-white">
              Aggregator
            </div>
            <div className="text-xs text-white/65">QR-заказы для заведений</div>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-transparent transition hover:bg-white/5 hover:text-white hover:ring-white/10"
            href="/c/demo"
          >
            Демо-витрина
          </Link>
          <Link
            className="rounded-lg bg-white px-3 py-2 font-medium text-slate-950 shadow-sm shadow-black/20 transition hover:bg-white/95"
            href="/admin"
          >
            Войти в админку
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">
              MVP: зал/самовывоз • оплата на месте
            </div>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Меню по QR и приём заказов — красиво, быстро, безопасно
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-white/75">
              Вы вручную добавляете кафе, они платят за доступ. Гости оформляют
              заказ по QR, а сотрудники видят заказы в панели. В MVP деньги не
              проходят через платформу.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/c/demo"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-medium text-slate-950 shadow-sm shadow-black/30 transition hover:bg-white/95"
              >
                Открыть демо-витрину
              </Link>
              <Link
                href="/admin"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white/5 px-4 text-sm font-medium text-white ring-1 ring-white/12 transition hover:bg-white/8"
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
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-linear-to-b from-white/12 to-transparent blur-2xl" />
            <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="text-xs text-white/70">Пример заказа</div>
                <div className="text-xs text-white/50">#A-1042</div>
              </div>
              <div className="rounded-2xl bg-black/40 p-4 ring-1 ring-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">Кафе “Demo”</div>
                    <div className="mt-1 text-xs text-white/60">
                      Стол 7 • Комментарий: без лука
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200 ring-1 ring-emerald-400/15">
                    new
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <LineItem name="Бургер" qty={1} price="390" />
                  <LineItem name="Картофель фри" qty={1} price="160" />
                  <LineItem name="Лимонад" qty={2} price="180" />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                  <div className="text-white/70">Итого</div>
                  <div className="font-semibold">910 ₽</div>
                </div>
                <div className="mt-3 text-xs text-white/55">
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
              className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10"
            >
              <div className="text-sm font-semibold">{f.title}</div>
              <div className="mt-2 text-sm leading-6 text-white/70">
                {f.description}
              </div>
            </div>
          ))}
        </section>

        <footer className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-8 text-xs text-white/55 sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} Aggregator</div>
          <div className="text-white/45">
            MVP без онлайн-оплаты — меньше рисков, быстрее старт
          </div>
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
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
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
        <div className="truncate">{name}</div>
        <div className="text-xs text-white/55">x{qty}</div>
      </div>
      <div className="shrink-0 text-white/80">{price} ₽</div>
    </div>
  );
}
