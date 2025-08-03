import { Ruler, Square, Package } from "lucide-react";
import type { TipoUnidadStats } from "../../services/categoria-tipo-service";

interface TipoUnidadStatsProps {
  stats: TipoUnidadStats;
}

export default function TipoUnidadStats({ stats }: TipoUnidadStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Total Tipos */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Total Tipos</p>
            <p className="text-3xl font-light text-gray-900 mt-2">{stats.totalTipos}</p>
          </div>
          <div className="p-4 rounded-2xl bg-green-50">
            <Ruler className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Tipos Activos */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Tipos Activos</p>
            <p className="text-3xl font-light text-gray-900 mt-2">{stats.tiposActivos}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50">
            <Square className="h-8 w-8 text-emerald-500" />
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
          <div className="p-4 rounded-2xl bg-blue-50">
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
