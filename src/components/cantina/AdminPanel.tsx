import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdersBoard } from "@/components/cantina/modules/OrdersBoard";
import { InventoryModule } from "@/components/cantina/modules/InventoryModule";
import { CashModule } from "@/components/cantina/modules/CashModule";
import { BillingModule } from "@/components/cantina/modules/BillingModule";
import { HrModule } from "@/components/cantina/modules/HrModule";
import type { CantinaStore } from "@/hooks/use-cantina-store";

export function AdminPanel({ store }: { store: CantinaStore }) {
  return (
    <Tabs defaultValue="pedidos" className="space-y-6">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-3xl p-1.5">
        <TabsTrigger value="pedidos" className="rounded-full">
          Pedidos
        </TabsTrigger>
        <TabsTrigger value="caja" className="rounded-full">
          Caja diaria
        </TabsTrigger>
        <TabsTrigger value="facturacion" className="rounded-full">
          Facturación
        </TabsTrigger>
        <TabsTrigger value="rrhh" className="rounded-full">
          Personal
        </TabsTrigger>
        <TabsTrigger value="inventario" className="rounded-full">
          Inventario
          {store.alerts.count > 0 && (
            <span className="ml-2 rounded-full bg-warning px-1.5 text-xs font-bold text-warning-foreground">
              {store.alerts.count}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pedidos">
        <OrdersBoard orders={store.orders} onAdvance={store.advanceOrder} />
      </TabsContent>
      <TabsContent value="caja">
        <CashModule store={store} />
      </TabsContent>
      <TabsContent value="facturacion">
        <BillingModule store={store} />
      </TabsContent>
      <TabsContent value="rrhh">
        <HrModule store={store} />
      </TabsContent>
      <TabsContent value="inventario">
        <InventoryModule store={store} />
      </TabsContent>
    </Tabs>
  );
}
