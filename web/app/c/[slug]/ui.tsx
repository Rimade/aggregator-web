"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  ingredients: string[];
  tags: Array<"spicy" | "vegan" | "hit">;
  priceRub: number;
  image: { kind: "gradient"; a: string; b: string };
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

type CartLine = {
  itemId: string;
  name: string;
  priceRub: number;
  qty: number;
};

type OrderDraft = {
  id: string;
  cafeName: string;
  createdAtIso: string;
  orderNumber: string;
  type: "dine_in" | "pickup";
  tableLabel?: string;
  customerName?: string;
  customerPhone?: string;
  comment?: string;
  lines: CartLine[];
  totalRub: number;
  payment: "pay_on_site";
  status: "new";
};

function rub(n: number) {
  return `${n.toLocaleString("ru-RU")} ₽`;
}

function norm(s: string) {
  return s
    .toLowerCase()
    .replaceAll("ё", "е")
    .replaceAll(/[^a-zа-я0-9\s-]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function makeOrderNumber() {
  const letters = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${letter}-${num}`;
}

export function CafeMenuClient({
  cafe,
  tableLabel,
}: {
  cafe: Cafe;
  tableLabel?: string;
}) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState<"menu" | "checkout" | "success">("menu");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [tagHit, setTagHit] = useState(false);
  const [tagVegan, setTagVegan] = useState(false);
  const [tagSpicy, setTagSpicy] = useState(false);
  const [ingredient, setIngredient] = useState<string>("");
  const [activeCat, setActiveCat] = useState<string>(cafe.categories[0]?.id ?? "");
  const [draft, setDraft] = useState<{
    name: string;
    phone: string;
    comment: string;
    type: "dine_in" | "pickup";
  }>(() => ({
    name: "",
    phone: "",
    comment: "",
    type: tableLabel ? "dine_in" : "pickup",
  }));
  const [submitted, setSubmitted] = useState<OrderDraft | null>(null);

  const itemIndex = useMemo(() => {
    const m = new Map<string, MenuItem>();
    for (const cat of cafe.categories) {
      for (const i of cat.items) m.set(i.id, i);
    }
    return m;
  }, [cafe.categories]);

  const filteredCafe = useMemo(() => {
    const q = norm(query);
    const iQ = norm(ingredient);
    const min = Number(priceMin);
    const max = Number(priceMax);
    const hasMin = priceMin.trim() !== "" && Number.isFinite(min);
    const hasMax = priceMax.trim() !== "" && Number.isFinite(max);

    const outCats: MenuCategory[] = [];
    for (const cat of cafe.categories) {
      const items = cat.items.filter((i) => {
        const hay = norm(`${i.name} ${i.description ?? ""}`);
        if (q && !hay.includes(q)) return false;
        if (hasMin && i.priceRub < min) return false;
        if (hasMax && i.priceRub > max) return false;
        if (tagHit && !i.tags.includes("hit")) return false;
        if (tagVegan && !i.tags.includes("vegan")) return false;
        if (tagSpicy && !i.tags.includes("spicy")) return false;
        if (iQ) {
          const ing = i.ingredients.map(norm);
          if (!ing.some((x) => x.includes(iQ))) return false;
        }
        return true;
      });
      if (items.length) outCats.push({ ...cat, items });
    }
    return { ...cafe, categories: outCats };
  }, [cafe, ingredient, priceMax, priceMin, query, tagHit, tagSpicy, tagVegan]);

  const cartCount = cart.reduce((acc, l) => acc + l.qty, 0);
  const totalRub = cart.reduce((acc, l) => acc + l.priceRub * l.qty, 0);
  const anyFilter =
    !!norm(query) ||
    !!norm(ingredient) ||
    priceMin.trim() !== "" ||
    priceMax.trim() !== "" ||
    tagHit ||
    tagVegan ||
    tagSpicy;
  const catsForUi = anyFilter ? filteredCafe.categories : cafe.categories;
  const effectiveActiveCat =
    activeCat && catsForUi.some((c) => c.id === activeCat)
      ? activeCat
      : (catsForUi[0]?.id ?? "");

  function addItem(itemId: string) {
    const item = itemIndex.get(itemId);
    if (!item || item.isAvailable === false) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === itemId);
      if (existing) {
        return prev.map((l) =>
          l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l,
        );
      }
      return [
        ...prev,
        { itemId, name: item.name, priceRub: item.priceRub, qty: 1 },
      ];
    });
  }

  function decItem(itemId: string) {
    setCart((prev) =>
      prev
        .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0),
    );
  }

  function incItem(itemId: string) {
    const item = itemIndex.get(itemId);
    if (!item || item.isAvailable === false) return;
    setCart((prev) =>
      prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l)),
    );
  }

  function reset() {
    setCart([]);
    setCartOpen(false);
    setStep("menu");
    setSubmitted(null);
    setDraft((d) => ({
      name: "",
      phone: "",
      comment: "",
      type: tableLabel ? "dine_in" : d.type,
    }));
  }

  function submitOrder() {
    if (!cart.length) return;
    const order: OrderDraft = {
      id: crypto.randomUUID(),
      cafeName: cafe.name,
      createdAtIso: new Date().toISOString(),
      orderNumber: makeOrderNumber(),
      type: tableLabel ? "dine_in" : draft.type,
      tableLabel,
      customerName: draft.name.trim() || undefined,
      customerPhone: draft.phone.trim() || undefined,
      comment: draft.comment.trim() || undefined,
      lines: cart,
      totalRub,
      payment: "pay_on_site",
      status: "new",
    };
    setSubmitted(order);
    setCart([]);
    setCartOpen(false);
    setStep("success");
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/92 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 pb-3 pt-3 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-slate-900" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold tracking-wide text-slate-900">
                    {cafe.name}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {tableLabel ?? cafe.subtitle ?? "Меню по QR"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex">
                Оплата на месте
              </span>
              <Link
                className="hidden rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
                href="/"
              >
                На главную
              </Link>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-900 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Корзина
                <span className="rounded-full bg-white/12 px-2 py-1 text-[11px] font-semibold">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти в меню…"
              className="h-12 flex-1 rounded-3xl bg-slate-50 ring-slate-200"
            />
            <Button
              type="button"
              variant="secondary"
              className="h-12 shrink-0 rounded-3xl px-4"
              onClick={() => setFiltersOpen(true)}
            >
              Фильтры
            </Button>
          </div>

          <div className="mt-3 -mx-4 flex gap-2 overflow-auto px-4 pb-1 sm:-mx-6 sm:px-6">
            {catsForUi.map((cat) => (
              <Chip
                key={cat.id}
                active={effectiveActiveCat === cat.id}
                onClick={() => {
                  setActiveCat(cat.id);
                  const el = document.getElementById(`cat-${cat.id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {cat.name}
              </Chip>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-4 sm:px-6 sm:pt-6">
        {step === "success" && submitted ? (
          <Success order={submitted} onNewOrder={reset} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="space-y-6">
              {catsForUi.map((cat) => (
                <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-36">
                  <div className="sticky top-[128px] z-10 -mx-4 bg-slate-50/92 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="text-base font-semibold tracking-tight text-slate-900">
                        {cat.name}
                      </h2>
                      <div className="text-xs text-slate-500">
                        {cat.items.length} поз.
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 divide-y divide-slate-200 rounded-3xl bg-white ring-1 ring-slate-200">
                    {cat.items.map((item) => {
                      const line = cart.find((l) => l.itemId === item.id);
                      return (
                        <div key={item.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-1 ring-slate-200"
                              style={{
                                background: `linear-gradient(135deg, ${item.image.a}, ${item.image.b})`,
                              }}
                              aria-label={`Фото: ${item.name}`}
                              title={item.name}
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-semibold text-slate-900">
                                    {item.name}
                                  </div>
                                  {item.description ? (
                                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                                      {item.description}
                                    </div>
                                  ) : null}
                                  {item.tags.length ? (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {item.tags.includes("hit") ? (
                                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                          хит
                                        </span>
                                      ) : null}
                                      {item.tags.includes("vegan") ? (
                                        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                                          🌱
                                        </span>
                                      ) : null}
                                      {item.tags.includes("spicy") ? (
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                                          🌶️
                                        </span>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                                <div className="shrink-0 text-sm font-semibold text-slate-900">
                                  {rub(item.priceRub)}
                                </div>
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                  {item.isAvailable === false
                                    ? "Нет в наличии"
                                    : " "}
                                </div>

                                {line ? (
                                  <div className="inline-flex items-center rounded-2xl bg-white ring-1 ring-slate-200">
                                    <button
                                      type="button"
                                      className="h-9 w-9 rounded-2xl text-slate-700 transition hover:bg-slate-50"
                                      onClick={() => decItem(item.id)}
                                      aria-label="Уменьшить количество"
                                    >
                                      −
                                    </button>
                                    <div className="w-8 text-center text-xs font-semibold text-slate-900">
                                      {line.qty}
                                    </div>
                                    <button
                                      type="button"
                                      className="h-9 w-9 rounded-2xl text-slate-700 transition hover:bg-slate-50"
                                      onClick={() => incItem(item.id)}
                                      aria-label="Увеличить количество"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => addItem(item.id)}
                                    disabled={item.isAvailable === false}
                                  >
                                    Добавить
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {query && filteredCafe.categories.length === 0 ? (
                <div className="rounded-3xl bg-white p-5 text-sm text-slate-600 ring-1 ring-slate-200">
                  Ничего не найдено. Попробуй изменить фильтры или запрос.
                </div>
              ) : null}
            </section>

            <aside className="lg:sticky lg:top-24 lg:h-[calc(100dvh-7rem)]">
              <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Корзина</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {cart.length
                        ? "Проверь позиции и оформи заказ"
                        : "Добавь что-нибудь вкусное"}
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
                    {cartCount}
                  </div>
                </div>

                {cart.length ? (
                  <div className="mt-4 space-y-2">
                    {cart.map((l) => (
                      <div
                        key={l.itemId}
                        className="rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {l.name}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500">
                              {rub(l.priceRub)} • x{l.qty}
                            </div>
                          </div>
                          <div className="shrink-0 text-sm font-semibold">
                            {rub(l.priceRub * l.qty)}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-2xl bg-white ring-1 ring-slate-200">
                            <button
                              type="button"
                              className="h-9 w-9 rounded-2xl text-slate-700 transition hover:bg-slate-50"
                              onClick={() => decItem(l.itemId)}
                              aria-label="Уменьшить количество"
                            >
                              −
                            </button>
                            <div className="w-8 text-center text-xs text-slate-700">
                              {l.qty}
                            </div>
                            <button
                              type="button"
                              className="h-9 w-9 rounded-2xl text-slate-700 transition hover:bg-slate-50"
                              onClick={() => incItem(l.itemId)}
                              aria-label="Увеличить количество"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="rounded-2xl px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
                            onClick={() =>
                              setCart((prev) =>
                                prev.filter((x) => x.itemId !== l.itemId),
                              )
                            }
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-500">Итого</div>
                      <div className="mt-1 text-lg font-semibold">
                        {rub(totalRub)}
                      </div>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200">
                      на месте
                    </div>
                  </div>

                  {step === "checkout" ? (
                    <div className="mt-4">
                      <CheckoutForm
                        tableLabel={tableLabel}
                        typeLocked={!!tableLabel}
                        value={draft}
                        onChange={setDraft}
                        onBack={() => setStep("menu")}
                        onSubmit={submitOrder}
                      />
                    </div>
                  ) : (
                    <>
                      <Button
                        type="button"
                        disabled={!cart.length}
                        onClick={() => setStep("checkout")}
                        className="mt-4 w-full"
                      >
                        Оформить заказ
                      </Button>
                      <div className="mt-3 text-xs text-slate-500">
                        Оплата на месте. После оформления заказ сразу уйдёт в
                        панель кафе.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {step !== "success" ? (
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="fixed inset-x-4 bottom-4 z-30 flex h-12 items-center justify-between rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 disabled:opacity-60"
            disabled={!cartCount}
          >
            <span>Корзина</span>
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-white/12 px-2 py-1 text-xs font-semibold">
                {cartCount}
              </span>
              <span>{rub(totalRub)}</span>
            </span>
          </button>

          <Sheet
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            title="Корзина"
            description={cart.length ? "Проверь позиции и оформи заказ" : "Пусто"}
          >
            {cart.length ? (
              <div className="space-y-2">
                {cart.map((l) => (
                  <div
                    key={l.itemId}
                    className="rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {l.name}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {rub(l.priceRub)} • x{l.qty}
                        </div>
                      </div>
                      <div className="shrink-0 text-sm font-semibold">
                        {rub(l.priceRub * l.qty)}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-2xl bg-white ring-1 ring-slate-200">
                        <button
                          type="button"
                          className="h-9 w-9 rounded-2xl text-slate-700 transition hover:bg-slate-50"
                          onClick={() => decItem(l.itemId)}
                          aria-label="Уменьшить количество"
                        >
                          −
                        </button>
                        <div className="w-8 text-center text-xs text-slate-700">
                          {l.qty}
                        </div>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-2xl text-slate-700 transition hover:bg-slate-50"
                          onClick={() => incItem(l.itemId)}
                          aria-label="Увеличить количество"
                        >
                          +
                        </button>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setCart((prev) =>
                            prev.filter((x) => x.itemId !== l.itemId),
                          )
                        }
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">Итого</div>
                  <div className="mt-1 text-lg font-semibold">{rub(totalRub)}</div>
                </div>
                <div className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  на месте
                </div>
              </div>

              {step === "checkout" ? (
                <div className="mt-4">
                  <CheckoutForm
                    tableLabel={tableLabel}
                    typeLocked={!!tableLabel}
                    value={draft}
                    onChange={setDraft}
                    onBack={() => setStep("menu")}
                    onSubmit={submitOrder}
                  />
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    disabled={!cart.length}
                    onClick={() => setStep("checkout")}
                    className="mt-4 w-full"
                  >
                    Оформить заказ
                  </Button>
                  <div className="mt-3 text-xs text-slate-500">
                    Оплата на месте. После оформления заказ сразу уйдёт в панель
                    кафе.
                  </div>
                </>
              )}
            </div>
          </Sheet>
        </div>
      ) : null}

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Фильтрация"
        description="Как в доставках: теги, цена, ингредиенты"
      >
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-700">
              Цена (₽)
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Input
                inputMode="numeric"
                placeholder="от"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <Input
                inputMode="numeric"
                placeholder="до"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700">Теги</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip active={tagHit} onClick={() => setTagHit((v) => !v)}>
                Хит
              </Chip>
              <Chip active={tagVegan} onClick={() => setTagVegan((v) => !v)}>
                🌱 Веган
              </Chip>
              <Chip active={tagSpicy} onClick={() => setTagSpicy((v) => !v)}>
                🌶️ Острое
              </Chip>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700">
              Ингредиент
            </div>
            <div className="mt-2">
              <Input
                placeholder="например: сыр"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setPriceMin("");
                setPriceMax("");
                setTagHit(false);
                setTagVegan(false);
                setTagSpicy(false);
                setIngredient("");
              }}
            >
              Сброс
            </Button>
            <Button type="button" onClick={() => setFiltersOpen(false)}>
              Готово
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function CheckoutForm({
  value,
  onChange,
  onBack,
  onSubmit,
  tableLabel,
  typeLocked,
}: {
  value: { name: string; phone: string; comment: string; type: "dine_in" | "pickup" };
  onChange: (v: {
    name: string;
    phone: string;
    comment: string;
    type: "dine_in" | "pickup";
  }) => void;
  onBack: () => void;
  onSubmit: () => void;
  tableLabel?: string;
  typeLocked: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Оформление</div>
          <div className="mt-1 text-xs text-slate-500">
            {tableLabel ? tableLabel : "Выбери тип заказа и оставь контакт (опц.)"}
          </div>
        </div>
        <Button variant="secondary" size="sm" type="button" onClick={onBack}>
          Назад
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={typeLocked}
          onClick={() => onChange({ ...value, type: "dine_in" })}
          className={[
            "h-10 rounded-2xl text-xs font-medium ring-1 transition",
            value.type === "dine_in"
              ? "bg-slate-900 text-white ring-slate-900"
              : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
            typeLocked ? "cursor-not-allowed opacity-60" : "",
          ].join(" ")}
        >
          В зале
        </button>
        <button
          type="button"
          disabled={typeLocked}
          onClick={() => onChange({ ...value, type: "pickup" })}
          className={[
            "h-10 rounded-2xl text-xs font-medium ring-1 transition",
            value.type === "pickup"
              ? "bg-slate-900 text-white ring-slate-900"
              : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
            typeLocked ? "cursor-not-allowed opacity-60" : "",
          ].join(" ")}
        >
          Самовывоз
        </button>
      </div>

      <div className="grid gap-2">
        <Field
          label="Имя (опционально)"
          value={value.name}
          onChange={(v) => onChange({ ...value, name: v })}
          placeholder="Например: Анна"
        />
        <Field
          label="Телефон (опционально)"
          value={value.phone}
          onChange={(v) => onChange({ ...value, phone: v })}
          placeholder="+7 ..."
        />
        <Field
          label="Комментарий (опционально)"
          value={value.comment}
          onChange={(v) => onChange({ ...value, comment: v })}
          placeholder="Например: без лука"
        />
      </div>

      <Button type="button" onClick={onSubmit} className="w-full">
        Подтвердить заказ
      </Button>
      <div className="text-xs text-slate-500">
        Оплата — на месте. Фискальный чек выдаст кафе.
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-slate-600">{label}</div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Success({
  order,
  onNewOrder,
}: {
  order: OrderDraft;
  onNewOrder: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Заказ принят</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {order.orderNumber}
            </div>
            <div className="mt-2 text-sm text-slate-600">{order.cafeName}</div>
            <div className="mt-1 text-xs text-slate-500">
              Статус: <span className="text-emerald-700">new</span> • Оплата: на
              месте
            </div>
          </div>
          <button
            type="button"
            onClick={onNewOrder}
            className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Новый заказ
          </button>
        </div>

        <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="text-sm font-semibold">Состав</div>
          <div className="mt-3 space-y-2 text-sm">
            {order.lines.map((l) => (
              <div key={l.itemId} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate">{l.name}</div>
                  <div className="text-xs text-slate-500">x{l.qty}</div>
                </div>
                <div className="shrink-0 font-medium">{rub(l.priceRub * l.qty)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
            <div className="text-slate-500">Итого</div>
            <div className="text-base font-semibold">{rub(order.totalRub)}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-slate-600">
          <div>
            Тип:{" "}
            <span className="text-slate-900">
              {order.type === "dine_in" ? "В зале" : "Самовывоз"}
              {order.tableLabel ? ` • ${order.tableLabel}` : ""}
            </span>
          </div>
          {order.customerName ? (
            <div>
              Имя: <span className="text-slate-900">{order.customerName}</span>
            </div>
          ) : null}
          {order.customerPhone ? (
            <div>
              Телефон:{" "}
              <span className="text-slate-900">{order.customerPhone}</span>
            </div>
          ) : null}
          {order.comment ? (
            <div>
              Комментарий:{" "}
              <span className="text-slate-900">{order.comment}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

