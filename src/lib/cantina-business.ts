// Tipos y datos de los módulos comerciales: caja, facturación, RRHH e insumos.

export type Invoice = {
  id: string;
  number: string;
  orderCode: string;
  customer: string;
  ruc: string;
  items: { name: string; qty: number }[];
  total: number;
  payment: "efectivo" | "digital";
  status: "emitida" | "anulada";
  date: string;
  time: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  phone: string;
  shift: string;
};

export type Attendance = {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
};

export type StaffPayment = {
  id: string;
  employeeId: string;
  type: "sueldo" | "adelanto";
  amount: number;
  date: string;
};

export type Supply = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  min: number;
  expiry: string; // YYYY-MM-DD
};

export type Expense = {
  id: string;
  concept: string;
  amount: number;
  time: string;
};

export type CashSession = {
  open: boolean;
  opening: number;
  openedAt: string | null;
  closedAt: string | null;
  counted: number | null;
};

export const initialEmployees: Employee[] = [
  { id: "e1", name: "Rosa Benítez", role: "Cajera", phone: "0981 445 220", shift: "07:00 – 13:00" },
  { id: "e2", name: "Julián Ayala", role: "Cocinero", phone: "0982 117 903", shift: "06:00 – 14:00" },
  { id: "e3", name: "Mirta Cáceres", role: "Apoyo de salón", phone: "0983 552 741", shift: "10:00 – 16:00" },
];

export const initialSupplies: Supply[] = [
  { id: "s1", name: "Harina 000", unit: "kg", stock: 25, min: 10, expiry: "2026-12-20" },
  { id: "s2", name: "Leche entera", unit: "L", stock: 8, min: 10, expiry: "2026-09-12" },
  { id: "s3", name: "Jamón cocido", unit: "fetas", stock: 120, min: 60, expiry: "2026-09-15" },
  { id: "s4", name: "Queso paraguay", unit: "kg", stock: 4, min: 5, expiry: "2026-09-10" },
  { id: "s5", name: "Café molido", unit: "kg", stock: 6, min: 3, expiry: "2027-03-01" },
  { id: "s6", name: "Carne molida", unit: "kg", stock: 12, min: 8, expiry: "2026-09-09" },
];

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const nowTime = () =>
  new Date().toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });

/** Días que faltan para el vencimiento (negativo si ya venció). */
export const daysToExpiry = (iso: string) =>
  Math.ceil((new Date(`${iso}T00:00:00`).getTime() - Date.now()) / 86400000);

export const supplyAlert = (s: Supply): "vencido" | "por-vencer" | "critico" | "ok" => {
  const d = daysToExpiry(s.expiry);
  if (d < 0) return "vencido";
  if (s.stock <= s.min) return "critico";
  if (d <= 7) return "por-vencer";
  return "ok";
};
