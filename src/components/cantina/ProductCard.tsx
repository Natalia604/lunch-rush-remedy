import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, stockState, type Product } from "@/lib/cantina-data";


export function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  const state = stockState(product.stock);

  const badge =
    state === "agotado"
      ? { text: "Agotado", cls: "bg-destructive text-destructive-foreground" }
      : state === "bajo"
        ? {
            text: `¡Últimas unidades! (Stock: ${product.stock})`,
            cls: "bg-warning text-warning-foreground",
          }
        : {
            text: `Disponible (Stock: ${product.stock})`,
            cls: "bg-success text-success-foreground",
          };

  return (
    <article className="group overflow-hidden rounded-3xl border bg-card shadow-card transition-transform duration-200 hover:-translate-y-1">
      <div className="relative h-40 overflow-hidden bg-muted sm:h-44">
        <img
          src={product.image}
          alt={product.name}

          loading="lazy"
          width={768}
          height={512}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-2xl bg-card/90 text-xl shadow-card">
          {product.emoji}
        </span>
        <span
          className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}
        >
          {badge.text}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold">{product.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <span className="truncate font-display text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            className="shrink-0 rounded-full"
            disabled={state === "agotado"}
            onClick={() => onAdd(product)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        </div>
      </div>
    </article>
  );
}
