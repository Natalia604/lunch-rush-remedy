import { useState } from "react";
import { UtensilsCrossed, ChefHat, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImg from "@/assets/prod-empanada.jpg";

export function LoginScreen({
  onStudent,
  onStaff,
}: {
  onStudent: (name: string) => void;
  onStaff: () => void;
}) {
  const [mode, setMode] = useState<"login" | "registro">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      setError("Ingresá un correo válido.");
      return;
    }
    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }
    if (mode === "registro" && name.trim().length < 2) {
      setError("Contanos tu nombre.");
      return;
    }
    setError("");
    const display =
      (mode === "registro" ? name.trim().split(" ")[0] : cleanEmail.split("@")[0]) ?? "Alumno";
    onStudent(display.charAt(0).toUpperCase() + display.slice(1));

  };

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative hidden overflow-hidden lg:block">
        <img
          src={heroImg}
          alt="Empanadas recién horneadas de la cantina"
          width={768}
          height={512}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-warm opacity-80" />
        <div className="absolute inset-0 flex flex-col justify-end gap-3 p-10 text-primary-foreground">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Tu recreo sin filas 🥐
          </h2>
          <p className="max-w-sm text-sm opacity-90">
            Pedí desde el aula, pagá como quieras y retirá cuando tu pedido esté listo.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-warm text-primary-foreground shadow-soft">
              <UtensilsCrossed className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Cantina Universitaria
              </p>
              <h1 className="font-display text-2xl font-bold">
                {mode === "login" ? "Ingresá a tu cuenta" : "Registrate como alumno"}
              </h1>
            </div>
          </div>

          <div className="flex rounded-full bg-muted p-1 text-sm font-semibold">
            {(["login", "registro"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`flex-1 rounded-full px-4 py-2 transition-colors ${
                  mode === m ? "bg-card text-primary shadow-card" : "text-muted-foreground"
                }`}
              >
                {m === "login" ? "Iniciar sesión" : "Registrarme"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4 rounded-3xl border bg-card p-5 shadow-card">
            {mode === "registro" && (
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre y apellido</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="nombre"
                    value={name}
                    maxLength={60}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Natalia Peralta"
                    className="h-12 rounded-2xl pl-11"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo institucional</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  maxLength={120}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alumno@uni.edu.py"
                  className="h-12 rounded-2xl pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  maxLength={64}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-2xl pl-11"
                />
              </div>
            </div>

            {error && <p className="text-sm font-semibold text-destructive">{error}</p>}

            <Button type="submit" size="lg" className="w-full rounded-full">
              {mode === "login" ? "Entrar" : "Crear mi cuenta"}
            </Button>
          </form>

          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-full border-primary text-primary"
            onClick={onStaff}
          >
            <ChefHat className="mr-2 h-5 w-5" />
            Acceso personal de cantina
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Prototipo de demostración: podés entrar con cualquier correo y contraseña.
          </p>
        </div>
      </section>
    </main>
  );
}
