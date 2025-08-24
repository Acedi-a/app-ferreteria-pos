// src/components/cuentas-por-pagar/CuentasPorPagarFilters.tsx
import { Search, Filter, X } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import type { FiltrosCuentasPorPagar } from "../../services/cuentas-por-pagar-service";

interface CuentasPorPagarFiltersProps {
  filtros: FiltrosCuentasPorPagar;
  onCambiarFiltros: (filtros: FiltrosCuentasPorPagar) => void;
  onLimpiarFiltros: () => void;
}

export default function CuentasPorPagarFilters({
  filtros,
  onCambiarFiltros,
  onLimpiarFiltros
}: CuentasPorPagarFiltersProps) {
  const handleChange = (campo: keyof FiltrosCuentasPorPagar, valor: string) => {
    onCambiarFiltros({
      ...filtros,
      [campo]: valor
    });
  };

  const filtrosQuick = [
    { label: 'Todas', value: '' },
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Vencidas', value: 'vencida' },
    { label: 'Pagadas', value: 'pagada' }
  ];

  const filtrosVencimiento = [
    { label: 'Todas', value: 'todos' },
    { label: 'Por vencer', value: 'por_vencer' },
    { label: 'Vencidas', value: 'vencidas' }
  ];

  const hayFiltrosActivos = Object.values(filtros).some(valor => 
    valor !== undefined && valor !== '' && valor !== 'todos'
  );

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Barra de búsqueda principal */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar proveedor
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Nombre, contacto o código del proveedor..."
                  value={filtros.proveedor || ''}
                  onChange={(e) => handleChange('proveedor', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vencimiento
              </label>
              <select
                value={filtros.vencimiento || 'todos'}
                onChange={(e) => handleChange('vencimiento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {filtrosVencimiento.map(filtro => (
                  <option key={filtro.value} value={filtro.value}>
                    {filtro.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtros quick */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <div className="flex flex-wrap gap-2">
              {filtrosQuick.map(filtro => (
                <Button
                  key={filtro.value}
                  variant={filtros.estado === filtro.value ? "default" : "outline"}
                  onClick={() => handleChange('estado', filtro.value)}
                  className={`text-xs px-3 py-1.5 transition-all duration-200 ${
                    filtros.estado === filtro.value 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filtro.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde || ''}
                onChange={(e) => handleChange('fechaDesde', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta || ''}
                onChange={(e) => handleChange('fechaHasta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              {hayFiltrosActivos && (
                <Button
                  variant="outline"
                  onClick={onLimpiarFiltros}
                  className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Indicador de filtros activos */}
          {hayFiltrosActivos && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">
                Filtros activos aplicados
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}