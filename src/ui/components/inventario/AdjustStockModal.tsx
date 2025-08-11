import React, { useCallback } from "react";
import { Dialog } from "../ui/Dialog";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { X } from "lucide-react";
import type { InventarioItem, TipoMovimiento } from "../../services/inventario-service";

export interface Proveedor {
  id: number;
  codigo: string;
  nombre: string;
}

export interface AdjustStockModalProps {
  open: boolean;
  product: InventarioItem | null;
  tipo: TipoMovimiento;
  cantidad: number;
  observaciones: string;
  costo: number;
  proveedorId?: number;
  proveedores: Proveedor[];
  onClose: () => void;
  onTipo: (v: TipoMovimiento) => void;
  onCantidad: (v: number) => void;
  onObservaciones: (v: string) => void;
  onCosto: (v: number) => void;
  onProveedorId: (v: number | undefined) => void;
  onAplicar: () => Promise<void> | void;
}

function AdjustStockModal({ 
  open, product, tipo, cantidad, observaciones, costo, proveedorId, proveedores,
  onClose, onTipo, onCantidad, onObservaciones, onCosto, onProveedorId, onAplicar 
}: AdjustStockModalProps) {
  
  // Handlers estables con useCallback para evitar re-renders
  const handleTipoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onTipo(e.target.value as TipoMovimiento);
  }, [onTipo]);
  
  const handleProveedorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onProveedorId(e.target.value ? Number(e.target.value) : undefined);
  }, [onProveedorId]);
  
  const handleCantidadChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onCantidad(Number(e.target.value));
  }, [onCantidad]);
  
  const handleCostoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onCosto(Number(e.target.value));
  }, [onCosto]);
  
  const handleObservacionesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onObservaciones(e.target.value);
  }, [onObservaciones]);
  
  const handleDialogOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  }, [onClose]);
  
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={handleBackgroundClick}
      >
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Ajustar Stock - {product?.nombre}</h2>
                <p className="text-sm text-slate-500">Realiza ajustes al inventario del producto</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {product && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información del Producto</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Código:</span> {product.codigo_interno}
                  </div>
                  <div>
                    <span className="font-medium">Stock Actual:</span> {product.stock_actual} {product.tipo_unidad_abrev || product.unidad_medida || 'uds'}
                  </div>
                  <div>
                    <span className="font-medium">Stock Mínimo:</span> {product.stock_minimo ?? 0} {product.tipo_unidad_abrev || product.unidad_medida || 'uds'}
                  </div>
                  <div>
                    <span className="font-medium">Tipo Unidad:</span> {product.tipo_unidad_nombre || 'No definido'}
                  </div>
                  <div>
                    <span className="font-medium">Costo Unitario:</span> Bs {(product.costo_unitario_ultimo ?? 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Ajuste</label>
                  <select 
                    value={tipo} 
                    onChange={handleTipoChange} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="entrada">Entrada (Aumentar Stock)</option>
                    <option value="salida">Salida (Reducir Stock)</option>
                    <option value="ajuste">Ajuste Manual</option>
                  </select>
                </div>
                
                {/* Campo de proveedor - siempre renderizado pero oculto si no es entrada */}
                <div className={tipo === 'entrada' ? 'block' : 'hidden'}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Proveedor <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={proveedorId || ''} 
                    onChange={handleProveedorChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={tipo === 'entrada'}
                    disabled={tipo !== 'entrada'}
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {proveedores.map(proveedor => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.codigo} - {proveedor.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cantidad</label>
                  <input 
                    type="number" 
                    step="0.001"
                    value={cantidad} 
                    onChange={handleCantidadChange} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Ingrese la cantidad"
                  />
                </div>
                
                {/* Campo de costo - siempre renderizado pero oculto si no es entrada */}
                <div className={tipo === 'entrada' ? 'block' : 'hidden'}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Costo Unitario (Bs)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={costo} 
                    onChange={handleCostoChange} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Costo por unidad"
                    disabled={tipo !== 'entrada'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones</label>
                  <textarea 
                    rows={3}
                    value={observaciones} 
                    onChange={handleObservacionesChange} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Motivo del ajuste..."
                  />
                </div>
              </form>
            </div>
          )}
          
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={() => onAplicar()}>Aplicar Ajuste</Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default React.memo(AdjustStockModal);