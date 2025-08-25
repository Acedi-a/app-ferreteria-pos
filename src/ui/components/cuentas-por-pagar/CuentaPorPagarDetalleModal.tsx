// src/ui/components/cuentas-por-pagar/CuentaPorPagarDetalleModal.tsx
import { useState, useEffect } from "react";
import { X, FileText, CreditCard, History, DollarSign, Calendar, Printer, Factory } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import type { CuentaPorPagar, PagoProveedor } from "../../services/cuentas-por-pagar-service";
import { CuentasPorPagarService } from "../../services/cuentas-por-pagar-service";

interface CuentaPorPagarDetalleModalProps {
  cuenta: CuentaPorPagar | null;
  isOpen: boolean;
  onClose: () => void;
  onImprimir?: () => void;
}

export default function CuentaPorPagarDetalleModal({
  cuenta,
  isOpen,
  onClose,
  onImprimir
}: CuentaPorPagarDetalleModalProps) {
  const [pagos, setPagos] = useState<PagoProveedor[]>([]);
  const [loadingPagos, setLoadingPagos] = useState(false);

  useEffect(() => {
    if (cuenta && isOpen) {
      cargarHistoricoPagos();
    }
  }, [cuenta, isOpen]);

  const cargarHistoricoPagos = async () => {
    if (!cuenta) return;
    
    try {
      setLoadingPagos(true);
      const historico = await CuentasPorPagarService.obtenerHistoricoPagos(cuenta.id);
      setPagos(historico);
    } catch (error) {
      console.error('Error al cargar histórico de pagos:', error);
    } finally {
      setLoadingPagos(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearFechaCorta = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getBadgeEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pagada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'vencida':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalPagado = cuenta ? cuenta.monto - cuenta.saldo : 0;

  if (!isOpen || !cuenta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Detalles de Cuenta por Pagar
              </h2>
              <p className="text-sm text-gray-600">
                ID: {cuenta.id} - {cuenta.proveedor_nombre}
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
                <Printer className="h-4 w-4 mr-2" />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información de la cuenta */}
            <div className="space-y-6">
              {/* Datos del proveedor */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Factory className="h-5 w-5 text-gray-600" />
                  Información del Proveedor
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium text-gray-900">
                      {cuenta.proveedor_nombre}
                    </span>
                  </div>
                  {cuenta.proveedor_telefono && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teléfono:</span>
                      <span className="font-medium text-gray-900">{cuenta.proveedor_telefono}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la compra */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  Información de la Cuenta
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID Cuenta:</span>
                    <span className="font-medium text-gray-900">{cuenta.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compra:</span>
                    <span className="font-medium text-blue-600">
                      {cuenta.numero_compra || `COMPRA-${cuenta.compra_id || cuenta.id}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <Badge className={getBadgeEstado(cuenta.estado)}>
                      {cuenta.estado.charAt(0).toUpperCase() + cuenta.estado.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha Creación:</span>
                    <span className="font-medium text-gray-900">
                      {formatearFechaCorta(cuenta.fecha_creacion)}
                    </span>
                  </div>
                  {cuenta.fecha_vencimiento && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha Vencimiento:</span>
                      <span className={`font-medium ${
                        cuenta.dias_vencido && cuenta.dias_vencido > 0 
                          ? 'text-red-600' 
                          : 'text-gray-900'
                      }`}>
                        {formatearFechaCorta(cuenta.fecha_vencimiento)}
                      </span>
                    </div>
                  )}
                  {cuenta.dias_vencido && cuenta.dias_vencido > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Días Vencido:</span>
                      <span className="font-bold text-red-600 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {cuenta.dias_vencido} días
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen financiero */}
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  Resumen Financiero
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monto Original:</span>
                    <span className="font-bold text-gray-900">Bs {cuenta.monto.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Pagado:</span>
                    <span className="font-bold text-green-600">Bs {totalPagado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-orange-200 pt-2">
                    <span className="text-gray-600">Saldo Pendiente:</span>
                    <span className={`font-bold text-lg ${
                      cuenta.saldo > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      Bs {cuenta.saldo.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Progreso de pago */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progreso de pago</span>
                      <span>{((totalPagado / cuenta.monto) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(totalPagado / cuenta.monto) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {cuenta.observaciones && (
                <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Observaciones
                  </h3>
                  <p className="text-gray-700 text-sm">{cuenta.observaciones}</p>
                </div>
              )}
            </div>

            {/* Histórico de pagos */}
            <div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <History className="h-5 w-5 text-gray-600" />
                  Histórico de Pagos
                  {pagos.length > 0 && (
                    <span className="text-sm font-normal text-gray-600">
                      ({pagos.length} pago{pagos.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </h3>

                {loadingPagos ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white p-3 rounded border">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : pagos.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">
                      No se han registrado pagos para esta cuenta
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pagos.map((pago, index) => (
                      <div 
                        key={pago.id} 
                        className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-orange-600">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-orange-600">
                                Bs {pago.monto.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatearFecha(pago.fecha_pago)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {pago.metodo_pago}
                            </div>
                          </div>
                        </div>
                        {pago.observaciones && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2">
                            {pago.observaciones}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botón cerrar en la parte inferior */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} className="min-w-[100px]">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}