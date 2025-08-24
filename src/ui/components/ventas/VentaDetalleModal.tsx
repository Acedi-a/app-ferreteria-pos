// src/components/ventas/VentaDetalleModal.tsx
import { X, FileText, User, CreditCard, Package } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import type { Venta, VentaDetalle } from "../../services/ventas-service";
import { formatBoliviaDate } from "../../lib/utils";

interface VentaDetalleModalProps {
  venta: Venta | null;
  detalles: VentaDetalle[];
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  onImprimir?: () => void;
}

export default function VentaDetalleModal({ 
  venta, 
  detalles, 
  isOpen, 
  onClose, 
  loading = false,
  onImprimir 
}: VentaDetalleModalProps) {
  if (!venta) return null;

  const formatearFecha = (fecha: string) => {
    return formatBoliviaDate(fecha);
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

  if (!isOpen) return null;

  // Handler para cerrar al hacer click en el fondo
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Detalles de Venta
              </h2>
              <p className="text-sm text-gray-600">
                {venta.numero_venta}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onImprimir && (
              <Button
                variant="outline"
                onClick={onImprimir}
                className="text-gray-600 hover:text-gray-800"
              >
                <FileText className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Información de la venta */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                Información de Venta
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de Venta:</span>
                  <span className="font-medium">{venta.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Número:</span>
                  <span className="font-medium">{venta.numero_venta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <Badge className={getBadgeColor(venta.estado)}>
                    {venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Usuario:</span>
                  <span className="font-medium">{venta.usuario}</span>
                </div>
              </div>
            </div>

            {/* Información del cliente y fecha */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                Cliente y Fecha
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-medium">
                    {venta.cliente_nombre || 'Cliente general'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">{formatearFecha(venta.fecha_venta)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método de Pago:</span>
                  <span className="font-medium capitalize">{venta.metodo_pago}</span>
                </div>
                {venta.observaciones && (
                  <div className="flex flex-col">
                    <span className="text-gray-600">Observaciones:</span>
                    <span className="font-medium text-xs bg-white p-2 rounded border">
                      {venta.observaciones}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detalles de productos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-600" />
              Productos
            </h3>
            
            {loading ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando detalles...</p>
              </div>
            ) : detalles.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron productos en esta venta</p>
              </div>
            ) : (
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Precio Unit.
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Descuento
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {detalles.map((detalle, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {detalle.producto_nombre}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {detalle.producto_id}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">
                          {detalle.cantidad}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          Bs {detalle.precio_unitario.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {detalle.descuento > 0 ? (
                            <span className="text-red-600">
                              -Bs {detalle.descuento.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          Bs {detalle.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              Resumen de Totales
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">Bs {venta.subtotal.toFixed(2)}</span>
              </div>
              {venta.descuento > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-medium text-red-600">
                    -Bs {venta.descuento.toFixed(2)}
                  </span>
                </div>
              )}
              {venta.impuestos > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Impuestos:</span>
                  <span className="font-medium">Bs {venta.impuestos.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-gray-300" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">Bs {venta.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          {/* Botón cerrar en la parte inferior */}
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose} className="min-w-[100px]">Cerrar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
