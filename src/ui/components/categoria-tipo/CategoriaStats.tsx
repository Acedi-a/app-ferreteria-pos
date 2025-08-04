import { Activity, BarChart3, TrendingUp} from "lucide-react";
import type { CategoriaStats } from "../../services/categoria-tipo-service";

interface CategoriaStatsProps {
  stats: CategoriaStats;
}

export default function CategoriaStats({ stats }: CategoriaStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Categorías */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
              <Activity className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Inventario Total</p>
              <p className="text-xs text-gray-500">Categorías registradas</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{stats.totalCategorias}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Activity className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categorías Activas */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Categorías Activas</p>
              <p className="text-xs text-gray-500">En funcionamiento</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{stats.categoriasActivas}</p>
            <div className="flex items-center space-x-1 mt-1">
              <BarChart3 className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">Activas</span>
            </div>
          </div>
        </div>
      </div>

      {/* En Uso */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Productos Asignados</p>
              <p className="text-xs text-gray-500">Con categoría definida</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{stats.productosAsignados}</p>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">Asignados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
