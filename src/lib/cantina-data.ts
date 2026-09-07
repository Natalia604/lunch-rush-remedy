import panaderia from "@/assets/panaderia.jpg";
import minutas from "@/assets/minutas.jpg";
import bebidas from "@/assets/bebidas.jpg";
import golosinasImg from "@/assets/cat-golosinas.jpg";

import imgEmpanada from "@/assets/prod-empanada.jpg";
import imgCroissant from "@/assets/prod-croissant.jpg";
import imgMedialunas from "@/assets/prod-medialunas.jpg";
import imgTostado from "@/assets/prod-tostado.jpg";
import imgSandwichMila from "@/assets/prod-sandwich-mila.jpg";
import imgMilaPure from "@/assets/prod-mila-pure.jpg";
import imgEnsalada from "@/assets/prod-ensalada.jpg";
import imgJugo from "@/assets/prod-jugo.jpg";
import imgAgua from "@/assets/prod-agua.jpg";
import imgCafe from "@/assets/prod-cafe.jpg";
import imgGaseosa from "@/assets/prod-gaseosa.jpg";
import imgAlfajor from "@/assets/prod-alfajor.jpg";
import imgBombones from "@/assets/prod-bombones.jpg";
import imgTorta from "@/assets/prod-torta.jpg";
import imgGalletitas from "@/assets/prod-galletitas.jpg";

export type CategoryId = "panaderia" | "minutas" | "bebidas" | "golosinas";

export const categories: {
  id: CategoryId;
  label: string;
  emoji: string;
  image: string;
}[] = [
  { id: "panaderia", label: "Panadería", emoji: "🥐", image: panaderia },
  { id: "minutas", label: "Minutas", emoji: "🥪", image: minutas },
  { id: "bebidas", label: "Bebidas", emoji: "🥤", image: bebidas },
  { id: "golosinas", label: "Golosinas", emoji: "🍫", image: golosinasImg },
];

export const categoryImage: Record<CategoryId, string> = {
  panaderia,
  minutas,
  bebidas,
  golosinas: golosinasImg,
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryId;
  emoji: string;
  stock: number;
  image: string;
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
    image: imgCroissant,
  },
  {
    id: "p2",
    name: "Medialunas x3",
    description: "Dulces, glaseadas, ideales con café con leche.",
    price: 12000,
    category: "panaderia",
    emoji: "🥐",
    stock: 3,
    image: imgMedialunas,
  },
  {
    id: "p3",
    name: "Tostado de jamón y queso",
    description: "Pan de miga prensado con queso derretido.",
    price: 15000,
    category: "panaderia",
    emoji: "🍞",
    stock: 8,
    image: imgTostado,
  },
  {
    id: "p4",
    name: "Empanada de carne",
    description: "Jugosa, al horno, receta de la casa.",
    price: 7000,
    category: "minutas",
    emoji: "🥟",
    stock: 24,
    image: imgEmpanada,
  },
  {
    id: "p5",
    name: "Sándwich de milanesa",
    description: "Milanesa de pollo, lechuga, tomate y mayonesa.",
    price: 25000,
    category: "minutas",
    emoji: "🥪",
    stock: 2,
    image: imgSandwichMila,
  },
  {
    id: "p6",
    name: "Milanesa con puré",
    description: "Plato del día, servido caliente al retirar.",
    price: 32000,
    category: "minutas",
    emoji: "🍽️",
    stock: 0,
    image: imgMilaPure,
  },
  {
    id: "p7",
    name: "Ensalada fresca",
    description: "Mix verde, pollo grillado y aderezo aparte.",
    price: 22000,
    category: "minutas",
    emoji: "🥗",
    stock: 6,
    image: imgEnsalada,
  },
  {
    id: "p8",
    name: "Jugo de naranja natural",
    description: "Exprimido del momento, 500 ml.",
    price: 10000,
    category: "bebidas",
    emoji: "🧃",
    stock: 15,
    image: imgJugo,
  },
  {
    id: "p9",
    name: "Agua mineral 600 ml",
    description: "Bien fría, sin gas.",
    price: 5000,
    category: "bebidas",
    emoji: "💧",
    stock: 30,
    image: imgAgua,
  },
  {
    id: "p10",
    name: "Café con leche",
    description: "Grande, con opción de azúcar aparte.",
    price: 9000,
    category: "bebidas",
    emoji: "☕",
    stock: 3,
    image: imgCafe,
  },
  {
    id: "p11",
    name: "Gaseosa fría 500 ml",
    description: "Bien helada, con hielo si querés.",
    price: 8000,
    category: "bebidas",
    emoji: "🥤",
    stock: 18,
    image: imgGaseosa,
  },
  {
    id: "p12",
    name: "Bombones artesanales x4",
    description: "Chocolate semiamargo relleno de dulce de leche.",
    price: 14000,
    category: "golosinas",
    emoji: "🍫",
    stock: 9,
    image: imgBombones,
  },
  {
    id: "p13",
    name: "Alfajor de maicena",
    description: "Con coco rallado y mucho dulce de leche.",
    price: 8000,
    category: "golosinas",
    emoji: "🍪",
    stock: 1,
    image: imgAlfajor,
  },
  {
    id: "p14",
    name: "Galletitas Niquito",
    description: "Paquete clásico para el recreo.",
    price: 4000,
    category: "golosinas",
    emoji: "🍪",
    stock: 20,
    image: imgGalletitas,
  },
  {
    id: "p15",
    name: "Porción de torta",
    description: "Chocolate húmedo con crema.",
    price: 16000,
    category: "golosinas",
    emoji: "🍰",
    stock: 0,
    image: imgTorta,
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
