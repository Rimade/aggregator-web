'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Sheet } from '@/components/ui/sheet';
import { cn } from '@/components/ui/ui';

/** Акцент как в макетах (СБП / доставки) */
const brand = {
	bg: 'bg-[#637cf0]',
	bgHover: 'hover:bg-[#5568d8]',
	ring: 'ring-[#637cf0]',
	text: 'text-[#637cf0]',
};

type MenuItem = {
	id: string;
	name: string;
	emoji: string;
	description?: string;
	ingredients: string[];
	tags: Array<'spicy' | 'vegan' | 'hit'>;
	priceRub: number;
	image: { kind: 'gradient'; a: string; b: string };
	isAvailable?: boolean;
};

type MenuCategory = {
	id: string;
	name: string;
	icon: string;
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
	emoji: string;
	priceRub: number;
	qty: number;
};

type OrderDraft = {
	id: string;
	cafeName: string;
	createdAtIso: string;
	orderNumber: string;
	/** Для QR-витрины заказ всегда в зале */
	type: 'dine_in';
	tableLabel?: string;
	comment?: string;
	lines: CartLine[];
	totalRub: number;
	payment: 'pay_on_site';
	status: 'new';
};

function rub(n: number) {
	return `${n.toLocaleString('ru-RU')} ₽`;
}

function norm(s: string) {
	return s
		.toLowerCase()
		.replaceAll('ё', 'е')
		.replaceAll(/[^a-zа-я0-9\s-]/g, ' ')
		.replaceAll(/\s+/g, ' ')
		.trim();
}

/** «Стол 7» → «Стол №7» */
function formatTablePill(label?: string) {
	if (!label) return undefined;
	const m = label.match(/Стол\s+(.+)/i);
	if (m) return `Стол №${m[1].trim()}`;
	return label;
}

function makeOrderNumber() {
	return String(Math.floor(100 + Math.random() * 900));
}

function menuItemHasDetails(item: MenuItem) {
	return Boolean(item.description?.trim()) || item.ingredients.length > 0;
}

