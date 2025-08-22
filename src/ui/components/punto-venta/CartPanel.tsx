// src/components/punto-venta/CartPanel.tsx
import {
  ShoppingCart,
  Trash2,
  Printer,
  ChevronRight,
} from "lucide-react";

import { Button } from "../ui/Button";
import { useEffect, useState } from "react";

interface ProductoVenta {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  ventaFraccionada: boolean;
  unidadMedida: string;
}

interface Cliente {
  id: number;
  nombre: string;
  codigo: string;
}

interface CartPanelProps {
  productos: ProductoVenta[];
  onActualizarCantidad: (id: number, cantidad: number) => void;
  onEliminarProducto: (id: number) => void;
  onProcesarVenta: () => void;
  onImprimirTicket: () => void;
  clientes: Cliente[];
  clienteSeleccionado: Cliente | null;
  onSeleccionarCliente: (cliente: Cliente | null) => void;
  metodoPago: string;
  onCambiarMetodoPago: (metodo: string) => void;
  descuento: number;
  onCambiarDescuento: (descuento: number) => void;
  observaciones: string;
  onCambiarObservaciones: (observaciones: string) => void;
  ventaCredito: boolean;
  onCambiarVentaCredito: (ventaCredito: boolean) => void;
  pagoInicial: number;
  onCambiarPagoInicial: (pagoInicial: number) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export default function CartPanel({
  productos,
  onActualizarCantidad,
  onEliminarProducto,
  onProcesarVenta,
  onImprimirTicket,
  clientes,
  clienteSeleccionado,
  onSeleccionarCliente,
  metodoPago,
  onCambiarMetodoPago,
  descuento,
  onCambiarDescuento,
  observaciones,
  onCambiarObservaciones,
  ventaCredito,
  onCambiarVentaCredito,
  pagoInicial,
  onCambiarPagoInicial,
  isMinimized,
  onToggleMinimize,
}: CartPanelProps) {
  // Estado local de inputs de cantidad para edición gradual (permite vacío temporalmente)
  const [qtyInputs, setQtyInputs] = useState<Record<number, string | undefined>>({});

  // Helpers de precisión para sumar/restar según el step (evita 1.6000000000000005)
  const stepOf = (p: ProductoVenta) => (p.ventaFraccionada ? 0.1 : 1);
  const roundToStep = (val: number, step: number) => {
    const decimals = (String(step).split('.')[1] || '').length;
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  };
  const addStep = (val: number, step: number) => roundToStep(val + step, step);
  const subStep = (val: number, step: number) => Math.max(0, roundToStep(val - step, step));

  // Sincronizar cuando cambia la lista de productos (agregados/eliminados o cantidades actualizadas externamente)
  useEffect(() => {
    setQtyInputs((prev) => {
      const next: Record<number, string | undefined> = {};
      for (const p of productos) {
        // Si el usuario no está editando (sin valor en prev), dejamos indefinido para mostrar p.cantidad
        if (prev[p.id] !== undefined) {
          next[p.id] = prev[p.id];
        }
      }
      return next;
    });
  }, [productos.map((p) => `${p.id}:${p.cantidad}`).join('|')]);

  const subtotal = productos.reduce((s, p) => s + p.subtotal, 0);
  const total = subtotal - descuento;
  const totalItems = productos.reduce((total, p) => total + p.cantidad, 0);

  const commitCantidad = (prod: ProductoVenta, raw: string) => {
    const v = raw.trim();
    if (v === "") {
      // Revertir visualmente a la cantidad actual (no eliminar)
      setQtyInputs((prev) => {
        const next = { ...prev };
        delete next[prod.id];
        return next;
      });
      return;
    }
    const parsed = Number.parseFloat(v.replace(",", "."));
    if (Number.isNaN(parsed) || parsed <= 0) {
      // Valor inválido: revertir
      setQtyInputs((prev) => {
        const next = { ...prev };
        delete next[prod.id];
        return next;
      });
      return;
    }
    const finalVal = prod.ventaFraccionada
      ? roundToStep(parsed, stepOf(prod))
      : Math.round(parsed);
    onActualizarCantidad(prod.id, finalVal);
    // Limpiar edición para reflejar valor desde props en el próximo render
    setQtyInputs((prev) => {
      const next = { ...prev };
      delete next[prod.id];
      return next;
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg h-full flex flex-col">
      {/* Header del carrito */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-50">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-blue-900">
            Carrito ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </span>
        </div>
        {productos.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={onToggleMinimize}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {productos.length === 0 ? (
        // Estado vacío
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Carrito vacío</h3>
            <p className="text-sm">Agregar productos para comenzar a vender</p>
          </div>
        </div>
      ) : isMinimized ? (
        // Vista minimizada
        <div className="p-4">
          <div className="space-y-2">
            {productos.slice(0, 2).map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="truncate">{p.nombre}</span>
                <span className="font-medium">{p.cantidad}x</span>
              </div>
            ))}
            {productos.length > 2 && (
              <div className="text-xs text-gray-500">
                +{productos.length - 2} más...
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>Bs {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : (
        // Vista completa
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Lista de productos */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {productos.map((p) => (
              <div key={p.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{p.nombre}</h4>
                    <p className="text-xs text-gray-500">{p.codigo}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-12 w-12 text-red-600 hover:bg-red-50"
                    onClick={() => onEliminarProducto(p.id)}
                  >
                    <Trash2 className="h-auto w-10 text-red-600" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Bs {p.precio.toFixed(2)}</span>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        const step = stepOf(p);
                        const nuevo = subStep(p.cantidad, step);
                        onActualizarCantidad(p.id, nuevo);
                        setQtyInputs((prev) => {
                          const next = { ...prev };
                          delete next[p.id];
                          return next;
                        });
                      }}
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      value={qtyInputs[p.id] ?? (p.ventaFraccionada ? p.cantidad.toFixed(1) : String(p.cantidad))}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQtyInputs((prev) => ({ ...prev, [p.id]: val }));
                      }}
                      onBlur={(e) => commitCantidad(p, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          commitCantidad(p, (e.target as HTMLInputElement).value);
                        }
                      }}
                      className="w-12 text-center text-xs border border-gray-300 rounded"
                      step={p.ventaFraccionada ? "0.1" : "1"}
                      min="0"
                    />
                    <Button
                      variant="outline"
                      className="h-6 w-6"
                      onClick={() => {
                        const step = stepOf(p);
                        const nuevo = addStep(p.cantidad, step);
                        onActualizarCantidad(p.id, nuevo);
                        setQtyInputs((prev) => {
                          const next = { ...prev };
                          delete next[p.id];
                          return next;
                        });
                      }}
                    >
                      +
                    </Button>
                  </div>
                  
                  <span className="text-sm font-bold">Bs {p.subtotal.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Panel de checkout */}
          <div className="border-t bg-white p-4 space-y-4">
            {/* Cliente */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Cliente</label>
              <select
                value={clienteSeleccionado?.id ?? ""}
                onChange={(e) => {
                  const c = clientes.find((c) => c.id.toString() === e.target.value) ?? null;
                  onSeleccionarCliente(c);
                }}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="">Cliente general</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Método de pago */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Método de pago</label>
              <select
                value={metodoPago}
                onChange={(e) => onCambiarMetodoPago(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>

            {/* Descuento */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Descuento:</label>
              <input
                type="number"
                value={descuento}
                onChange={(e) => onCambiarDescuento(Number.parseFloat(e.target.value) || 0)}
                className="w-20 text-sm border border-gray-300 rounded px-2 py-1 text-right"
                min="0"
                step="0.01"
              />
            </div>

            {/* Venta a crédito */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Venta a crédito:</label>
              <input
                type="checkbox"
                checked={ventaCredito}
                onChange={(e) => onCambiarVentaCredito(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {/* Pago inicial - solo mostrar si es venta a crédito */}
            {ventaCredito && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Pago inicial (opcional)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Bs</span>
                  <input
                    type="number"
                    value={pagoInicial}
                    onChange={(e) => onCambiarPagoInicial(Number.parseFloat(e.target.value) || 0)}
                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                    min="0"
                    max={total}
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                {pagoInicial > 0 && (
                  <div className="mt-1 text-xs text-gray-600">
                    Saldo pendiente: Bs {(total - pagoInicial).toFixed(2)}
                  </div>
                )}
              </div>
            )}

            {/* Observaciones */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => onCambiarObservaciones(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 resize-none"
                rows={2}
                placeholder="Observaciones adicionales..."
              />
            </div>

            {/* Totales */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Bs {subtotal.toFixed(2)}</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento:</span>
                  <span>-Bs {descuento.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-1">
                <span>Total:</span>
                <span>Bs {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2">
              <Button onClick={onProcesarVenta} className="w-full bg-green-600 hover:bg-green-700 text-white">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Procesar Venta
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={onImprimirTicket}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
