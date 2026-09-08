import { useState } from "react";
import { Banknote, CreditCard, LockOpen, Lock, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/cantina-data";
import type { CantinaStore } from "@/hooks/use-cantina-store";

export function CashModule({ store }: { store: CantinaStore }) {
  const { cash, totals, expenses, openCash, closeCash, addExpense } = store;
  const [opening, setOpening] = useState("");
  const [counted, setCounted] = useState("");
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");

  const stat = (label: string, value: string, icon: React.ReactNode, cls: string) => (
    <div className="rounded-3xl border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={`grid h-8 w-8 place-items-center rounded-xl ${cls}`}>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-2 truncate font-display text-2xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <section>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold">Caja diaria</h2>
            <p className="text-sm text-muted-foreground">
              {cash.open
                ? `Caja abierta desde las ${cash.openedAt} con ${formatPrice(cash.opening)}.`
                : cash.closedAt
                  ? `Caja cerrada a las ${cash.closedAt}.`
                  : "Todavía no abriste la caja de hoy."}
            </p>
          </div>
          <span
            className={`justify-self-start rounded-full px-4 py-1.5 text-sm font-bold sm:justify-self-end ${
              cash.open ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {cash.open ? "Abierta" : "Cerrada"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stat("Monto inicial", formatPrice(cash.opening), <LockOpen className="h-4 w-4" />, "bg-muted")}
          {stat(
            "Efectivo cobrado",
            formatPrice(totals.efectivo),
            <Banknote className="h-4 w-4" />,
            "bg-success/20 text-success",
          )}
          {stat(
            "Tarjeta / App",
            formatPrice(totals.digital),
            <CreditCard className="h-4 w-4" />,
            "bg-primary/20 text-primary",
          )}
          {stat(
            "Egresos y pagos",
            formatPrice(totals.egresos),
            <TrendingDown className="h-4 w-4" />,
            "bg-destructive/15 text-destructive",
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border bg-card p-5 shadow-card">
          <h3 className="font-display text-lg font-bold">
            {cash.open ? "Cierre y arqueo" : "Apertura de caja"}
          </h3>
          {!cash.open ? (
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const n = Number(opening);
                if (!Number.isFinite(n) || n < 0) return;
                openCash(Math.round(n));
                setOpening("");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="apertura">Monto inicial en caja (Gs.)</Label>
                <Input
                  id="apertura"
                  inputMode="numeric"
                  value={opening}
                  onChange={(e) => setOpening(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="200000"
                  className="h-12 rounded-2xl"
                />
              </div>
              <Button type="submit" size="lg" className="w-full rounded-full">
                <LockOpen className="mr-2 h-5 w-5" /> Abrir caja
              </Button>
            </form>
          ) : (
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const n = Number(counted);
                if (!Number.isFinite(n) || n < 0) return;
                closeCash(Math.round(n));
                setCounted("");
              }}
            >
              <div className="rounded-2xl bg-muted/60 p-3 text-sm">
                <p className="flex justify-between">
                  <span>Ventas del día</span>
                  <span className="font-bold">{formatPrice(totals.ventas)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Egresos y sueldos</span>
                  <span className="font-bold">- {formatPrice(totals.egresos)}</span>
                </p>
                <p className="mt-1 flex justify-between border-t pt-1 font-display text-base font-bold">
                  <span>Efectivo esperado</span>
                  <span className="text-primary">{formatPrice(totals.esperadoEnCaja)}</span>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conteo">Efectivo contado (Gs.)</Label>
                <Input
                  id="conteo"
                  inputMode="numeric"
                  value={counted}
                  onChange={(e) => setCounted(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="450000"
                  className="h-12 rounded-2xl"
                />
              </div>
              <Button type="submit" size="lg" variant="secondary" className="w-full rounded-full">
                <Lock className="mr-2 h-5 w-5" /> Cerrar caja y hacer arqueo
              </Button>
            </form>
          )}

          {cash.counted !== null && totals.diferencia !== null && (
            <p
              className={`mt-4 rounded-2xl p-3 text-sm font-semibold ${
                totals.diferencia === 0
                  ? "bg-success/15 text-success"
                  : "bg-warning/20 text-warning-foreground"
              }`}
            >
              Arqueo: contaste {formatPrice(cash.counted)} ·{" "}
              {totals.diferencia === 0
                ? "sin diferencia 🎉"
                : `diferencia de ${formatPrice(totals.diferencia)}`}
            </p>
          )}
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-card">
          <h3 className="font-display text-lg font-bold">Egresos y gastos menores</h3>
          <form
            className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(amount);
              if (!concept.trim() || !Number.isFinite(n) || n <= 0) return;
              addExpense(concept.trim().slice(0, 60), Math.round(n));
              setConcept("");
              setAmount("");
            }}
          >
            <Input
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej: Compra de servilletas"
              className="rounded-2xl"
            />
            <div className="flex gap-2">
              <Input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="35000"
                className="w-32 rounded-2xl"
              />
              <Button type="submit" className="rounded-full">
                Registrar
              </Button>
            </div>
          </form>

          <ul className="mt-4 space-y-2 text-sm">
            {expenses.length === 0 && (
              <li className="rounded-2xl border border-dashed p-4 text-center text-muted-foreground">
                Sin egresos registrados hoy
              </li>
            )}
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-2xl bg-muted/60 px-3 py-2">
                <span className="min-w-0 truncate">
                  {e.concept} <span className="text-xs text-muted-foreground">· {e.time}</span>
                </span>
                <span className="shrink-0 font-bold text-destructive">- {formatPrice(e.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
