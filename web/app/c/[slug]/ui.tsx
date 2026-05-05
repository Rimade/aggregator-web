"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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
  const [step, setStep] = useState<"menu" | "checkout" | "success">("menu");
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

  const cartCount = cart.reduce((acc, l) => acc + l.qty, 0);
  const totalRub = cart.reduce((acc, l) => acc + l.priceRub * l.qty, 0);

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
    setStep("success");
  }

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
            <Link
              className="rounded-lg px-3 py-2 text-xs text-white/70 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
              href="/"
            >
              На главную
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        {step === "success" && submitted ? (
          <Success order={submitted} onNewOrder={reset} />
        ) : (
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
                            {rub(item.priceRub).replace(" ₽", " ₽")}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-white/45">
                            {item.isAvailable === false ? "Нет в наличии" : " "}
                          </div>
                          <button
                            type="button"
                            onClick={() => addItem(item.id)}
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
                      {cart.length
                        ? "Проверь позиции и оформи заказ"
                        : "Добавь что-нибудь вкусное"}
                    </div>
                  </div>
                  <div className="rounded-full bg-white/6 px-2 py-1 text-xs text-white/70 ring-1 ring-white/10">
                    {cartCount}
                  </div>
                </div>

                {cart.length ? (
                  <div className="mt-4 space-y-2">
                    {cart.map((l) => (
                      <div
                        key={l.itemId}
                        className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {l.name}
                            </div>
                            <div className="mt-0.5 text-xs text-white/55">
                              {rub(l.priceRub)} • x{l.qty}
                            </div>
                          </div>
                          <div className="shrink-0 text-sm font-semibold">
                            {rub(l.priceRub * l.qty)}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-xl bg-white/5 ring-1 ring-white/10">
                            <button
                              type="button"
                              className="h-9 w-9 rounded-xl text-white/80 transition hover:bg-white/5"
                              onClick={() => decItem(l.itemId)}
                              aria-label="Уменьшить количество"
                            >
                              −
                            </button>
                            <div className="w-8 text-center text-xs text-white/80">
                              {l.qty}
                            </div>
                            <button
                              type="button"
                              className="h-9 w-9 rounded-xl text-white/80 transition hover:bg-white/5"
                              onClick={() => incItem(l.itemId)}
                              aria-label="Увеличить количество"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="rounded-xl px-3 py-2 text-xs text-white/65 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
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

                <div className="mt-4 rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-xs text-white/60">Итого</div>
                      <div className="mt-1 text-lg font-semibold">
                        {rub(totalRub)}
                      </div>
                    </div>
                    <div className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200 ring-1 ring-emerald-400/15">
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
                      <button
                        type="button"
                        disabled={!cart.length}
                        onClick={() => setStep("checkout")}
                        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm shadow-black/30 transition hover:bg-white/95 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/70"
                      >
                        Оформить заказ
                      </button>
                      <div className="mt-3 text-xs text-white/50">
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
          <div className="mt-1 text-xs text-white/55">
            {tableLabel ? tableLabel : "Выбери тип заказа и оставь контакт (опц.)"}
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl px-3 py-2 text-xs text-white/70 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
        >
          Назад
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={typeLocked}
          onClick={() => onChange({ ...value, type: "dine_in" })}
          className={[
            "h-10 rounded-2xl text-xs font-medium ring-1 transition",
            value.type === "dine_in"
              ? "bg-white text-slate-950 ring-white/20"
              : "bg-white/5 text-white/75 ring-white/10 hover:bg-white/8",
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
              ? "bg-white text-slate-950 ring-white/20"
              : "bg-white/5 text-white/75 ring-white/10 hover:bg-white/8",
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

      <button
        type="button"
        onClick={onSubmit}
        className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm shadow-black/30 transition hover:bg-white/95"
      >
        Подтвердить заказ
      </button>
      <div className="text-xs text-white/50">
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
      <div className="mb-1 text-xs text-white/60">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white placeholder:text-white/35 ring-1 ring-white/10 outline-none transition focus:ring-white/20"
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
      <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-white/60">Заказ принят</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {order.orderNumber}
            </div>
            <div className="mt-2 text-sm text-white/70">{order.cafeName}</div>
            <div className="mt-1 text-xs text-white/55">
              Статус: <span className="text-emerald-200">new</span> • Оплата: на
              месте
            </div>
          </div>
          <button
            type="button"
            onClick={onNewOrder}
            className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-slate-950 shadow-sm shadow-black/30 transition hover:bg-white/95"
          >
            Новый заказ
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
          <div className="text-sm font-semibold">Состав</div>
          <div className="mt-3 space-y-2 text-sm">
            {order.lines.map((l) => (
              <div key={l.itemId} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate">{l.name}</div>
                  <div className="text-xs text-white/55">x{l.qty}</div>
                </div>
                <div className="shrink-0 font-medium">{rub(l.priceRub * l.qty)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
            <div className="text-white/70">Итого</div>
            <div className="text-base font-semibold">{rub(order.totalRub)}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-white/60">
          <div>
            Тип:{" "}
            <span className="text-white/80">
              {order.type === "dine_in" ? "В зале" : "Самовывоз"}
              {order.tableLabel ? ` • ${order.tableLabel}` : ""}
            </span>
          </div>
          {order.customerName ? (
            <div>
              Имя: <span className="text-white/80">{order.customerName}</span>
            </div>
          ) : null}
          {order.customerPhone ? (
            <div>
              Телефон: <span className="text-white/80">{order.customerPhone}</span>
            </div>
          ) : null}
          {order.comment ? (
            <div>
              Комментарий: <span className="text-white/80">{order.comment}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

