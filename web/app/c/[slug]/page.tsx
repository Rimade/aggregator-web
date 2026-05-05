import { notFound } from "next/navigation";

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  priceRub: number;
  isAvailable?: boolean;
};

type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

type Cafe = {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  categories: MenuCategory[];
};

const demoCafe: Cafe = {
  id: "demo",
  name: "Кафе Demo",
  slug: "demo",
  subtitle: "Быстро • Вкусно • Без приложения",
  categories: [
    {
      id: "cat-burgers",
      name: "Бургеры",
      items: [
        {
          id: "burger-classic",
          name: "Классический бургер",
          description: "Говядина, сыр, соус, салат, томат.",
          priceRub: 390,
        },
        {
          id: "burger-chicken",
          name: "Чикен бургер",
          description: "Курица, сыр, огурчик, соус.",
          priceRub: 360,
        },
      ],
    },
    {
      id: "cat-sides",
      name: "Закуски",
      items: [
        {
          id: "fries",
          name: "Картофель фри",
          description: "Хрустящий, 150 г.",
          priceRub: 160,
        },
        {
          id: "nuggets",
          name: "Наггетсы",
          description: "6 шт. + соус на выбор.",
          priceRub: 210,
        },
      ],
    },
    {
      id: "cat-drinks",
      name: "Напитки",
      items: [
        { id: "lemonade", name: "Лимонад", description: "0.4 л.", priceRub: 180 },
        { id: "cola", name: "Кола", description: "0.5 л.", priceRub: 170 },
      ],
    },
  ],
};

function getCafeBySlug(slug: string): Cafe | null {
  if (slug === "demo") return demoCafe;
  return null;
}

export default async function CafePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { slug } = await params;
  const { t } = await searchParams;
  const cafe = getCafeBySlug(slug);
  if (!cafe) notFound();

  const tableLabel = t ? `Стол ${t}` : undefined;

  return (
    <div className="min-h-dvh bg-[radial-gradient(900px_500px_at_20%_-50px,rgba(59,130,246,0.20),transparent_70%),radial-gradient(900px_500px_at_90%_0px,rgba(168,85,247,0.16),transparent_55%),linear-gradient(to_bottom,#070a12,rgba(7,10,18,0.96),#050711)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 ring-1 ring-white/15" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold tracking-wide text-white">
                  {cafe.name}
                </div>
                <div className="truncate text-xs text-white/60">
                  {tableLabel ?? cafe.subtitle ?? "Меню по QR"}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200 ring-1 ring-emerald-400/15">
              Оплата на месте
            </span>
            <a
              className="rounded-lg px-3 py-2 text-xs text-white/70 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
              href="/"
            >
              На главную
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            {cafe.categories.map((cat) => (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {cat.name}
                  </h2>
                  <div className="text-xs text-white/50">
                    {cat.items.length} поз.
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {cat.items.map((item) => (
                    <article
                      key={item.id}
                      className="group rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:bg-white/7"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {item.name}
                          </div>
                          {item.description ? (
                            <div className="mt-1 text-xs leading-5 text-white/65">
                              {item.description}
                            </div>
                          ) : null}
                        </div>
                        <div className="shrink-0 rounded-full bg-white/6 px-2 py-1 text-xs text-white/80 ring-1 ring-white/10">
                          {item.priceRub} ₽
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-white/45">
                          {item.isAvailable === false ? "Нет в наличии" : " "}
                        </div>
                        <button
                          type="button"
                          disabled={item.isAvailable === false}
                          className="inline-flex h-9 items-center justify-center rounded-xl bg-white px-3 text-xs font-medium text-slate-950 shadow-sm shadow-black/30 transition hover:bg-white/95 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/60"
                        >
                          Добавить
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <aside className="lg:sticky lg:top-24 lg:h-[calc(100dvh-7rem)]">
            <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Корзина</div>
                  <div className="mt-1 text-xs text-white/60">
                    Пока демо — логика корзины следующим шагом
                  </div>
                </div>
                <div className="rounded-full bg-white/6 px-2 py-1 text-xs text-white/70 ring-1 ring-white/10">
                  0
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
                <div className="text-xs text-white/60">Итого</div>
                <div className="mt-1 text-lg font-semibold">0 ₽</div>
                <button
                  type="button"
                  disabled
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white/15 px-4 text-sm font-semibold text-white/70 ring-1 ring-white/10"
                >
                  Оформить заказ
                </button>
                <div className="mt-3 text-xs text-white/50">
                  Оплата на месте. Статусы заказа будут доступны в панели кафе.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

