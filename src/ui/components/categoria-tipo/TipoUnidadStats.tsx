import { Ruler, Square, Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import type { TipoUnidadStats } from "../../services/categoria-tipo-service";

interface TipoUnidadStatsProps {
  stats: TipoUnidadStats;
}

export default function TipoUnidadStats({ stats }: TipoUnidadStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tipos</CardTitle>
          <Ruler className="h-4 w-4 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTipos}</div>
          <p className="text-xs text-slate-600">Tipos de unidad registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tipos Activos</CardTitle>
          <Square className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.tiposActivos}</div>
          <p className="text-xs text-slate-600">Tipos disponibles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Uso</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.productosAsignados}</div>
          <p className="text-xs text-slate-600">Tipos con productos</p>
        </CardContent>
      </Card>
    </div>
  );
}
