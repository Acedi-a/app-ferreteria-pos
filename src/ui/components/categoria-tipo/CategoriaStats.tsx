import { Folder, FolderOpen, Package } from "lucide-react";
import type { CategoriaStats } from "../../services/categoria-tipo-service";

interface CategoriaStatsProps {
  stats: CategoriaStats;
}

export default function CategoriaStats({ stats }: CategoriaStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Total Categorías */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Total Categorías</p>
            <p className="text-3xl font-light text-gray-900 mt-2">{stats.totalCategorias}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50">
            <Folder className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Categorías Activas */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Categorías Activas</p>
            <p className="text-3xl font-light text-gray-900 mt-2">{stats.categoriasActivas}</p>
          </div>
          <div className="p-4 rounded-2xl bg-green-50">
            <FolderOpen className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* En Uso */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-gray-500 uppercase tracking-wide">En Uso</p>
            <p className="text-3xl font-light text-gray-900 mt-2">{stats.productosAsignados}</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50">
            <Package className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
