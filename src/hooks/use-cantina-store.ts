import { useMemo, useState } from "react";
import {
  initialOrders,
  initialProducts,
  type Order,
  type OrderStatus,
  type Product,
} from "@/lib/cantina-data";
import {
  initialEmployees,
  initialSupplies,
  nowTime,
  todayISO,
  type Attendance,
  type CashSession,
  type Employee,
  type Expense,
  type Invoice,
  type StaffPayment,
  type Supply,
} from "@/lib/cantina-business";

export type NewOrderInput = {
  student: string;
  items: { name: string; qty: number; productId: string }[];
  total: number;
  payment: "efectivo" | "digital";
  note: string;
  customer: string;
  ruc: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export function useCantinaStore() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>(initialSupplies);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [staffPayments, setStaffPayments] = useState<StaffPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cash, setCash] = useState<CashSession>({
    open: false,
    opening: 0,
    openedAt: null,
    closedAt: null,
    counted: null,
  });

  // ---------- Pedidos ----------
  const placeOrder = (input: NewOrderInput) => {
    const code = `CU-${1044 + orders.length}`;
    const order: Order = {
      id: uid(),
      code,
      student: input.student,
      items: input.items.map(({ name, qty }) => ({ name, qty })),
      total: input.total,
      payment: input.payment,
      note: input.note,
      status: "pendiente",
      time: nowTime(),
    };
    setOrders((prev) => [order, ...prev]);
    setProducts((prev) =>
      prev.map((p) => {
        const line = input.items.find((i) => i.productId === p.id);
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
      }),
    );
    setInvoices((prev) => [
      {
        id: uid(),
        number: `001-001-${String(prev.length + 1).padStart(7, "0")}`,
        orderCode: code,
        customer: input.customer.trim() || input.student,
        ruc: input.ruc.trim() || "Sin RUC",
        items: order.items,
        total: input.total,
        payment: input.payment,
        status: "emitida",
        date: todayISO(),
        time: order.time,
      },
      ...prev,
    ]);
    return order;
  };

  const advanceOrder = (id: string, status: OrderStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  // ---------- Productos ----------
  const createProduct = (p: Omit<Product, "id">) =>
    setProducts((prev) => [{ ...p, id: `p${Date.now()}` }, ...prev]);

  const updateProduct = (id: string, patch: Partial<Product>) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const deleteProduct = (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const updateStock = (id: string, delta: number | "zero" | "reset") =>
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              stock:
                delta === "zero" ? 0 : delta === "reset" ? 10 : Math.max(0, p.stock + delta),
            }
          : p,
      ),
    );

  // ---------- Insumos ----------
  const createSupply = (s: Omit<Supply, "id">) =>
    setSupplies((prev) => [{ ...s, id: uid() }, ...prev]);
  const updateSupply = (id: string, patch: Partial<Supply>) =>
    setSupplies((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const deleteSupply = (id: string) => setSupplies((prev) => prev.filter((s) => s.id !== id));

  // ---------- Caja ----------
  const openCash = (opening: number) =>
    setCash({ open: true, opening, openedAt: nowTime(), closedAt: null, counted: null });
  const closeCash = (counted: number) =>
    setCash((prev) => ({ ...prev, open: false, closedAt: nowTime(), counted }));
  const addExpense = (concept: string, amount: number) =>
    setExpenses((prev) => [{ id: uid(), concept, amount, time: nowTime() }, ...prev]);

  // ---------- Facturación ----------
  const voidInvoice = (id: string) =>
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "anulada" as const } : i)),
    );

  // ---------- RRHH ----------
  const createEmployee = (e: Omit<Employee, "id">) =>
    setEmployees((prev) => [...prev, { ...e, id: uid() }]);
  const deleteEmployee = (id: string) =>
    setEmployees((prev) => prev.filter((e) => e.id !== id));

  const checkIn = (employeeId: string) =>
    setAttendance((prev) => [
      { id: uid(), employeeId, date: todayISO(), checkIn: nowTime(), checkOut: null },
      ...prev,
    ]);

  const checkOut = (employeeId: string) =>
    setAttendance((prev) =>
      prev.map((a) =>
        a.employeeId === employeeId && a.date === todayISO() && !a.checkOut
          ? { ...a, checkOut: nowTime() }
          : a,
      ),
    );

  const payStaff = (employeeId: string, type: StaffPayment["type"], amount: number) =>
    setStaffPayments((prev) => [
      { id: uid(), employeeId, type, amount, date: todayISO() },
      ...prev,
    ]);

  // ---------- Totales ----------
  const totals = useMemo(() => {
    const valid = invoices.filter((i) => i.status === "emitida");
    const efectivo = valid
      .filter((i) => i.payment === "efectivo")
      .reduce((s, i) => s + i.total, 0);
    const digital = valid.filter((i) => i.payment === "digital").reduce((s, i) => s + i.total, 0);
    const egresos = expenses.reduce((s, e) => s + e.amount, 0);
    const sueldos = staffPayments.reduce((s, p) => s + p.amount, 0);
    return {
      efectivo,
      digital,
      ventas: efectivo + digital,
      egresos: egresos + sueldos,
      esperadoEnCaja: cash.opening + efectivo - egresos - sueldos,
      diferencia: cash.counted === null ? null : cash.counted - (cash.opening + efectivo - egresos - sueldos),
    };
  }, [invoices, expenses, staffPayments, cash]);

  const alerts = useMemo(() => {
    const lowProducts = products.filter((p) => p.stock <= (p.minStock ?? 3));
    const lowSupplies = supplies.filter((s) => s.stock <= s.min);
    const expiring = supplies.filter(
      (s) => (new Date(`${s.expiry}T00:00:00`).getTime() - Date.now()) / 86400000 <= 7,
    );
    return { lowProducts, lowSupplies, expiring, count: lowProducts.length + lowSupplies.length + expiring.length };
  }, [products, supplies]);

  return {
    products,
    orders,
    invoices,
    supplies,
    employees,
    attendance,
    staffPayments,
    expenses,
    cash,
    totals,
    alerts,
    placeOrder,
    advanceOrder,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    createSupply,
    updateSupply,
    deleteSupply,
    openCash,
    closeCash,
    addExpense,
    voidInvoice,
    createEmployee,
    deleteEmployee,
    checkIn,
    checkOut,
    payStaff,
  };
}

export type CantinaStore = ReturnType<typeof useCantinaStore>;
