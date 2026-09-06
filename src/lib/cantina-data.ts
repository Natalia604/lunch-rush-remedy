import panaderia from "@/assets/panaderia.jpg";
import minutas from "@/assets/minutas.jpg";
import bebidas from "@/assets/bebidas.jpg";
import postres from "@/assets/postres.jpg";

export type CategoryId = "panaderia" | "minutas" | "bebidas" | "postres";

export const categories: {
  id: CategoryId;
  label: string;
  emoji: string;
  image: string;
}[] = [
  { id: "panaderia", label: "Desayunos / Panadería", emoji: "🥐", image: panaderia },
  { id: "minutas", label: "Minutas / Almuerzos", emoji: "🥪", image: minutas },
  { id: "bebidas", label: "Bebidas", emoji: "🥤", image: bebidas },
  { id: "postres", label: "Postres", emoji: "🍫", image: postres },
];

export const categoryImage: Record<CategoryId, string> = {
  panaderia,
  minutas,
  bebidas,
  postres,
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryId;
  emoji: string;
  stock: number;
};

export const initialProducts: Product[] = [
  {
    id: "p1",
    name: "Croissant de manteca",
    description: "Recién horneado, hojaldre crocante y tibio.",
    price: 6000,
    category: "panaderia",
    emoji: "🥐",
    stock: 12,
  },
  {
    id: "p2",
    name: "Medialunas x3",
    description: "Dulces, glaseadas, ideales con café con leche.",
    price: 12000,
    category: "panaderia",
    emoji: "🥐",
    stock: 3,
  },
  {
    id: "p3",
    name: "Tostado de jamón y queso",
    description: "Pan de miga prensado con queso derretido.",
    price: 15000,
    category: "panaderia",
    emoji: "🍞",
    stock: 8,
  },
  {
    id: "p4",
    name: "Empanada de carne",
    description: "Jugosa, al horno, receta de la casa.",
    price: 7000,
    category: "minutas",
    emoji: "🥟",
    stock: 24,
  },
  {
    id: "p5",
    name: "Sándwich de milanesa",
    description: "Milanesa de pollo, lechuga, tomate y mayonesa.",
    price: 25000,
    category: "minutas",
    emoji: "🥪",
    stock: 2,
  },
  {
    id: "p6",
    name: "Milanesa con puré",
    description: "Plato del día, servido caliente al retirar.",
    price: 32000,
    category: "minutas",
    emoji: "🍽️",
    stock: 0,
  },
  {
    id: "p7",
    name: "Ensalada fresca",
    description: "Mix verde, pollo grillado y aderezo aparte.",
    price: 22000,
    category: "minutas",
    emoji: "🥗",
    stock: 6,
  },
  {
    id: "p8",
    name: "Jugo de naranja natural",
    description: "Exprimido del momento, 500 ml.",
    price: 10000,
    category: "bebidas",
    emoji: "🧃",
    stock: 15,
  },
  {
    id: "p9",
    name: "Agua mineral 600 ml",
    description: "Bien fría, sin gas.",
    price: 5000,
    category: "bebidas",
    emoji: "💧",
    stock: 30,
  },
  {
    id: "p10",
    name: "Café con leche",
    description: "Grande, con opción de azúcar aparte.",
    price: 9000,
    category: "bebidas",
    emoji: "☕",
    stock: 3,
  },
  {
    id: "p11",
    name: "Bombones artesanales x4",
    description: "Chocolate semiamargo relleno de dulce de leche.",
    price: 14000,
    category: "postres",
    emoji: "🍫",
    stock: 9,
  },
  {
    id: "p12",
    name: "Alfajor de maicena",
    description: "Con coco rallado y mucho dulce de leche.",
    price: 8000,
    category: "postres",
    emoji: "🍪",
    stock: 1,
  },
  {
    id: "p13",
    name: "Porción de torta",
    description: "Chocolate húmedo con crema.",
    price: 16000,
    category: "postres",
    emoji: "🍰",
    stock: 0,
  },
];

export type OrderStatus = "pendiente" | "preparacion" | "listo";

export type Order = {
  id: string;
  code: string;
  student: string;
  items: { name: string; qty: number }[];
  total: number;
  payment: "efectivo" | "digital";
  note: string;
  status: OrderStatus;
  time: string;
};

export const initialOrders: Order[] = [
  {
    id: "o1",
    code: "CU-1041",
    student: "Marcos Giménez",
    items: [
      { name: "Empanada de carne", qty: 2 },
      { name: "Jugo de naranja natural", qty: 1 },
    ],
    total: 24000,
    payment: "efectivo",
    note: "Retiro a las 10:15 hs",
    status: "pendiente",
    time: "09:52",
  },
  {
    id: "o2",
    code: "CU-1042",
    student: "Lucía Ramírez",
    items: [{ name: "Sándwich de milanesa", qty: 1 }],
    total: 25000,
    payment: "digital",
    note: "Sin mayonesa",
    status: "preparacion",
    time: "09:58",
  },
  {
    id: "o3",
    code: "CU-1043",
    student: "Diego Fernández",
    items: [
      { name: "Café con leche", qty: 1 },
      { name: "Medialunas x3", qty: 1 },
    ],
    total: 21000,
    payment: "efectivo",
    note: "",
    status: "listo",
    time: "10:03",
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }).format(value);

export const stockState = (stock: number) =>
  stock === 0 ? "agotado" : stock <= 3 ? "bajo" : "ok";
