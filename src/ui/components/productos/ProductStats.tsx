import { Package, AlertTriangle, TrendingUp, DollarSign, Activity, BarChart3 } from "lucide-react";
import type { ProductoStats } from "../../services/productos-service";

interface ProductStatsProps {
  stats: ProductoStats;
}

export default function ProductStats({ stats }: ProductStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Productos */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded">
            <Activity className="h-3 w-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Total</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase">Inventario Total</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalProductos.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Productos registrados</p>
        </div>
      </div>

      {/* Stock Bajo */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 rounded">
            <AlertTriangle className="h-3 w-3 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Alerta</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase">Stock Bajo</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.stockBajo.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Requieren reposición</p>
        </div>
      </div>

      {/* Productos Activos */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded">
            <BarChart3 className="h-3 w-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Activo</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase">Productos Activos</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.productosActivos.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Disponibles para venta</p>
        </div>
      </div>

      {/* Valor Inventario */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded">
            <TrendingUp className="h-3 w-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Valor</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase">Valor Inventario</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">Bs {stats.valorInventario.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Capital invertido</p>
        </div>
      </div>
    </div>
  );
}
