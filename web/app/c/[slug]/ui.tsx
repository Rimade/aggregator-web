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
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
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

          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200">
              Оплата на месте
            </span>
            <Link
              className="rounded-xl px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
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
                    <div className="text-xs text-slate-500">
                      {cat.items.length} поз.
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {cat.items.map((item) => (
                      <article
                        key={item.id}
                        className="group rounded-3xl bg-white p-4 ring-1 ring-slate-200 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">
                              {item.name}
                            </div>
                            {item.description ? (
                              <div className="mt-1 text-xs leading-5 text-slate-600">
                                {item.description}
                              </div>
                            ) : null}
                          </div>
                          <div className="shrink-0 rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
                            {rub(item.priceRub)}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-slate-500">
                            {item.isAvailable === false ? "Нет в наличии" : " "}
                          </div>
                          <button
                            type="button"
                            onClick={() => addItem(item.id)}
                            disabled={item.isAvailable === false}
                            className="inline-flex h-9 items-center justify-center rounded-2xl bg-slate-900 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
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
                      <button
                        type="button"
                        disabled={!cart.length}
                        onClick={() => setStep("checkout")}
                        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        Оформить заказ
                      </button>
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
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
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

      <button
        type="button"
        onClick={onSubmit}
        className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        Подтвердить заказ
      </button>
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
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 outline-none transition focus:ring-slate-300"
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
            className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800"
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

