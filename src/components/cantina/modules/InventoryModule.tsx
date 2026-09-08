import { useState } from "react";
import { AlertTriangle, Ban, Minus, PackagePlus, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  type Product,
} from "@/lib/cantina-data";
import { daysToExpiry, supplyAlert, type Supply } from "@/lib/cantina-business";
import type { CantinaStore } from "@/hooks/use-cantina-store";

export function InventoryModule({ store }: { store: CantinaStore }) {
  const {
    products,
    supplies,
    alerts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    createSupply,
    updateSupply,
    deleteSupply,
  } = store;

  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div className="space-y-8">
      {alerts.count > 0 && (
        <section className="rounded-3xl border border-warning bg-warning/15 p-4">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <AlertTriangle className="h-5 w-5" /> Alertas de reposición y vencimiento
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            {alerts.lowProducts.map((p) => (
              <li key={p.id}>
                • <strong>{p.name}</strong>:{" "}
                {p.stock === 0 ? "agotado, hay que reponer" : `quedan ${p.stock} unidades`}
              </li>
            ))}
            {alerts.lowSupplies.map((s) => (
              <li key={`ls-${s.id}`}>
                • <strong>{s.name}</strong>: nivel crítico ({s.stock} {s.unit}, mínimo {s.min})
              </li>
            ))}
            {alerts.expiring.map((s) => {
              const d = daysToExpiry(s.expiry);
              return (
                <li key={`ex-${s.id}`}>
                  • <strong>{s.name}</strong>:{" "}
                  {d < 0 ? `vencido hace ${Math.abs(d)} día(s)` : `vence en ${d} día(s)`}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold">Productos del menú</h2>
            <p className="text-sm text-muted-foreground">
              Cargá, editá o eliminá productos y ajustá el stock con un clic.
            </p>
          </div>
          <ProductDialog
            onSave={(data) => createProduct(data)}
            trigger={
              <Button className="rounded-full" size="lg">
                <PackagePlus className="mr-2 h-5 w-5" /> Agregar producto
              </Button>
            }
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border bg-card shadow-card">
          {products.map((p) => {
            const state = stockState(p.stock);
            const dot =
              state === "agotado" ? "bg-destructive" : state === "bajo" ? "bg-warning" : "bg-success";
            return (
              <div
                key={p.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-3 last:border-0 md:grid-cols-[minmax(0,3fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_auto]"
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

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateStock(p.id, -1)}
                    aria-label="Quitar stock"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-7 text-center text-sm font-bold">{p.stock}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateStock(p.id, 1)}
                    aria-label="Agregar stock"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {p.stock === 0 ? (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateStock(p.id, "reset")}
                      aria-label="Reponer stock"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateStock(p.id, "zero")}
                      aria-label="Marcar agotado"
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setEditing(p)}
                  >
                    <Pencil className="mr-1 h-4 w-4" /> Editar
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-destructive"
                    onClick={() => deleteProduct(p.id)}
                    aria-label={`Eliminar ${p.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <SuppliesSection
        supplies={supplies}
        onCreate={createSupply}
        onUpdate={updateSupply}
        onDelete={deleteSupply}
      />

      {editing && (
        <ProductDialog
          key={editing.id}
          product={editing}
          openControlled
          onOpenChange={(v) => !v && setEditing(null)}
          onSave={(data) => {
            updateProduct(editing.id, data);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function SuppliesSection({
  supplies,
  onCreate,
  onUpdate,
  onDelete,
}: {
  supplies: Supply[];
  onCreate: (s: Omit<Supply, "id">) => void;
  onUpdate: (id: string, patch: Partial<Supply>) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState({ name: "", unit: "kg", stock: "", min: "", expiry: "" });

  return (
    <section>
      <h2 className="font-display text-2xl font-bold">Insumos y materia prima</h2>
      <p className="text-sm text-muted-foreground">
        Harina, leche, fetas de jamón y todo lo que se usa para cocinar.
      </p>

      <form
        className="mt-4 grid gap-2 rounded-3xl border bg-card p-4 shadow-card sm:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault();
          const stock = Number(form.stock);
          const min = Number(form.min);
          if (!form.name.trim() || !Number.isFinite(stock) || !Number.isFinite(min)) return;
          onCreate({
            name: form.name.trim().slice(0, 60),
            unit: form.unit.trim() || "u",
            stock,
            min,
            expiry: form.expiry || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          });
          setForm({ name: "", unit: "kg", stock: "", min: "", expiry: "" });
        }}
      >
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="su-name">Insumo</Label>
          <Input
            id="su-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Harina 000"
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="su-unit">Unidad</Label>
          <Input
            id="su-unit"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="kg"
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="su-stock">Cantidad</Label>
          <Input
            id="su-stock"
            inputMode="numeric"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value.replace(/\D/g, "") })}
            placeholder="25"
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="su-min">Mínimo</Label>
          <Input
            id="su-min"
            inputMode="numeric"
            value={form.min}
            onChange={(e) => setForm({ ...form, min: e.target.value.replace(/\D/g, "") })}
            placeholder="10"
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="su-exp">Vencimiento</Label>
          <Input
            id="su-exp"
            type="date"
            value={form.expiry}
            onChange={(e) => setForm({ ...form, expiry: e.target.value })}
            className="rounded-2xl"
          />
        </div>
        <Button type="submit" className="rounded-full sm:col-span-6">
          Agregar insumo
        </Button>
      </form>

      <div className="mt-4 overflow-hidden rounded-3xl border bg-card shadow-card">
        {supplies.map((s) => {
          const alert = supplyAlert(s);
          const badge =
            alert === "vencido"
              ? { t: "Vencido", c: "bg-destructive text-destructive-foreground" }
              : alert === "critico"
                ? { t: "Stock crítico", c: "bg-warning text-warning-foreground" }
                : alert === "por-vencer"
                  ? { t: "Por vencer", c: "bg-warning text-warning-foreground" }
                  : { t: "En orden", c: "bg-success text-success-foreground" };
          return (
            <div
              key={s.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {s.name}{" "}
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${badge.c}`}>
                    {badge.t}
                  </span>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.stock} {s.unit} · mínimo {s.min} {s.unit} · vence {s.expiry}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full"
                  onClick={() => onUpdate(s.id, { stock: Math.max(0, s.stock - 1) })}
                  aria-label="Descontar insumo"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full"
                  onClick={() => onUpdate(s.id, { stock: s.stock + 1 })}
                  aria-label="Reponer insumo"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-destructive"
                  onClick={() => onDelete(s.id)}
                  aria-label={`Eliminar ${s.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProductDialog({
  product,
  trigger,
  openControlled,
  onOpenChange,
  onSave,
}: {
  product?: Product;
  trigger?: React.ReactNode;
  openControlled?: boolean;
  onOpenChange?: (v: boolean) => void;
  onSave: (data: Omit<Product, "id">) => void;
}) {
  const [open, setOpen] = useState(!!openControlled);
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState<CategoryId>(product?.category ?? "golosinas");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [image, setImage] = useState(product?.image ?? "");
  const [error, setError] = useState("");

  const setOpenState = (v: boolean) => {
    setOpen(v);
    onOpenChange?.(v);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!name.trim() || !Number.isFinite(priceNum) || priceNum <= 0 || !Number.isFinite(stockNum)) {
      setError("Completá nombre, precio mayor a 0 y stock válido.");
      return;
    }
    onSave({
      name: name.trim().slice(0, 60),
      description: description.trim().slice(0, 120) || "Producto de la cantina.",
      price: Math.round(priceNum),
      category,
      emoji: categories.find((c) => c.id === category)?.emoji ?? "🍽️",
      stock: Math.round(stockNum),
      image: image.trim() || categoryImage[category],
    });
    setOpenState(false);
  };

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpenState}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {product ? `Editar ${product.name}` : "Nuevo producto"}
          </DialogTitle>
          <DialogDescription>
            Cambiá precio, foto y stock; se actualiza al instante en el menú del alumno.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pd-name">Nombre</Label>
            <Input
              id="pd-name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Galletitas Niquito"
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pd-desc">Descripción</Label>
            <Input
              id="pd-desc"
              value={description}
              maxLength={120}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Con dulce de leche y coco"
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
              <Label htmlFor="pd-price">Precio (Gs.)</Label>
              <Input
                id="pd-price"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="8000"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pd-stock">Stock</Label>
              <Input
                id="pd-stock"
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="20"
                className="rounded-2xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pd-img">Fotografía (enlace o archivo)</Label>
            <Input
              id="pd-img"
              value={image.startsWith("data:") ? "" : image}
              onChange={(e) => setImage(e.target.value.slice(0, 500))}
              placeholder="https://images.unsplash.com/..."
              className="rounded-2xl"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0])}
              className="rounded-2xl"
            />
            {image && (
              <img src={image} alt="Vista previa" className="h-28 w-full rounded-2xl object-cover" />
            )}
          </div>

          {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" className="w-full rounded-full" size="lg">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
