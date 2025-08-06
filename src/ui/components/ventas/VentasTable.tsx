// src/components/ventas/VentasTable.tsx
import { Eye, FileText, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import type { Venta } from "../../services/ventas-service";

interface VentasTableProps {
  ventas: Venta[];
  loading?: boolean;
  onVerDetalles: (venta: Venta) => void;
  onCancelarVenta?: (venta: Venta) => void;
  onImprimirTicket?: (venta: Venta) => void;
}

export default function VentasTable({ 
  ventas, 
  loading = false, 
  onVerDetalles,
  onCancelarVenta,
  onImprimirTicket 
}: VentasTableProps) {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMetodoPagoColor = (metodo: string) => {
    switch (metodo.toLowerCase()) {
      case 'efectivo':
        return 'bg-green-50 text-green-700';
      case 'tarjeta':
        return 'bg-blue-50 text-blue-700';
      case 'transferencia':
        return 'bg-purple-50 text-purple-700';
      case 'mixto':
        return 'bg-orange-50 text-orange-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border">
        <div className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ventas</h3>
          <p className="text-gray-500">No se encontraron ventas con los filtros aplicados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número de Venta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método de Pago
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ventas.map((venta) => (
              <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {venta.numero_venta}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {venta.id}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatearFecha(venta.fecha_venta)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {venta.cliente_nombre || 'Cliente general'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMetodoPagoColor(venta.metodo_pago)}`}>
                    {venta.metodo_pago.charAt(0).toUpperCase() + venta.metodo_pago.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      Bs {venta.total.toFixed(2)}
                    </div>
                    {venta.descuento > 0 && (
                      <div className="text-xs text-green-600">
                        Desc: Bs {venta.descuento.toFixed(2)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getBadgeColor(venta.estado)}>
                    {venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      className="h-12 w-12 text-blue-600 hover:bg-blue-50"
                      onClick={() => onVerDetalles(venta)}
                      title="Ver detalles"
                    >
                      <Eye className="h-full text-blue-600" />
                    </Button>
                    
                    {onImprimirTicket && (
                      <Button
                        variant="ghost"
                        className="h-12 w-12 text-gray-600  hover:bg-gray-50"
                        onClick={() => onImprimirTicket(venta)}
                        title="Imprimir ticket"
                      >
                        <FileText className="h-full w-full text-black" />
                      </Button>
                    )}
                    
                    {onCancelarVenta && venta.estado === 'completada' && (
                      <Button
                        variant="ghost"
                        className="h-12 w-12 text-red-600 hover:bg-red-50"
                        onClick={() => onCancelarVenta(venta)}
                        title="Cancelar venta"
                      >
                        <X className="h-full text-red-600" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