function ChevronDown({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden>
			<path
				d="M6 9l6 6 6-6"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function MenuItemDetailsPanel({ item, open }: { item: MenuItem; open: boolean }) {
	if (!menuItemHasDetails(item)) return null;
	return (
		<div
			className={cn(
				'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
				open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
			)}>
			<div className="min-h-0 overflow-hidden">
				<div className="space-y-2 border-t border-slate-100 bg-slate-50/90 px-3 pb-3 pt-2.5 text-xs leading-relaxed text-slate-600">
					{item.description?.trim() ? (
						<p className="text-slate-700">{item.description.trim()}</p>
					) : null}
					{item.ingredients.length > 0 ? (
						<p>
							<span className="font-semibold text-slate-800">Состав: </span>
							{item.ingredients.join(' · ')}
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
}

function CartIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			width="22"
			height="22"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden>
			<path
				d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle cx="9" cy="20" r="1.5" fill="currentColor" />
			<circle cx="18" cy="20" r="1.5" fill="currentColor" />
		</svg>
	);
}

export function CafeMenuClient({ cafe, tableLabel }: { cafe: Cafe; tableLabel?: string }) {
	const [cart, setCart] = useState<CartLine[]>([]);
	const [cartOpen, setCartOpen] = useState(false);
	const [step, setStep] = useState<'menu' | 'checkout' | 'success'>('menu');
	const [query, setQuery] = useState('');
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [priceMin, setPriceMin] = useState<string>('');
	const [priceMax, setPriceMax] = useState<string>('');
	const [tagHit, setTagHit] = useState(false);
	const [tagVegan, setTagVegan] = useState(false);
	const [tagSpicy, setTagSpicy] = useState(false);
	const [ingredient, setIngredient] = useState<string>('');
	const [menuTab, setMenuTab] = useState<'all' | string>('all');
	const [expandedMenuIds, setExpandedMenuIds] = useState<Set<string>>(() => new Set());
	const [draft, setDraft] = useState<{ comment: string }>(() => ({
		comment: '',
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
		const hasMin = priceMin.trim() !== '' && Number.isFinite(min);
		const hasMax = priceMax.trim() !== '' && Number.isFinite(max);

		const outCats: MenuCategory[] = [];
		for (const cat of cafe.categories) {
			const items = cat.items.filter((i) => {
				const hay = norm(`${i.name} ${i.description ?? ''}`);
				if (q && !hay.includes(q)) return false;
				if (hasMin && i.priceRub < min) return false;
				if (hasMax && i.priceRub > max) return false;
				if (tagHit && !i.tags.includes('hit')) return false;
				if (tagVegan && !i.tags.includes('vegan')) return false;
				if (tagSpicy && !i.tags.includes('spicy')) return false;
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
	const cartByItemId = useMemo(() => new Map(cart.map((l) => [l.itemId, l] as const)), [cart]);
	const anyFilter =
		!!norm(query) ||
		!!norm(ingredient) ||
		priceMin.trim() !== '' ||
		priceMax.trim() !== '' ||
		tagHit ||
		tagVegan ||
		tagSpicy;
	const catsForUi = anyFilter ? filteredCafe.categories : cafe.categories;

	const displayTab: 'all' | string =
		menuTab !== 'all' && !catsForUi.some((c) => c.id === menuTab) ? 'all' : menuTab;

	const visibleCats = useMemo(() => {
		if (displayTab === 'all') return catsForUi;
		return catsForUi.filter((c) => c.id === displayTab);
	}, [catsForUi, displayTab]);

	function toggleMenuItemExpand(itemId: string) {
		setExpandedMenuIds((prev) => {
			const next = new Set(prev);
			if (next.has(itemId)) next.delete(itemId);
			else next.add(itemId);
			return next;
		});
	}

	function addItem(itemId: string) {
		const item = itemIndex.get(itemId);
		if (!item || item.isAvailable === false) return;
		setCart((prev) => {
			const existing = prev.find((l) => l.itemId === itemId);
			if (existing) {
				return prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l));
			}
			return [
				...prev,
				{ itemId, name: item.name, emoji: item.emoji, priceRub: item.priceRub, qty: 1 },
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
		setCart((prev) => prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l)));
	}

	function reset() {
		setCart([]);
		setCartOpen(false);
		setStep('menu');
		setSubmitted(null);
		setDraft({ comment: '' });
	}

	function submitOrder() {
		if (!cart.length) return;
		const order: OrderDraft = {
			id: crypto.randomUUID(),
			cafeName: cafe.name,
			createdAtIso: new Date().toISOString(),
			orderNumber: makeOrderNumber(),
			type: 'dine_in',
			tableLabel,
			comment: draft.comment.trim() || undefined,
			lines: cart,
			totalRub,
			payment: 'pay_on_site',
			status: 'new',
		};
		setSubmitted(order);
		setCart([]);
		setCartOpen(false);
		setStep('success');
	}

	const tablePill = formatTablePill(tableLabel);

	return (
		<div className="min-h-dvh bg-[#f5f5f7]">
			<header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
				<div className="mx-auto w-full max-w-6xl px-4 pb-3 pt-3 sm:px-6">
					{/* Мобильная шапка: как в макете */}
					<div className="lg:hidden">
						<div className="text-center">
							<h1 className="text-lg font-bold tracking-tight text-slate-900">{cafe.name}</h1>
							{tablePill ? (
								<div className="mt-2 flex justify-center">
									<span
										className={cn(
											'inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm',
											brand.bg,
										)}>
										{tablePill}
									</span>
								</div>
							) : (
								<p className="mt-1 text-xs text-slate-500">{cafe.subtitle ?? 'Меню по QR'}</p>
							)}
						</div>
						<div className="mt-3 flex gap-2">
							<Input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Найти в меню…"
								className="h-11 flex-1 rounded-2xl border-0 bg-slate-100 ring-1 ring-slate-200/80"
							/>
							<Button
								type="button"
								variant="secondary"
								className="h-11 shrink-0 rounded-2xl px-4 ring-slate-200"
								onClick={() => setFiltersOpen(true)}>
								Фильтры
							</Button>
						</div>
					</div>

					{/* Десктоп: строка с брендом и корзиной */}
					<div className="hidden items-start justify-between gap-3 lg:flex">
						<div className="min-w-0">
							<div className="flex items-center gap-3">
								<div
									className={cn(
										'h-10 w-10 rounded-2xl bg-linear-to-br from-[#637cf0] to-[#5568d8] shadow-sm',
									)}
								/>
								<div className="min-w-0">
									<div className="truncate text-sm font-bold tracking-tight text-slate-900">
										{cafe.name}
									</div>
									<div className="truncate text-xs text-slate-500">
										{tablePill ?? cafe.subtitle ?? 'Меню по QR'}
									</div>
								</div>
							</div>
						</div>
						<div className="flex shrink-0 items-center gap-2">
							<span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
								Оплата на месте
							</span>
							<Link
								className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
								href="/">
								На главную
							</Link>
							<button
								type="button"
								onClick={() => setCartOpen(true)}
								className={cn(
									'inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-xs font-semibold text-white shadow-sm transition',
									brand.bg,
									brand.bgHover,
								)}>
								Корзина
								<span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
									{cartCount}
								</span>
							</button>
						</div>
					</div>

					<div className="mt-3 hidden gap-2 lg:flex">
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Найти в меню…"
							className="h-12 flex-1 rounded-2xl bg-slate-50 ring-slate-200"
						/>
						<Button
							type="button"
							variant="secondary"
							className="h-12 shrink-0 rounded-2xl px-4"
							onClick={() => setFiltersOpen(true)}>
							Фильтры
						</Button>
					</div>

					{/* Чипы категорий */}
					<div className="mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 py-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
						<button
							type="button"
							onClick={() => setMenuTab('all')}
							className={cn(
								'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ring-1 transition',
								displayTab === 'all'
									? cn(brand.bg, 'text-white ring-transparent shadow-sm')
									: 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
							)}>
							<span aria-hidden>🍽️</span>
							Всё
						</button>
						{catsForUi.map((cat) => (
							<button
								key={cat.id}
								type="button"
								onClick={() => setMenuTab(cat.id)}
								className={cn(
									'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ring-1 transition',
									displayTab === cat.id
										? cn(brand.bg, 'text-white ring-transparent shadow-sm')
										: 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50',
								)}>
								<span aria-hidden>{cat.icon}</span>
								{cat.name}
							</button>
						))}
					</div>
				</div>
			</header>

			<main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 sm:pb-32 sm:pt-6 lg:pb-10">
				<div className="grid gap-6 lg:grid-cols-[280px_1fr_360px]">
					<aside className="hidden lg:block">
						<div className="sticky top-[120px] rounded-3xl bg-white p-4 ring-1 ring-slate-200 shadow-sm">
							<div className="text-sm font-semibold text-slate-900">Фильтрация</div>
							<div className="mt-1 text-xs text-slate-500">Цена, теги, ингредиенты</div>

							<div className="mt-4 space-y-4">
								<div>
									<div className="text-xs font-semibold text-slate-700">Цена (₽)</div>
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
									<div className="text-xs font-semibold text-slate-700">Ингредиент</div>
									<div className="mt-2">
										<Input
											placeholder="например: сыр"
											value={ingredient}
											onChange={(e) => setIngredient(e.target.value)}
										/>
									</div>
								</div>

								<Button
									variant="secondary"
									type="button"
									className="w-full"
									onClick={() => {
										setPriceMin('');
										setPriceMax('');
										setTagHit(false);
										setTagVegan(false);
										setTagSpicy(false);
										setIngredient('');
									}}>
									Сбросить
								</Button>
							</div>
						</div>
					</aside>

					<section className="space-y-4 lg:space-y-6">
						{/* Мобильный компактный список */}
						<div className="space-y-2 lg:hidden">
							{visibleCats
								.flatMap((c) => c.items)
								.map((item) => {
									const line = cartByItemId.get(item.id);
									const expanded = expandedMenuIds.has(item.id);
									const canExpand = menuItemHasDetails(item);
									return (
										<article
											key={item.id}
											className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/90 shadow-sm [content-visibility:auto] [contain-intrinsic-size:120px]">
											<div className="flex items-center gap-3 p-3">
												<button
													type="button"
													disabled={!canExpand}
													onClick={() => canExpand && toggleMenuItemExpand(item.id)}
													className={cn(
														'flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left transition',
														canExpand ? 'active:bg-slate-50/80' : 'cursor-default',
													)}
													aria-expanded={canExpand ? expanded : undefined}>
													<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
														{item.emoji}
													</div>
													<div className="min-w-0 flex-1">
														<div className="flex items-start gap-1">
															<div className="min-w-0 flex-1">
																<div className="text-sm font-bold leading-tight text-slate-900">
																	{item.name}
																</div>
																<div className={cn('mt-0.5 text-sm font-semibold', brand.text)}>
																	{rub(item.priceRub)}
																</div>
															</div>
															{canExpand ? (
																<div className="flex items-center self-center">
																	<ChevronDown
																		className={cn(
																			'shrink-0 block text-slate-400 transition-transform duration-300 ease-out motion-reduce:transition-none',
																			expanded && '-rotate-180',
																		)}
																	/>
																</div>
															) : null}
														</div>
													</div>
												</button>
												<div
													className="shrink-0"
													onClick={(e) => e.stopPropagation()}
													onKeyDown={(e) => e.stopPropagation()}>
													{line ? (
														<div className="inline-flex items-center rounded-2xl bg-slate-100 ring-1 ring-slate-200/80">
															<button
																type="button"
																className="h-10 w-10 rounded-2xl text-lg text-slate-700 transition hover:bg-white/80"
																onClick={() => decItem(item.id)}
																aria-label="Меньше">
																−
															</button>
															<div className="w-7 text-center text-xs font-bold text-slate-900">
																{line.qty}
															</div>
															<button
																type="button"
																className="h-10 w-10 rounded-2xl text-lg text-slate-700 transition hover:bg-white/80"
																onClick={() => incItem(item.id)}
																aria-label="Больше">
																+
															</button>
														</div>
													) : (
														<button
															type="button"
															disabled={item.isAvailable === false}
															onClick={() => addItem(item.id)}
															className={cn(
																'flex h-11 w-11 items-center justify-center rounded-full text-xl font-semibold text-white shadow-md transition disabled:opacity-40',
																brand.bg,
																brand.bgHover,
															)}
															aria-label="В корзину">
															+
														</button>
													)}
												</div>
											</div>
											<MenuItemDetailsPanel item={item} open={expanded && canExpand} />
										</article>
									);
								})}
						</div>

						{/* Десктоп: секции и сетка */}
						<div className="hidden lg:block">
							{visibleCats.map((cat) => (
								<div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-36">
									<div className="sticky top-[128px] z-10 -mx-4 bg-[#f5f5f7]/92 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
										<div className="flex items-baseline justify-between gap-3">
											<h2 className="text-base font-bold tracking-tight text-slate-900">
												{cat.name}
											</h2>
											<div className="text-xs text-slate-500">{cat.items.length} поз.</div>
										</div>
									</div>

									<div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
										{cat.items.map((item) => {
											const line = cartByItemId.get(item.id);
											const expanded = expandedMenuIds.has(item.id);
											const canExpand = menuItemHasDetails(item);
											return (
												<article
													key={item.id}
													className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm transition hover:shadow-md [content-visibility:auto] [contain-intrinsic-size:420px]">
													<div className="p-4">
														<div className="relative overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
															<button
																type="button"
																disabled={!canExpand}
																onClick={() => canExpand && toggleMenuItemExpand(item.id)}
																className={cn(
																	'relative block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#637cf0]/40',
																	canExpand && 'cursor-pointer',
																)}
																aria-expanded={canExpand ? expanded : undefined}
																aria-label={
																	canExpand
																		? expanded
																			? 'Скрыть описание'
																			: 'Показать описание и состав'
																		: undefined
																}>
																<div
																	className="aspect-square w-full"
																	style={{
																		background: `radial-gradient(70% 70% at 50% 35%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%), linear-gradient(135deg, ${item.image.a}, ${item.image.b})`,
																	}}
																	aria-hidden
																/>
																<div className="absolute bottom-2 left-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-xl shadow-sm">
																	{item.emoji}
																</div>
																{item.tags.includes('hit') ? (
																	<div className="absolute right-3 top-3 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">
																		Хит
																	</div>
																) : null}
															</button>
														</div>

														<button
															type="button"
															disabled={!canExpand}
															onClick={() => canExpand && toggleMenuItemExpand(item.id)}
															className={cn(
																'mt-3 flex w-full items-start justify-between gap-2 rounded-lg text-left transition hover:bg-slate-50/80',
																!canExpand && 'cursor-default hover:bg-transparent',
															)}
															aria-expanded={canExpand ? expanded : undefined}>
															<span className="text-sm font-bold text-slate-900">{item.name}</span>
															{canExpand ? (
																<ChevronDown
																	className={cn(
																		'shrink-0 text-slate-400 transition-transform duration-300 ease-out motion-reduce:transition-none',
																		expanded && 'rotate-180',
																	)}
																/>
															) : null}
														</button>
													</div>

													<MenuItemDetailsPanel item={item} open={expanded && canExpand} />

													<div className="flex items-center justify-between gap-3 px-4 pb-4 pt-0">
														<div className={cn('text-sm font-bold', brand.text)}>
															{rub(item.priceRub)}
														</div>

														{line ? (
															<div className="inline-flex items-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
																<button
																	type="button"
																	className="h-9 w-9 rounded-2xl text-slate-700 transition hover:bg-white"
																	onClick={(e) => {
																		e.stopPropagation();
																		decItem(item.id);
																	}}
																	aria-label="Уменьшить">
																	−
																</button>
																<div className="w-8 text-center text-xs font-bold text-slate-900">
																	{line.qty}
																</div>
																<button
																	type="button"
																	className="h-9 w-9 rounded-2xl text-slate-700 transition hover:bg-white"
																	onClick={(e) => {
																		e.stopPropagation();
																		incItem(item.id);
																	}}
																	aria-label="Увеличить">
																	+
																</button>
															</div>
														) : (
															<Button
																size="sm"
																onClick={(e) => {
																	e.stopPropagation();
																	addItem(item.id);
																}}
																disabled={item.isAvailable === false}
																className={cn(
																	'rounded-2xl text-white shadow-sm',
																	brand.bg,
																	brand.bgHover,
																)}>
																+ Выбрать
															</Button>
														)}
													</div>

													{item.isAvailable === false ? (
														<div className="px-4 pb-3 text-xs text-slate-500">Нет в наличии</div>
													) : null}
												</article>
											);
										})}
									</div>
								</div>
							))}
						</div>

						{query && filteredCafe.categories.length === 0 ? (
							<div className="rounded-2xl bg-white p-5 text-sm text-slate-600 ring-1 ring-slate-200">
								Ничего не найдено. Попробуй изменить фильтры или запрос.
							</div>
						) : null}
					</section>

					<aside className="hidden lg:sticky lg:top-24 lg:block lg:h-[calc(100dvh-7rem)]">
						<div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
							<div className="flex items-center justify-between gap-3">
								<div>
									<div className="text-sm font-bold">Корзина</div>
									<div className="mt-1 text-xs text-slate-500">
										{cart.length ? 'Проверь позиции и оформи заказ' : 'Добавь что-нибудь вкусное'}
									</div>
								</div>
								<div
									className={cn(
										'rounded-full px-2 py-1 text-xs font-semibold text-white',
										brand.bg,
									)}>
									{cartCount}
								</div>
							</div>

							{cart.length ? (
								<div className="mt-4 space-y-2">
									{cart.map((l) => (
										<div
											key={l.itemId}
											className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
											<div className="flex items-start gap-3">
												<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg ring-1 ring-slate-200">
													{l.emoji}
												</div>
												<div className="min-w-0 flex-1">
													<div className="truncate text-sm font-semibold">{l.name}</div>
													<div className="mt-0.5 text-xs text-slate-500">{rub(l.priceRub)}</div>
												</div>
												<div className={cn('shrink-0 text-sm font-bold', brand.text)}>
													{rub(l.priceRub * l.qty)}
												</div>
											</div>

											<div className="mt-3 flex items-center justify-between">
												<div className="inline-flex items-center rounded-2xl bg-white ring-1 ring-slate-200">
													<button
														type="button"
														className="h-9 w-9 rounded-2xl text-slate-700 transition hover:bg-slate-50"
														onClick={() => decItem(l.itemId)}
														aria-label="Меньше">
														−
													</button>
													<div className="w-8 text-center text-xs font-bold text-slate-900">
														{l.qty}
													</div>
													<button
														type="button"
														className="h-9 w-9 rounded-2xl text-slate-700 transition hover:bg-slate-50"
														onClick={() => incItem(l.itemId)}
														aria-label="Больше">
														+
													</button>
												</div>
												<button
													type="button"
													className="rounded-xl px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
													onClick={() =>
														setCart((prev) => prev.filter((x) => x.itemId !== l.itemId))
													}>
													Удалить
												</button>
											</div>
										</div>
									))}
								</div>
							) : null}

							<div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
								<div className="flex items-end justify-between gap-3">
									<div>
										<div className="text-xs font-semibold text-slate-600">Итого</div>
										<div className="mt-1 text-lg font-bold text-slate-900">{rub(totalRub)}</div>
									</div>
									<div className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
										на месте
									</div>
								</div>

								{step === 'checkout' ? (
									<div className="mt-4">
										<CheckoutForm
											tableLabel={tableLabel}
											value={draft}
											onChange={setDraft}
											onBack={() => setStep('menu')}
											onSubmit={submitOrder}
										/>
									</div>
								) : (
									<>
										<Button
											type="button"
											disabled={!cart.length}
											onClick={() => setStep('checkout')}
											className={cn('mt-4 w-full text-white shadow-sm', brand.bg, brand.bgHover)}>
											Оформить заказ
										</Button>
										<div className="mt-3 text-center text-xs text-slate-500">
											Оплата СБП или на месте
										</div>
									</>
								)}
							</div>
						</div>
					</aside>
				</div>
			</main>

			{/* Мобильная нижняя панель корзины */}
			{step !== 'success' ? (
				<div className="lg:hidden">
					<button
						type="button"
						onClick={() => setCartOpen(true)}
						disabled={!cartCount}
						className={cn(
							'fixed inset-x-0 bottom-0 z-30 flex h-17 items-center justify-between rounded-t-3xl px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 text-white shadow-[0_-8px_30px_rgba(99,124,240,0.35)] transition disabled:opacity-50',
							brand.bg,
						)}>
						<span className="relative inline-flex">
							<CartIcon className="text-white" />
							{cartCount > 0 ? (
								<span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm">
									{cartCount > 99 ? '99+' : cartCount}
								</span>
							) : null}
						</span>
						<span className="text-base font-bold">{rub(totalRub)}</span>
					</button>
				</div>
			) : null}

			{step !== 'success' ? (
				<Sheet
					open={cartOpen}
					onClose={() => setCartOpen(false)}
					header={
						<div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 -mx-4 px-4">
							<button
								type="button"
								onClick={() => setCartOpen(false)}
								className="flex h-10 w-10 items-center justify-center rounded-xl text-3xl text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
								aria-label="Закрыть">
								×
							</button>
							<div className="text-base font-bold text-slate-900">Корзина</div>
							<span
								className={cn(
									'rounded-full px-3 py-1 text-xs font-semibold text-white',
									cartCount ? brand.bg : 'bg-slate-300',
								)}>
								{cartCount} шт
							</span>
						</div>
					}>
					{cart.length ? (
						<div className="space-y-3">
							{cart.map((l) => (
								<div
									key={l.itemId}
									className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 shadow-sm">
									<div className="flex gap-3">
										<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
											{l.emoji}
										</div>
										<div className="min-w-0 flex-1">
											<div className="text-sm font-bold text-slate-900">{l.name}</div>
											<div className="mt-0.5 text-xs text-slate-500">{rub(l.priceRub)}</div>
										</div>
									</div>
									<div className="mt-3 flex items-center justify-between">
										<div className="inline-flex items-center rounded-2xl bg-slate-100 ring-1 ring-slate-200/80">
											<button
												type="button"
												className="h-10 w-10 rounded-2xl text-lg text-slate-700 transition hover:bg-white"
												onClick={() => decItem(l.itemId)}
												aria-label="Меньше">
												−
											</button>
											<div className="w-8 text-center text-xs font-bold">{l.qty}</div>
											<button
												type="button"
												className="h-10 w-10 rounded-2xl text-lg text-slate-700 transition hover:bg-white"
												onClick={() => incItem(l.itemId)}
												aria-label="Больше">
												+
											</button>
										</div>
										<div className={cn('text-sm font-bold', brand.text)}>
											{rub(l.priceRub * l.qty)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="py-6 text-center text-sm text-slate-500">Корзина пуста</p>
					)}

					<div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
						<div className="flex items-center justify-between">
							<span className="text-sm font-bold text-slate-900">Итого:</span>
							<span className={cn('text-lg font-bold', brand.text)}>{rub(totalRub)}</span>
						</div>

						{step === 'checkout' ? (
							<CheckoutForm
								tableLabel={tableLabel}
								value={draft}
								onChange={setDraft}
								onBack={() => setStep('menu')}
								onSubmit={submitOrder}
							/>
						) : (
							<>
								<button
									type="button"
									disabled={!cart.length}
									onClick={() => setStep('checkout')}
									className={cn(
										'flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition disabled:opacity-50',
										brand.bg,
										brand.bgHover,
									)}>
									<span aria-hidden>💳</span>
									Оформить заказ
								</button>
								<p className="text-center text-xs text-slate-500">Оплата СБП или на месте</p>
							</>
						)}
					</div>
				</Sheet>
			) : null}

			<Sheet
				open={filtersOpen}
				onClose={() => setFiltersOpen(false)}
				title="Фильтрация"
				description="Теги, цена, ингредиенты">
				<div className="space-y-4">
					<div>
						<div className="text-xs font-semibold text-slate-700">Цена (₽)</div>
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
						<div className="text-xs font-semibold text-slate-700">Ингредиент</div>
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
								setPriceMin('');
								setPriceMax('');
								setTagHit(false);
								setTagVegan(false);
								setTagSpicy(false);
								setIngredient('');
							}}>
							Сброс
						</Button>
						<Button
							type="button"
							onClick={() => setFiltersOpen(false)}
							className={cn('text-white', brand.bg, brand.bgHover)}>
							Готово
						</Button>
					</div>
				</div>
			</Sheet>

			{step === 'success' && submitted ? <SuccessModal order={submitted} onClose={reset} /> : null}
		</div>
	);
}

function CheckoutForm({
	value,
	onChange,
	onBack,
	onSubmit,
	tableLabel,
}: {
	value: { comment: string };
	onChange: (v: { comment: string }) => void;
	onBack: () => void;
	onSubmit: () => void;
	tableLabel?: string;
}) {
	const tableHint = formatTablePill(tableLabel);
	return (
		<div className="space-y-3">
			<div className="flex items-start justify-between gap-3">
				<div>
					<div className="text-sm font-bold">Оформление</div>
					<div className="mt-1 text-xs text-slate-500">
						{tableHint ? (
							<>{tableHint} · заказ в зале</>
						) : (
							<>Заказ в зале — комментарий для кухни по желанию</>
						)}
					</div>
				</div>
				<Button variant="secondary" size="sm" type="button" onClick={onBack}>
					Назад
				</Button>
			</div>

			<Field
				label="Комментарий (опционально)"
				value={value.comment}
				onChange={(v) => onChange({ ...value, comment: v })}
				placeholder="Например: без лука, соус отдельно"
			/>

			<Button
				type="button"
				onClick={onSubmit}
				className="w-full bg-[#637cf0] text-white hover:bg-[#5568d8]">
				Подтвердить заказ
			</Button>
			<div className="text-center text-xs text-slate-500">
				Оплата — на месте или СБП. Чек выдаст кафе.
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
			<Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
		</label>
	);
}

function SuccessModal({ order, onClose }: { order: OrderDraft; onClose: () => void }) {
	return (
		<div className="fixed inset-0 z-60 flex items-end justify-center bg-black/40 p-4 sm:items-center">
			<div
				className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
				role="dialog"
				aria-modal="true"
				aria-labelledby="success-title">
				<div className="flex flex-col items-center text-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl text-white shadow-lg">
						✓
					</div>
					<h2 id="success-title" className="mt-4 text-lg font-bold text-slate-900">
						Заказ принят!
					</h2>
					<p className="mt-2 text-3xl font-bold text-[#637cf0]">№{order.orderNumber}</p>
					<span className="mt-3 inline-flex rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm">
						Ожидайте ~15 минут
					</span>

					<div className="mt-5 w-full rounded-2xl bg-slate-100 p-4">
						<div className="text-2xl font-bold text-slate-900">{rub(order.totalRub)}</div>
						<p className="mt-1 text-xs text-slate-500">Оплатите официанту или через СБП</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="mt-5 w-full rounded-2xl bg-[#637cf0] py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-[#5568d8]">
						Закрыть
					</button>
				</div>
			</div>
		</div>
	);
}
