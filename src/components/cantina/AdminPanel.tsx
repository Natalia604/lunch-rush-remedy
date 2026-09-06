import { Minus, Plus, Ban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatPrice,
  stockState,
  type Order,
  type OrderStatus,
  type Product,
} from "@/lib/cantina-data";

const columns: { id: OrderStatus; label: string; cls: string }[] = [
  { id: "pendiente", label: "Pendiente", cls: "bg-warning text-warning-foreground" },
  { id: "preparacion", label: "En preparación", cls: "bg-primary text-primary-foreground" },
  { id: "listo", label: "Listo para retirar", cls: "bg-success text-success-foreground" },
];

export function AdminPanel({
  orders,
  products,
  onAdvance,
  onStock,
}: {
  orders: Order[];
  products: Product[];
  onAdvance: (id: string, status: OrderStatus) => void;
  onStock: (id: string, delta: number | "zero" | "reset") => void;
}) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl font-bold">Pedidos en tiempo real</h2>
        <p className="text-sm text-muted-foreground">
          Movés el pedido de columna a medida que avanza la preparación.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {columns.map((col) => {
            const list = orders.filter((o) => o.status === col.id);
            return (
              <div key={col.id} className="rounded-3xl border bg-card p-4 shadow-card">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <h3 className="truncate font-display text-lg font-bold">{col.label}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${col.cls}`}
                  >
                    {list.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {list.length === 0 && (
                    <p className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                      Sin pedidos aquí
                    </p>
                  )}
                  {list.map((o) => (
                    <div key={o.id} className="rounded-2xl bg-muted/60 p-3">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                        <p className="truncate font-display font-bold">{o.code}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{o.time}</span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{o.student}</p>
                      <ul className="mt-2 space-y-0.5 text-sm">
                        {o.items.map((i, idx) => (
                          <li key={idx} className="truncate">
                            {i.qty}× {i.name}
                          </li>
                        ))}
                      </ul>
                      {o.note && (
                        <p className="mt-2 rounded-xl bg-card px-2 py-1 text-xs italic text-muted-foreground">
                          “{o.note}”
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-card px-2 py-0.5 font-semibold">
                          {o.payment === "efectivo" ? "Efectivo en caja" : "Tarjeta / Digital"}
                        </span>
                        <span className="font-display font-bold text-primary">
                          {formatPrice(o.total)}
                        </span>
                      </div>
                      {col.id !== "listo" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-3 w-full rounded-full"
                          onClick={() =>
                            onAdvance(o.id, col.id === "pendiente" ? "preparacion" : "listo")
                          }
                        >
                          {col.id === "pendiente" ? "Comenzar preparación" : "Marcar listo"}
                        </Button>
                      )}
                      {col.id === "listo" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-3 w-full rounded-full"
                          onClick={() => onAdvance(o.id, "pendiente")}
                        >
                          Reabrir
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold">Control de inventario</h2>
        <p className="text-sm text-muted-foreground">
          Ajustá el stock o marcá un producto como agotado con un clic.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => {
            const state = stockState(p.stock);
            const dot =
              state === "agotado" ? "bg-destructive" : state === "bajo" ? "bg-warning" : "bg-success";
            return (
              <div
                key={p.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card p-3 shadow-card"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-lg">
                    {p.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`h-2 w-2 rounded-full ${dot}`} />
                      Stock: {p.stock}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => onStock(p.id, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => onStock(p.id, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {p.stock === 0 ? (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onStock(p.id, "reset")}
                      aria-label="Reponer stock"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onStock(p.id, "zero")}
                      aria-label="Marcar agotado"
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
