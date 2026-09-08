import { useState } from "react";
import { LogIn, LogOut, Trash2, UserPlus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/cantina-data";
import { todayISO } from "@/lib/cantina-business";
import type { CantinaStore } from "@/hooks/use-cantina-store";

export function HrModule({ store }: { store: CantinaStore }) {
  const {
    employees,
    attendance,
    staffPayments,
    createEmployee,
    deleteEmployee,
    checkIn,
    checkOut,
    payStaff,
  } = store;

  const [form, setForm] = useState({ name: "", role: "Cajera", phone: "", shift: "" });
  const [payFor, setPayFor] = useState<string>(employees[0]?.id ?? "");
  const [payType, setPayType] = useState<"sueldo" | "adelanto">("adelanto");
  const [payAmount, setPayAmount] = useState("");

  const openShift = (id: string) =>
    attendance.find((a) => a.employeeId === id && a.date === todayISO() && !a.checkOut);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-2xl font-bold">Personal de la cantina</h2>
        <p className="text-sm text-muted-foreground">
          Turnos, asistencia diaria y pagos al equipo.
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {employees.map((e) => {
            const open = openShift(e.id);
            const hoy = attendance.filter((a) => a.employeeId === e.id && a.date === todayISO());
            return (
              <div key={e.id} className="rounded-3xl border bg-card p-4 shadow-card">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-bold">{e.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {e.role} · Turno {e.shift}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">📞 {e.phone}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      open ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {open ? `En turno desde ${open.checkIn}` : "Fuera de turno"}
                  </span>
                </div>

                {hoy.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {hoy.map((a) => (
                      <li key={a.id}>
                        Entrada {a.checkIn} {a.checkOut ? `· Salida ${a.checkOut}` : "· en curso"}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={open ? "outline" : "secondary"}
                    className="rounded-full"
                    disabled={!!open}
                    onClick={() => checkIn(e.id)}
                  >
                    <LogIn className="mr-1 h-4 w-4" /> Marcar entrada
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={!open}
                    onClick={() => checkOut(e.id)}
                  >
                    <LogOut className="mr-1 h-4 w-4" /> Marcar salida
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive"
                    onClick={() => deleteEmployee(e.id)}
                    aria-label={`Eliminar a ${e.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border bg-card p-5 shadow-card">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <UserPlus className="h-5 w-5" /> Nuevo integrante
          </h3>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (form.name.trim().length < 2) return;
              createEmployee({
                name: form.name.trim(),
                role: form.role.trim() || "Apoyo",
                phone: form.phone.trim(),
                shift: form.shift.trim() || "07:00 – 13:00",
              });
              setForm({ name: "", role: "Cajera", phone: "", shift: "" });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="emp-name">Nombre</Label>
              <Input
                id="emp-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Rosa Benítez"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-role">Rol</Label>
              <Input
                id="emp-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Cocinero"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-phone">Teléfono</Label>
              <Input
                id="emp-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0981 445 220"
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-shift">Turno</Label>
              <Input
                id="emp-shift"
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value })}
                placeholder="07:00 – 13:00"
                className="rounded-2xl"
              />
            </div>
            <Button type="submit" className="rounded-full sm:col-span-2">
              Agregar al equipo
            </Button>
          </form>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-card">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <Wallet className="h-5 w-5" /> Sueldos y adelantos
          </h3>
          <form
            className="mt-4 space-y-3"
            onSubmit={(ev) => {
              ev.preventDefault();
              const n = Number(payAmount);
              if (!payFor || !Number.isFinite(n) || n <= 0) return;
              payStaff(payFor, payType, Math.round(n));
              setPayAmount("");
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pay-emp">Empleado</Label>
                <select
                  id="pay-emp"
                  value={payFor}
                  onChange={(e) => setPayFor(e.target.value)}
                  className="h-10 w-full rounded-2xl border bg-background px-3 text-sm"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-amount">Monto (Gs.)</Label>
                <Input
                  id="pay-amount"
                  inputMode="numeric"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="150000"
                  className="rounded-2xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["adelanto", "sueldo"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPayType(t)}
                  className={`rounded-2xl border p-2 text-sm font-semibold transition-colors ${
                    payType === t
                      ? "border-primary bg-secondary text-secondary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {t === "adelanto" ? "Adelanto" : "Sueldo"}
                </button>
              ))}
            </div>
            <Button type="submit" className="w-full rounded-full">
              Registrar pago
            </Button>
          </form>

          <ul className="mt-4 space-y-2 text-sm">
            {staffPayments.length === 0 && (
              <li className="rounded-2xl border border-dashed p-4 text-center text-muted-foreground">
                Sin pagos registrados
              </li>
            )}
            {staffPayments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-2xl bg-muted/60 px-3 py-2"
              >
                <span className="min-w-0 truncate">
                  {employees.find((e) => e.id === p.employeeId)?.name ?? "Ex integrante"}{" "}
                  <span className="text-xs text-muted-foreground">· {p.type} · {p.date}</span>
                </span>
                <span className="shrink-0 font-bold">{formatPrice(p.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
