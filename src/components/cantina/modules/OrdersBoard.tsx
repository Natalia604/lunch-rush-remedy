import { Button } from "@/components/ui/button";
import { formatPrice, type Order, type OrderStatus } from "@/lib/cantina-data";

const columns: { id: OrderStatus; label: string; cls: string; next?: OrderStatus; cta?: string }[] = [
  {
    id: "pendiente",
    label: "Pendiente",
    cls: "bg-warning text-warning-foreground",
    next: "preparacion",
    cta: "Comenzar preparación",
  },
  {
    id: "preparacion",
    label: "En preparación",
    cls: "bg-primary text-primary-foreground",
    next: "listo",
    cta: "Marcar listo",
  },
  {
    id: "listo",
    label: "Listo para entregar",
    cls: "bg-success text-success-foreground",
    next: "entregado",
    cta: "Marcar entregado",
  },
  { id: "entregado", label: "Entregado", cls: "bg-muted text-muted-foreground" },
];

export function OrdersBoard({
  orders,
  onAdvance,
}: {
  orders: Order[];
  onAdvance: (id: string, status: OrderStatus) => void;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold">Pedidos en tiempo real</h2>
      <p className="text-sm text-muted-foreground">
        Movés el pedido de columna a medida que avanza la preparación.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const list = orders.filter((o) => o.status === col.id);
          return (
            <div key={col.id} className="rounded-3xl border bg-card p-4 shadow-card">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <h3 className="truncate font-display text-lg font-bold">{col.label}</h3>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${col.cls}`}>
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
                        {o.payment === "efectivo" ? "Efectivo en caja" : "Tarjeta / App"}
                      </span>
                      <span className="font-display font-bold text-primary">
                        {formatPrice(o.total)}
                      </span>
                    </div>
                    {col.next && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-3 w-full rounded-full"
                        onClick={() => onAdvance(o.id, col.next!)}
                      >
                        {col.cta}
                      </Button>
                    )}
                    {!col.next && (
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
  );
}
