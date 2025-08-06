// src/components/ventas/VentasFilters.tsx
import { Search, Filter, Calendar, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import type { FiltrosVenta } from "../../services/ventas-service";

interface VentasFiltersProps {
  filtros: FiltrosVenta;
  onCambiarFiltros: (filtros: FiltrosVenta) => void;
  onLimpiarFiltros: () => void;
}

export default function VentasFilters({ 
  filtros, 
  onCambiarFiltros, 
  onLimpiarFiltros 
}: VentasFiltersProps) {
  const actualizarFiltro = (campo: keyof FiltrosVenta, valor: string) => {
    onCambiarFiltros({
      ...filtros,
      [campo]: valor || undefined
    });
  };

  const hayFiltrosActivos = Object.values(filtros).some(valor => valor && valor.trim() !== '');

  // Obtener fechas para valores por defecto
  const hoy = new Date().toISOString().split('T')[0];
  const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filtros de Búsqueda</h3>
          {hayFiltrosActivos && (
            <Button
              variant="ghost"
              onClick={onLimpiarFiltros}
              className="ml-auto text-gray-500 hover:text-gray-700 h-8 px-3"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Búsqueda por número de venta */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Número de Venta
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="V202508050001"
                value={filtros.numeroVenta || ''}
                onChange={(e) => actualizarFiltro('numeroVenta', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Fecha inicio */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha Inicio
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={filtros.fechaInicio || hace30Dias}
                onChange={(e) => actualizarFiltro('fechaInicio', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Fecha fin */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha Fin
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={filtros.fechaFin || hoy}
                onChange={(e) => actualizarFiltro('fechaFin', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Cliente
            </label>
            <input
              type="text"
              placeholder="Nombre del cliente"
              value={filtros.cliente || ''}
              onChange={(e) => actualizarFiltro('cliente', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Método de pago */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Método de Pago
            </label>
            <select
              value={filtros.metodoPago || ''}
              onChange={(e) => actualizarFiltro('metodoPago', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>

          {/* Estado */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              value={filtros.estado || ''}
              onChange={(e) => actualizarFiltro('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todos</option>
              <option value="completada">Completada</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700 mr-2">Filtros rápidos:</span>
          <Button
            variant="outline"
            onClick={() => onCambiarFiltros({ 
              fechaInicio: hoy, 
              fechaFin: hoy 
            })}
            className="text-xs h-8 px-3"
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            onClick={() => onCambiarFiltros({ 
              fechaInicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
              fechaFin: hoy 
            })}
            className="text-xs h-8 px-3"
          >
            Última semana
          </Button>
          <Button
            variant="outline"
            onClick={() => onCambiarFiltros({ 
              fechaInicio: hace30Dias, 
              fechaFin: hoy 
            })}
            className="text-xs h-8 px-3"
          >
            Último mes
          </Button>
          <Button
            variant="outline"
            onClick={() => onCambiarFiltros({ estado: 'completada' })}
            className="text-xs h-8 px-3"
          >
            Solo completadas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
