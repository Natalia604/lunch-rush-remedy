import { useState } from "react";
import { Minus, Plus, Ban, RotateCcw, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  categories,
  categoryImage,
  formatPrice,
  stockState,
  type CategoryId,
  type Order,
  type OrderStatus,
  type Product,
} from "@/lib/cantina-data";

const columns: { id: OrderStatus; label: string; cls: string }[] = [
  { id: "pendiente", label: "Pendiente", cls: "bg-warning text-warning-foreground" },
  { id: "preparacion", label: "En preparación", cls: "bg-primary text-primary-foreground" },
  { id: "listo", label: "Listo para entregar", cls: "bg-success text-success-foreground" },
];

export function AdminPanel({
  orders,
  products,
  onAdvance,
  onStock,
  onCreate,
}: {
  orders: Order[];
  products: Product[];
  onAdvance: (id: string, status: OrderStatus) => void;
  onStock: (id: string, delta: number | "zero" | "reset") => void;
  onCreate: (p: Omit<Product, "id">) => void;
}) {
  return (
    <Tabs defaultValue="pedidos" className="space-y-6">
      <TabsList className="rounded-full">
        <TabsTrigger value="pedidos" className="rounded-full">
          Pedidos entrantes
        </TabsTrigger>
        <TabsTrigger value="menu" className="rounded-full">
          Menú e inventario
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pedidos">
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
                          {o.payment === "efectivo" ? "Efectivo en caja" : "Tarjeta / App"}
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
                          {col.id === "pendiente" ? "Comenzar preparación" : "Listo para entregar"}
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
      </TabsContent>

      <TabsContent value="menu">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold">Gestión de menú e inventario</h2>
            <p className="text-sm text-muted-foreground">
              Dá de alta lo que acaba de llegar y ajustá el stock con un clic.
            </p>
          </div>
          <NewProductDialog onCreate={onCreate} />
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border bg-card shadow-card">
          <div className="hidden grid-cols-[minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_auto] gap-3 border-b bg-muted/60 px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground md:grid">
            <span>Producto</span>
            <span>Categoría</span>
            <span>Precio</span>
            <span className="text-right">Stock</span>
          </div>

          {products.map((p) => {
            const state = stockState(p.stock);
            const dot =
              state === "agotado"
                ? "bg-destructive"
                : state === "bajo"
                  ? "bg-warning"
                  : "bg-success";
            return (
              <div
                key={p.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-3 last:border-0 md:grid-cols-[minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_auto]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    width={768}
                    height={512}
                    className="h-11 w-11 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`h-2 w-2 rounded-full ${dot}`} />
                      {state === "agotado" ? "Agotado" : `Stock: ${p.stock}`}
                    </p>
                  </div>
                </div>

                <span className="hidden truncate text-sm text-muted-foreground md:block">
                  {categories.find((c) => c.id === p.category)?.label}
                </span>
                <span className="hidden truncate text-sm font-semibold md:block">
                  {formatPrice(p.price)}
                </span>

                <div className="flex shrink-0 items-center gap-1 justify-self-end">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => onStock(p.id, -1)}
                    aria-label="Quitar stock"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-7 text-center text-sm font-bold">{p.stock}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => onStock(p.id, 1)}
                    aria-label="Agregar stock"
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
      </TabsContent>
    </Tabs>
  );
}

function NewProductDialog({ onCreate }: { onCreate: (p: Omit<Product, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryId>("golosinas");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setCategory("golosinas");
    setPrice("");
    setStock("");
    setImage("");
    setError("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().slice(0, 60);
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!cleanName || !Number.isFinite(priceNum) || priceNum <= 0 || !Number.isFinite(stockNum) || stockNum < 0) {
      setError("Completá nombre, precio mayor a 0 y stock válido.");
      return;
    }
    onCreate({
      name: cleanName,
      description: "Producto agregado por la cantina.",
      price: Math.round(priceNum),
      category,
      emoji: categories.find((c) => c.id === category)?.emoji ?? "🍽️",
      stock: Math.round(stockNum),
      image: image.trim().startsWith("http") ? image.trim() : categoryImage[category],
    });
    reset();
    setOpen(false);
  };

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-full" size="lg">
          <PackagePlus className="mr-2 h-5 w-5" />
          Agregar nuevo producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nuevo producto</DialogTitle>
          <DialogDescription>
            Cargá lo que acaba de llegar a la cantina y queda visible al instante.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="np-name">Nombre del producto</Label>
            <Input
              id="np-name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Galletitas Niquito"
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`rounded-2xl border p-3 text-sm font-semibold transition-colors ${
                    category === c.id
                      ? "border-primary bg-secondary text-secondary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="np-price">Precio (Gs.)</Label>
              <Input
                id="np-price"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="8000"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="np-stock">Stock inicial</Label>
              <Input
                id="np-stock"
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="20"
                className="rounded-2xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="np-img">Fotografía (URL o archivo)</Label>
            <Input
              id="np-img"
              value={image.startsWith("data:") ? "" : image}
              onChange={(e) => setImage(e.target.value.slice(0, 500))}
              placeholder="https://..."
              className="rounded-2xl"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0])}
              className="rounded-2xl"
            />
            {image && (
              <img
                src={image}
                alt="Vista previa"
                className="h-28 w-full rounded-2xl object-cover"
              />
            )}
          </div>

          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" className="w-full rounded-full" size="lg">
              Guardar producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
