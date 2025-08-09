import { Warehouse, Building, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../Card";

interface ProviderStatsProps {
  totalProveedores: number;
  proveedoresActivos: number;
  totalCompras?: number;
  promedioCompra?: number;
}

export function ProviderStats({ totalProveedores, proveedoresActivos, totalCompras = 0, promedioCompra = 0 }: ProviderStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
          <Warehouse className="h-4 w-4 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProveedores}</div>
          <p className="text-xs text-slate-600">Proveedores registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activos</CardTitle>
          <Building className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{proveedoresActivos}</div>
          <p className="text-xs text-slate-600">Proveedores activos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">Bs {totalCompras.toFixed(2)}</div>
          <p className="text-xs text-slate-600">Volumen total de compras</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Promedio Compra</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">Bs {promedioCompra.toFixed(2)}</div>
          <p className="text-xs text-slate-600">Promedio por proveedor</p>
        </CardContent>
      </Card>
    </div>
  );
}
