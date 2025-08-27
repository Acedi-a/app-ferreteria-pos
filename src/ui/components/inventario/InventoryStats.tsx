import { Package, CheckCircle, AlertTriangle, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

export interface InventoryStatsProps {
  totalProductos: number;
  stockNormal: number;
  stockBajo: number;
  valorTotal: number;
  totalComprasRecientes?: number;
  gananciaTotal?: number;
}

export function InventoryStats({ totalProductos, stockNormal, stockBajo, valorTotal, totalComprasRecientes, gananciaTotal }: InventoryStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalProductos}</div>
          <p className="text-xs text-slate-600">Productos en inventario</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock Normal</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stockNormal}</div>
          <p className="text-xs text-slate-600">Con stock suficiente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stockBajo}</div>
          <p className="text-xs text-slate-600">Requiere reposición</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">Bs {valorTotal.toFixed(2)}</div>
          <p className="text-xs text-slate-600">Valor del inventario</p>
        </CardContent>
      </Card>

      {totalComprasRecientes !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras Recientes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Bs {totalComprasRecientes.toFixed(2)}</div>
            <p className="text-xs text-slate-600">Últimos 30 días</p>
          </CardContent>
        </Card>
      )}

      {gananciaTotal !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              gananciaTotal >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              Bs {gananciaTotal.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600">Ganancia potencial</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
