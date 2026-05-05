import { notFound } from "next/navigation";
import { CafeMenuClient } from "./ui";

type MenuItem = {
  id: string;
  name: string;
  description?: string;
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
          image: { kind: "gradient", a: "#34d399", b: "#22c55e" },
        },
        {
          id: "burger-chicken",
          name: "Чикен бургер",
          description: "Курица, сыр, огурчик, соус.",
          priceRub: 360,
          image: { kind: "gradient", a: "#fbbf24", b: "#fb7185" },
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
          image: { kind: "gradient", a: "#60a5fa", b: "#a78bfa" },
        },
        {
          id: "nuggets",
          name: "Наггетсы",
          description: "6 шт. + соус на выбор.",
          priceRub: 210,
          image: { kind: "gradient", a: "#fb7185", b: "#f59e0b" },
        },
      ],
    },
    {
      id: "cat-drinks",
      name: "Напитки",
      items: [
        {
          id: "lemonade",
          name: "Лимонад",
          description: "0.4 л.",
          priceRub: 180,
          image: { kind: "gradient", a: "#22c55e", b: "#38bdf8" },
        },
        {
          id: "cola",
          name: "Кола",
          description: "0.5 л.",
          priceRub: 170,
          image: { kind: "gradient", a: "#0ea5e9", b: "#6366f1" },
        },
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

  return <CafeMenuClient cafe={cafe} tableLabel={tableLabel} />;
}

