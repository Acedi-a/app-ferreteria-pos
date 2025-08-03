import { Folder, FolderOpen, Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import type { CategoriaStats } from "../../services/categoria-tipo-service";

interface CategoriaStatsProps {
  stats: CategoriaStats;
}

export default function CategoriaStats({ stats }: CategoriaStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Categorías</CardTitle>
          <Folder className="h-4 w-4 text-slate-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCategorias}</div>
          <p className="text-xs text-slate-600">Categorías registradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categorías Activas</CardTitle>
          <FolderOpen className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.categoriasActivas}</div>
          <p className="text-xs text-slate-600">Categorías disponibles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Uso</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.productosAsignados}</div>
          <p className="text-xs text-slate-600">Categorías con productos</p>
        </CardContent>
      </Card>
    </div>
  );
}
