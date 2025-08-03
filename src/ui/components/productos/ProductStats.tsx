import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import type { ProductoStats } from "../../services/productos-service";

interface ProductStatsProps {
  stats: ProductoStats;
}

export default function ProductStats({ stats }: ProductStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          <Package className="h-4 w-4 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProductos}</div>
          <p className="text-xs text-slate-600">Productos registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.stockBajo}</div>
          <p className="text-xs text-slate-600">Productos con stock bajo</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.productosActivos}</div>
          <p className="text-xs text-slate-600">Productos disponibles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            ${stats.valorInventario.toFixed(2)}
          </div>
          <p className="text-xs text-slate-600">Valor total del inventario</p>
        </CardContent>
      </Card>
    </div>
  );
}
