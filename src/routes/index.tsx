import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  CheckCircle2,
  UtensilsCrossed,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/cantina/ProductCard";
import { AdminPanel } from "@/components/cantina/AdminPanel";
import { LoginScreen } from "@/components/cantina/LoginScreen";

import {
  categories,
  formatPrice,
  initialOrders,
  initialProducts,
  type CategoryId,
  type Order,
  type OrderStatus,
  type Product,
} from "@/lib/cantina-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cantina Universitaria — Pedí sin filas" },
      {
        name: "description",
        content:
          "Pedí tu desayuno, almuerzo, bebida o postre en la Cantina Universitaria y retiralo sin hacer fila. Stock en tiempo real y panel para el personal.",
      },
      { property: "og:title", content: "Cantina Universitaria — Pedí sin filas" },
      {
        property: "og:description",
        content:
          "Catálogo con stock en vivo, pago en caja o digital y boleto digital con el estado de tu pedido.",
      },
    ],
  }),
  component: Index,
});

type CartLine = { product: Product; qty: number };

function Index() {
  const [session, setSession] = useState<{ role: "alumno" | "cantina"; name: string } | null>(null);
  const [view, setView] = useState<"alumno" | "cantina">("alumno");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "todas">("todas");
  const [payment, setPayment] = useState<"efectivo" | "digital">("efectivo");
  const [note, setNote] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [ticket, setTicket] = useState<Order | null>(null);

  const student = session?.name ?? "Alumno";


  const visible = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "todas" || p.category === category) &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase())),
      ),
    [products, category, query],
  );

  const count = cart.reduce((s, l) => s + l.qty, 0);
  const total = cart.reduce((s, l) => s + l.qty * l.product.price, 0);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const found = prev.find((l) => l.product.id === p.id);
      if (found) {
        if (found.qty >= p.stock) return prev;
        return prev.map((l) => (l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { product: p, qty: 1 }];
    });
    setCartOpen(true);
  };

  const changeQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((l) =>
          l.product.id === id
            ? { ...l, qty: Math.min(Math.max(l.qty + delta, 0), l.product.stock) }
            : l,
        )
        .filter((l) => l.qty > 0),
    );

  const confirmOrder = () => {
    if (cart.length === 0) return;
    const order: Order = {
      id: crypto.randomUUID(),
      code: `CU-${1044 + orders.length}`,
      student: `${student} Peralta`,
      items: cart.map((l) => ({ name: l.product.name, qty: l.qty })),
      total,
      payment,
      note,
      status: "pendiente",
      time: new Date().toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" }),
    };
    setOrders((prev) => [order, ...prev]);
    setProducts((prev) =>
      prev.map((p) => {
        const line = cart.find((l) => l.product.id === p.id);
        return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
      }),
    );
    setCart([]);
    setNote("");
    setCartOpen(false);
    setTicket(order);
  };

  const advance = (id: string, status: OrderStatus) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

  const updateStock = (id: string, delta: number | "zero" | "reset") =>
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              stock:
                delta === "zero"
                  ? 0
                  : delta === "reset"
                    ? 10
                    : Math.max(0, p.stock + delta),
            }
          : p,
      ),
    );

  const createProduct = (p: Omit<Product, "id">) =>
    setProducts((prev) => [{ ...p, id: `p${Date.now()}` }, ...prev]);

  const signOut = () => {
    setSession(null);
    setCart([]);
    setTicket(null);
    setCartOpen(false);
  };

  if (!session) {
    return (
      <LoginScreen
        onStudent={(name) => {
          setSession({ role: "alumno", name });
          setView("alumno");
        }}
        onStaff={() => {
          setSession({ role: "cantina", name: "Cantina" });
          setView("cantina");
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16">

      <header className="bg-gradient-warm px-4 pb-10 pt-6 text-primary-foreground shadow-soft sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card/25 text-xl">
                <UtensilsCrossed className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest opacity-80">Cantina Universitaria</p>
                <h1 className="truncate font-display text-xl font-bold sm:text-2xl">
                  {view === "alumno" ? `¡Hola, ${student}! 👋` : "Panel de cantina"}
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="flex rounded-full bg-card/25 p-1 text-xs font-semibold">
                <button
                  onClick={() => setView("alumno")}
                  className={`rounded-full px-3 py-1.5 transition-colors ${view === "alumno" ? "bg-card text-primary" : ""}`}
                >
                  Alumno
                </button>
                <button
                  onClick={() => setView("cantina")}
                  className={`rounded-full px-3 py-1.5 transition-colors ${view === "cantina" ? "bg-card text-primary" : ""}`}
                >
                  Cantina
                </button>
              </div>

              {view === "alumno" && (
                <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                  <SheetTrigger asChild>
                    <button className="relative grid h-11 w-11 place-items-center rounded-2xl bg-card/25 transition-colors hover:bg-card/40">
                      <ShoppingCart className="h-5 w-5" />
                      {count > 0 && (
                        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-card px-1 text-xs font-bold text-primary">
                          {count}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle className="font-display text-xl">Tu pedido</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                      {cart.length === 0 && (
                        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                          Todavía no agregaste nada. ¡Elegí algo rico! 🥐
                        </p>
                      )}
                      {cart.map((l) => (
                        <div
                          key={l.product.id}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-lg">
                              {l.product.emoji}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{l.product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatPrice(l.product.price)}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full"
                              onClick={() => changeQty(l.product.id, -1)}
                            >
                              {l.qty === 1 ? (
                                <Trash2 className="h-4 w-4" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                            </Button>
                            <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-full"
                              onClick={() => changeQty(l.product.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {cart.length > 0 && (
                        <div className="space-y-4 pt-2">
                          <div>
                            <p className="mb-2 text-sm font-semibold">Método de pago</p>
                            <div className="grid grid-cols-2 gap-2">
                              {(["efectivo", "digital"] as const).map((m) => (
                                <button
                                  key={m}
                                  onClick={() => setPayment(m)}
                                  className={`rounded-2xl border p-3 text-sm font-semibold transition-colors ${
                                    payment === m
                                      ? "border-primary bg-secondary text-secondary-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {m === "efectivo" ? "💵 Efectivo en caja" : "💳 Tarjeta / Digital"}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-sm font-semibold">Nota para la cantina</p>
                            <Textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="Ej: Sin mayonesa · Retiro a las 10:15 hs"
                              className="rounded-2xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t p-4">
                      <div className="mb-3 flex items-center justify-between font-display text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(total)}</span>
                      </div>
                      <Button
                        className="w-full rounded-full"
                        size="lg"
                        disabled={cart.length === 0}
                        onClick={confirmOrder}
                      >
                        Confirmar pedido
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>

          {view === "alumno" && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar empanadas, jugos, tostados..."
                className="h-12 rounded-full border-0 bg-card pl-11 text-foreground shadow-card"
              />
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto -mt-4 max-w-6xl px-4 sm:px-6">
        {view === "cantina" ? (
          <div className="rounded-3xl bg-background pt-8">
            <AdminPanel
              orders={orders}
              products={products}
              onAdvance={advance}
              onStock={updateStock}
            />
          </div>
        ) : (
          <div className="space-y-8 pt-8">
            {ticket && (
              <section className="overflow-hidden rounded-3xl border bg-card shadow-card">
                <div className="bg-gradient-fresh px-5 py-4 text-accent-foreground">
                  <p className="flex items-center gap-2 font-display text-lg font-bold">
                    <CheckCircle2 className="h-5 w-5" /> ¡Pedido confirmado!
                  </p>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0 space-y-1">
                    <p className="font-display text-3xl font-bold tracking-tight">{ticket.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.items.map((i) => `${i.qty}× ${i.name}`).join(" · ")}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">{formatPrice(ticket.total)}</span> ·{" "}
                      {ticket.payment === "efectivo" ? "Efectivo en caja" : "Tarjeta / Digital"}
                    </p>
                    {ticket.note && (
                      <p className="text-sm italic text-muted-foreground">“{ticket.note}”</p>
                    )}
                  </div>
                  <div className="shrink-0 text-center">
                    <span className="inline-block rounded-full bg-warning px-4 py-2 text-sm font-bold text-warning-foreground">
                      {orders.find((o) => o.id === ticket.id)?.status === "listo"
                        ? "Listo para retirar"
                        : orders.find((o) => o.id === ticket.id)?.status === "preparacion"
                          ? "En preparación"
                          : "Pendiente"}
                    </span>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Mostrá este código en el mostrador
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section>
              <h2 className="font-display text-2xl font-bold">Categorías</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  onClick={() => setCategory("todas")}
                  className={`rounded-2xl border bg-card p-4 text-left font-semibold shadow-card transition-colors ${
                    category === "todas" ? "border-primary bg-secondary" : ""
                  }`}
                >
                  <span className="block text-2xl">🍴</span>
                  <span className="mt-1 block text-sm">Todo el menú</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`overflow-hidden rounded-2xl border bg-card text-left shadow-card transition-colors ${
                      category === c.id ? "border-primary" : ""
                    }`}
                  >
                    <img
                      src={c.image}
                      alt={c.label}
                      loading="lazy"
                      width={768}
                      height={512}
                      className="h-20 w-full object-cover"
                    />
                    <span className="block p-3 text-sm font-semibold">
                      {c.emoji} {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold">Menú de hoy</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={addToCart} />
                ))}
              </div>
              {visible.length === 0 && (
                <p className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
                  No encontramos nada con “{query}”.
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
