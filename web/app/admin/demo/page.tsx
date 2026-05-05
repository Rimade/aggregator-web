import Link from "next/link";

type OrderStatus = "new" | "in_progress" | "ready";

type Order = {
  id: string;
  number: string;
  table?: string;
  totalRub: number;
  status: OrderStatus;
  items: { name: string; qty: number }[];
  createdAt: string;
};

const demoOrders: Order[] = [
  {
    id: "o1",
    number: "A-1042",
    table: "7",
    totalRub: 910,
    status: "new",
    createdAt: "2 мин назад",
    items: [
      { name: "Классический бургер", qty: 1 },
      { name: "Картофель фри", qty: 1 },
      { name: "Лимонад", qty: 2 },
    ],
  },
  {
    id: "o2",
    number: "K-1180",
    table: "2",
    totalRub: 520,
    status: "in_progress",
    createdAt: "7 мин назад",
    items: [
      { name: "Чикен бургер", qty: 1 },
      { name: "Кола", qty: 1 },
    ],
  },
  {
    id: "o3",
    number: "M-1203",
    totalRub: 740,
    status: "ready",
    createdAt: "11 мин назад",
    items: [
      { name: "Наггетсы", qty: 2 },
      { name: "Лимонад", qty: 1 },
    ],
  },
];

function rub(n: number) {
  return `${n.toLocaleString("ru-RU")} ₽`;
}

export default function AdminDemoPage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(1000px_550px_at_50%_-120px,rgba(59,130,246,0.20),transparent_70%),radial-gradient(900px_500px_at_85%_0px,rgba(168,85,247,0.14),transparent_55%),linear-gradient(to_bottom,#070a12,rgba(7,10,18,0.96),#050711)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="min-w-0">
            <div className="text-xs text-white/60">Демо-панель</div>
            <div className="truncate text-sm font-semibold">
              Кафе Demo • Заказы
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-transparent transition hover:bg-white/5 hover:text-white hover:ring-white/10"
              href="/admin"
            >
              Назад
            </Link>
            <Link
              className="rounded-lg px-3 py-2 text-white/80 ring-1 ring-transparent transition hover:bg-white/5 hover:text-white hover:ring-white/10"
              href="/c/demo?t=7"
            >
              Открыть QR (стол 7)
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Column title="Новые" hint="только что пришли" status="new" />
          <Column title="В работе" hint="готовятся" status="in_progress" />
          <Column title="Готово" hint="можно выдавать" status="ready" />
        </div>
      </main>
    </div>
  );
}

function Column({
  title,
  hint,
  status,
}: {
  title: string;
  hint: string;
  status: OrderStatus;
}) {
  const list = demoOrders.filter((o) => o.status === status);
  const badge =
    status === "new"
      ? "bg-emerald-400/10 text-emerald-200 ring-emerald-400/15"
      : status === "in_progress"
        ? "bg-amber-400/10 text-amber-200 ring-amber-400/15"
        : "bg-sky-400/10 text-sky-200 ring-sky-400/15";

  return (
    <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-3 px-2 pb-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-white/55">{hint}</div>
        </div>
        <div className={`rounded-full px-2 py-1 text-xs ring-1 ${badge}`}>
          {list.length}
        </div>
      </div>

      <div className="space-y-3">
        {list.map((o) => (
          <article
            key={o.id}
            className="rounded-2xl bg-black/25 p-4 ring-1 ring-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">#{o.number}</div>
                <div className="mt-1 text-xs text-white/60">
                  {o.table ? `Стол ${o.table}` : "Самовывоз"} • {o.createdAt}
                </div>
              </div>
              <div className="shrink-0 text-sm font-semibold">{rub(o.totalRub)}</div>
            </div>
            <div className="mt-3 space-y-1 text-xs text-white/70">
              {o.items.map((i, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="truncate">{i.name}</div>
                  <div className="shrink-0 text-white/55">x{i.qty}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="h-10 rounded-2xl bg-white/5 text-xs font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/8"
              >
                Подробнее
              </button>
              <button
                type="button"
                className="h-10 rounded-2xl bg-white text-xs font-semibold text-slate-950 shadow-sm shadow-black/30 transition hover:bg-white/95"
              >
                След. статус
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

