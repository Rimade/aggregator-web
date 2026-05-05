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
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="min-w-0">
            <div className="text-xs text-slate-500">Демо-панель</div>
            <div className="truncate text-sm font-semibold text-slate-900">
              Кафе Demo • Заказы
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-transparent transition hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-200"
              href="/admin"
            >
              Назад
            </Link>
            <Link
              className="rounded-xl px-3 py-2 text-slate-700 ring-1 ring-transparent transition hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-200"
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
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "in_progress"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-sky-50 text-sky-700 ring-sky-200";

  return (
    <section className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
      <div className="flex items-start justify-between gap-3 px-2 pb-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-500">{hint}</div>
        </div>
        <div className={`rounded-full px-2 py-1 text-xs ring-1 ${badge}`}>
          {list.length}
        </div>
      </div>

      <div className="space-y-3">
        {list.map((o) => (
          <article
            key={o.id}
            className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  #{o.number}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {o.table ? `Стол ${o.table}` : "Самовывоз"} • {o.createdAt}
                </div>
              </div>
              <div className="shrink-0 text-sm font-semibold text-slate-900">
                {rub(o.totalRub)}
              </div>
            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-600">
              {o.items.map((i, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="truncate">{i.name}</div>
                  <div className="shrink-0 text-slate-500">x{i.qty}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="h-10 rounded-2xl bg-white text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Подробнее
              </button>
              <button
                type="button"
                className="h-10 rounded-2xl bg-slate-900 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
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

