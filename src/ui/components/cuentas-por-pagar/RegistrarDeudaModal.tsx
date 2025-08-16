// src/ui/components/cuentas-por-pagar/RegistrarDeudaModal.tsx
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { AlertTriangle, Calendar, DollarSign, UserPlus, Users } from "lucide-react";
import type { Proveedor } from "../../services/proveedores-service";
import { ProveedoresService } from "../../services/proveedores-service";

export interface NuevaCuentaPorPagarFormData {
  proveedor_id?: number;
  nuevo_proveedor_nombre?: string;
  monto: number;
  fecha_vencimiento?: string;
  observaciones?: string;
}

interface RegistrarDeudaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: NuevaCuentaPorPagarFormData) => Promise<void> | void;
  loading?: boolean;
}

export default function RegistrarDeudaModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}: RegistrarDeudaModalProps) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [modo, setModo] = useState<'existente' | 'nuevo'>('existente');
  const [proveedorId, setProveedorId] = useState<string>("");
  const [nuevoProveedorNombre, setNuevoProveedorNombre] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      // Cargar proveedores cuando se abre el modal
      (async () => {
        try {
          const lista = await ProveedoresService.obtenerTodos();
          setProveedores(lista);
        } catch (e) {
          console.error('No se pudieron cargar los proveedores', e);
        }
      })();

      // Resetear formulario
      setModo('existente');
      setProveedorId("");
      setNuevoProveedorNombre("");
      setMonto("");
      setFechaVencimiento("");
      setObservaciones("");
      setBusqueda("");
      setError("");
    }
  }, [isOpen]);

  const proveedoresFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    if (!term) return proveedores;
    return proveedores.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      (p.codigo || '').toLowerCase().includes(term) ||
      (p.contacto || '').toLowerCase().includes(term)
    );
  }, [proveedores, busqueda]);

  const validar = (): { ok: boolean; msg?: string } => {
    const montoNumero = parseFloat(monto);
    if (isNaN(montoNumero) || montoNumero <= 0) {
      return { ok: false, msg: 'Ingresa un monto válido mayor a 0.' };
    }

    if (modo === 'existente') {
      if (!proveedorId) return { ok: false, msg: 'Selecciona un proveedor existente.' };
    } else {
      if (!nuevoProveedorNombre.trim()) return { ok: false, msg: 'Ingresa el nombre del nuevo proveedor.' };
    }

    return { ok: true };
  };

  const handleSubmit = async () => {
    setError("");
    const { ok, msg } = validar();
    if (!ok) {
      setError(msg || 'Revisa los datos del formulario.');
      return;
    }

    const data: NuevaCuentaPorPagarFormData = {
      proveedor_id: modo === 'existente' ? Number(proveedorId) : undefined,
      nuevo_proveedor_nombre: modo === 'nuevo' ? nuevoProveedorNombre.trim() : undefined,
      monto: parseFloat(monto),
      fecha_vencimiento: fechaVencimiento || undefined,
      observaciones: observaciones.trim() || undefined
    };

    await onConfirm(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Registrar Deuda (Cuenta por Pagar)
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selección / nuevo proveedor */}
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-2">Proveedor</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModo('existente')}
                  className={`px-3 py-1.5 text-sm rounded-md border ${
                    modo === 'existente' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  <Users className="inline-block h-4 w-4 mr-1" /> Existente
                </button>
                <button
                  type="button"
                  onClick={() => setModo('nuevo')}
                  className={`px-3 py-1.5 text-sm rounded-md border ${
                    modo === 'nuevo' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  <UserPlus className="inline-block h-4 w-4 mr-1" /> Nuevo
                </button>
              </div>
            </div>

            {modo === 'existente' ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o contacto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={proveedorId}
                  onChange={(e) => setProveedorId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar proveedor...</option>
                  {proveedoresFiltrados.map((p) => (
                    <option key={p.id} value={p.id}>
                      {(p.codigo ? p.codigo + ' - ' : '') + p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del nuevo proveedor</label>
                <input
                  type="text"
                  value={nuevoProveedorNombre}
                  onChange={(e) => setNuevoProveedorNombre(e.target.value)}
                  placeholder="Ej. Servicios XYZ S.R.L."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Se creará un proveedor activo con este nombre.</p>
              </div>
            )}
          </div>

          {/* Formulario de deuda */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFechaVencimiento(e.target.value)}
                  className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                {loading ? 'Guardando...' : 'Registrar Deuda'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}