import { Ban, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/cantina-data";
import type { Invoice } from "@/lib/cantina-business";
import type { CantinaStore } from "@/hooks/use-cantina-store";

function invoiceText(i: Invoice) {
  const lines = [
    "CANTINA UNIVERSITARIA",
    "Ticket fiscal simplificado",
    "--------------------------------",
    `Factura Nº: ${i.number}`,
    `Pedido: ${i.orderCode}`,
    `Fecha: ${i.date} ${i.time}`,
    `Cliente: ${i.customer}`,
    `RUC / C.I.: ${i.ruc}`,
    "--------------------------------",
    ...i.items.map((it) => `${it.qty} x ${it.name}`),
    "--------------------------------",
    `TOTAL: ${formatPrice(i.total)}`,
    `Pago: ${i.payment === "efectivo" ? "Efectivo en caja" : "Tarjeta / App"}`,
    `Estado: ${i.status.toUpperCase()}`,
  ];
  return lines.join("\n");
}

export function BillingModule({ store }: { store: CantinaStore }) {
  const { invoices, voidInvoice } = store;

  const download = (i: Invoice) => {
    const blob = new Blob([invoiceText(i)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factura-${i.number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const print = (i: Invoice) => {
    const w = window.open("", "_blank", "width=420,height=640");
    if (!w) return;
    w.document.write(
      `<pre style="font-family:ui-monospace,monospace;font-size:13px">${invoiceText(i)}</pre>`,
    );
    w.document.close();
    w.print();
  };

  const emitidas = invoices.filter((i) => i.status === "emitida");

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold">Facturación y comprobantes</h2>
        <p className="text-sm text-muted-foreground">
          Cada pedido confirmado genera su ticket fiscal simplificado automáticamente.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Comprobantes emitidos</p>
          <p className="font-display text-2xl font-bold">{emitidas.length}</p>
        </div>
        <div className="rounded-3xl border bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Anulados</p>
          <p className="font-display text-2xl font-bold">{invoices.length - emitidas.length}</p>
        </div>
        <div className="rounded-3xl border bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Facturado</p>
          <p className="font-display text-2xl font-bold text-primary">
            {formatPrice(emitidas.reduce((s, i) => s + i.total, 0))}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {invoices.length === 0 && (
          <p className="rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Todavía no se emitieron comprobantes. Se crean solos al confirmar un pedido.
          </p>
        )}
        {invoices.map((i) => (
          <div key={i.id} className="rounded-3xl border bg-card p-4 shadow-card">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-bold">{i.number}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      i.status === "emitida"
                        ? "bg-success text-success-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {i.status === "emitida" ? "Emitida" : "Anulada"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Pedido {i.orderCode} · {i.date} {i.time}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm">
                  {i.customer} · <span className="text-muted-foreground">RUC/C.I.: {i.ruc}</span>
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {i.items.map((it) => `${it.qty}× ${it.name}`).join(" · ")}
                </p>
                <p className="mt-1 font-display font-bold text-primary">{formatPrice(i.total)}</p>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => print(i)}>
                  <Printer className="mr-1 h-4 w-4" /> Imprimir
                </Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => download(i)}>
                  <Download className="mr-1 h-4 w-4" /> Descargar
                </Button>
                {i.status === "emitida" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-full"
                    onClick={() => voidInvoice(i.id)}
                  >
                    <Ban className="mr-1 h-4 w-4" /> Anular
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
