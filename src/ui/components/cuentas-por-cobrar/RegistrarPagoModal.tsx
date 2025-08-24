// src/components/cuentas-por-cobrar/RegistrarPagoModal.tsx
import { useState } from "react";
import { X, DollarSign, CreditCard, Clock } from "lucide-react";
import { Button } from "../ui/Button";
import { printPagoReceipt } from "./PaymentReceiptRenderer";
import { CuentasPorCobrarService } from "../../services/cuentas-por-cobrar-service";
import type { CuentaPorCobrar, RegistrarPagoData } from "../../services/cuentas-por-cobrar-service";
import { getBoliviaISOString } from "../../lib/utils";

interface RegistrarPagoModalProps {
  cuenta: CuentaPorCobrar | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (datos: RegistrarPagoData) => Promise<void>;
  loading?: boolean;
}

export default function RegistrarPagoModal({
  cuenta,
  isOpen,
  onClose,
  onConfirm,
  loading = false
}: RegistrarPagoModalProps) {
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  const [imprimir, setImprimir] = useState(true);
  const [incluirHistorial, setIncluirHistorial] = useState(false);

  const resetForm = () => {
    setMonto('');
    setMetodoPago('efectivo');
    setObservaciones('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cuenta) return;
    
    setError('');
    
    const montoNum = parseFloat(monto);
    
    // Validaciones
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      setError('Ingrese un monto válido');
      return;
    }
    
    if (montoNum > cuenta.saldo) {
      setError('El monto no puede ser mayor al saldo pendiente');
      return;
    }
    
    if (!metodoPago) {
      setError('Seleccione un método de pago');
      return;
    }

    try {
      await onConfirm({
        cuenta_id: cuenta.id,
        monto: montoNum,
        metodo_pago: metodoPago,
        observaciones: observaciones.trim() || undefined
      });
      
      // Impresión opcional del recibo
      if (imprimir) {
        const pagoParcial = { monto: montoNum, metodo_pago: metodoPago, observaciones, fecha_pago: getBoliviaISOString() };
        let historial = undefined;
        if (incluirHistorial) {
          try {
            historial = await CuentasPorCobrarService.obtenerHistoricoPagos(cuenta.id);
          } catch {}
        }
        await printPagoReceipt({ ...cuenta, saldo: cuenta.saldo - montoNum }, pagoParcial, { mostrarHistorial: incluirHistorial, historial });
      }

      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al registrar el pago');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!isOpen || !cuenta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Registrar Pago
              </h2>
              <p className="text-sm text-gray-600">
                {cuenta.cliente_nombre} {cuenta.cliente_apellido}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Información de la cuenta */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              Información de la Cuenta
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Cliente:</span>
                <div className="text-gray-900">
                  {cuenta.cliente_nombre} {cuenta.cliente_apellido}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Código:</span>
                <div className="text-gray-900">{cuenta.cliente_codigo}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Venta:</span>
                <div className="text-blue-600 font-medium">
                  {cuenta.numero_venta || `VENTA-${cuenta.venta_id || cuenta.id}`}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Estado:</span>
                <div className={`font-medium ${
                  cuenta.estado === 'vencida' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {cuenta.estado.charAt(0).toUpperCase() + cuenta.estado.slice(1)}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Monto Total:</span>
                <div className="text-gray-900 font-bold">
                  Bs {cuenta.monto.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Saldo Pendiente:</span>
                <div className="text-red-600 font-bold text-lg">
                  Bs {cuenta.saldo.toFixed(2)}
                </div>
              </div>
              {cuenta.fecha_vencimiento && (
                <>
                  <div>
                    <span className="font-medium text-gray-600">Vencimiento:</span>
                    <div className={`${
                      cuenta.dias_vencido && cuenta.dias_vencido > 0 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-900'
                    }`}>
                      {formatearFecha(cuenta.fecha_vencimiento)}
                    </div>
                  </div>
                  {cuenta.dias_vencido && cuenta.dias_vencido > 0 && (
                    <div>
                      <span className="font-medium text-gray-600">Días vencido:</span>
                      <div className="text-red-600 font-bold flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {cuenta.dias_vencido} días
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {cuenta.observaciones && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="font-medium text-gray-600">Observaciones:</span>
                <div className="text-gray-700 text-sm mt-1 bg-white p-2 rounded border">
                  {cuenta.observaciones}
                </div>
              </div>
            )}
          </div>

          {/* Formulario de pago */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a Pagar *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    Bs
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max={cuenta.saldo}
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Máximo: Bs {cuenta.saldo.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="cheque">Cheque</option>
                  <option value="deposito">Depósito Bancario</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Detalles adicionales del pago..."
                disabled={loading}
              />
            </div>

            {/* Opciones de impresión */}
            <div className="bg-gray-50 rounded-lg p-3 border">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={imprimir} onChange={(e) => setImprimir(e.target.checked)} />
                Imprimir recibo de pago
              </label>
              {imprimir && (
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={incluirHistorial} onChange={(e) => setIncluirHistorial(e.target.checked)} />
                  Incluir historial de pagos
                </label>
              )}
            </div>

            {/* Botones rápidos de monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montos rápidos
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMonto(cuenta.saldo.toString())}
                  className="text-xs px-3 py-1 text-green-600 hover:bg-green-50"
                  disabled={loading}
                >
                  Pago Total (Bs {cuenta.saldo.toFixed(2)})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMonto((cuenta.saldo / 2).toString())}
                  className="text-xs px-3 py-1 text-blue-600 hover:bg-blue-50"
                  disabled={loading}
                >
                  50% (Bs {(cuenta.saldo / 2).toFixed(2)})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMonto((cuenta.saldo * 0.25).toString())}
                  className="text-xs px-3 py-1 text-purple-600 hover:bg-purple-50"
                  disabled={loading}
                >
                  25% (Bs {(cuenta.saldo * 0.25).toFixed(2)})
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Footer con botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !monto || !metodoPago}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Registrar Pago</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
