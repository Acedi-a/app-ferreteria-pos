import { DollarSign, Package, Users, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

export interface StatsCardsProps {
  ventasHoyTotal: number;
  productosEnStock: number;
  clientesActivos: number;
  cuentasPorCobrarTotal: number;
  gananciaPerdida: number;
}

export default function StatsCards({ ventasHoyTotal, productosEnStock, clientesActivos, cuentasPorCobrarTotal, gananciaPerdida }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas Totales de Caja</CardTitle>
          <DollarSign className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Bs {ventasHoyTotal.toFixed(2)}</div>
          <p className="text-xs text-slate-500">Total de la caja activa</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos en Stock</CardTitle>
          <Package className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{productosEnStock}</div>
          <p className="text-xs text-slate-500">Con stock disponible</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          <Users className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clientesActivos}</div>
          <p className="text-xs text-slate-500">En la base de datos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cuentas por Cobrar</CardTitle>
          <CreditCard className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Bs {cuentasPorCobrarTotal.toFixed(2)}</div>
          <p className="text-xs text-slate-500">Saldo pendiente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia/Pérdida</CardTitle>
          <TrendingUp className={`h-4 w-4 ${gananciaPerdida >= 0 ? 'text-green-500' : 'text-red-500'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${gananciaPerdida >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Bs {gananciaPerdida.toFixed(2)}
          </div>
          <p className="text-xs text-slate-500">Precio venta - costo</p>
        </CardContent>
      </Card>

    </div>
  );
}
