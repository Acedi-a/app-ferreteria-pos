// src/ui/components/cuentas-por-pagar/RegistrarPagoProveedorModal.tsx
import { useEffect, useState } from "react";
import { DollarSign, AlertTriangle, User, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import type { CuentaPorPagar, RegistrarPagoProveedorData } from "../../services/cuentas-por-pagar-service";

interface RegistrarPagoProveedorModalProps {
  cuenta: CuentaPorPagar | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: RegistrarPagoProveedorData) => Promise<void> | void;
  loading?: boolean;
}

export default function RegistrarPagoProveedorModal({ 
  cuenta, 
  isOpen, 
  onClose, 
  onConfirm, 
  loading = false 
}: RegistrarPagoProveedorModalProps) {
  const [monto, setMonto] = useState<string>("");
  const [metodoPago, setMetodoPago] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && cuenta) {
      setMonto("");
      setMetodoPago("");
      setObservaciones("");
      setError("");
    }
  }, [isOpen, cuenta]);

  if (!cuenta) return null;

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSubmit = async () => {
    setError("");
    const montoNumero = parseFloat(monto);

    if (isNaN(montoNumero) || montoNumero <= 0) {
      setError("Ingresa un monto válido mayor a 0.");
      return;
    }

    if (!metodoPago) {
      setError("Selecciona un método de pago.");
      return;
    }

    if (montoNumero > cuenta.saldo) {
      setError("El monto no puede ser mayor al saldo pendiente.");
      return;
    }

    await onConfirm({
      cuenta_id: cuenta.id,
      monto: montoNumero,
      metodo_pago: metodoPago,
      observaciones: observaciones.trim()
    });

    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Registrar Pago a Proveedor
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Info Cuenta */}
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Proveedor</div>
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <User className="h-4 w-4 text-gray-400" />
                {cuenta.proveedor_nombre}
              </div>
              {cuenta.proveedor_telefono && (
                <div className="text-xs text-gray-500 ml-6">{cuenta.proveedor_telefono}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-500">Compra</div>
                <div className="text-gray-900 font-medium">
                  {cuenta.numero_compra || `COMPRA-${cuenta.compra_id || cuenta.id}`}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Estado</div>
                <Badge className={getBadgeEstado(cuenta.estado)}>
                  {cuenta.estado}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-gray-500">Monto Original</div>
                <div className="text-gray-900 font-semibold">Bs {cuenta.monto.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Pagado</div>
                <div className="text-gray-900 font-semibold">Bs {(cuenta.monto - cuenta.saldo).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Saldo</div>
                <div className="text-red-600 font-bold">Bs {cuenta.saldo.toFixed(2)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Creación</div>
                <div className="text-sm">{formatearFecha(cuenta.fecha_creacion)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Vencimiento</div>
                <div className="text-sm">{cuenta.fecha_vencimiento ? formatearFecha(cuenta.fecha_vencimiento) : '—'}</div>
              </div>
            </div>

            {cuenta.observaciones && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                <span>{cuenta.observaciones}</span>
              </div>
            )}

            {cuenta.dias_vencido && cuenta.dias_vencido > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                {cuenta.dias_vencido} días vencidos
              </div>
            )}
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto a pagar</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
              <Select value={metodoPago} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMetodoPago(e.target.value)} placeholder="Selecciona un método">
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={observaciones}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales (opcional)"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                <DollarSign className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Confirmar Pago'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}