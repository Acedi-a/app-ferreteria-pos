import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import type { ProductoStats } from "../../services/productos-service";

interface ProductStatsProps {
  stats: ProductoStats;
}

export default function ProductStats({ stats }: ProductStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Total Productos */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Total Productos</p>
            <p className="text-3xl font-light text-gray-900 mt-2">{stats.totalProductos}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50">
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Stock Bajo */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Stock Bajo</p>
            <p className="text-3xl font-light text-gray-900 mt-2">{stats.stockBajo}</p>
          </div>
          <div className="p-4 rounded-2xl bg-orange-50">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Productos Activos */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Productos Activos</p>
            <p className="text-3xl font-light text-gray-900 mt-2">{stats.productosActivos}</p>
          </div>
          <div className="p-4 rounded-2xl bg-green-50">
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Valor Inventario */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-light text-gray-500 uppercase tracking-wide">Valor Inventario</p>
            <p className="text-3xl font-light text-gray-900 mt-2">${stats.valorInventario.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50">
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
