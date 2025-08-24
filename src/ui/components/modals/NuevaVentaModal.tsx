import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Plus, Minus, Trash2, Search } from 'lucide-react';
import PuntoVentaService, { type NuevaVenta } from '../../services/punto-venta-service';
import ProductosService, { type Producto } from '../../services/productos-service';
import { ClientesService, type Cliente } from '../../services/clientes-service';
import { toast } from '../ui/use-toast';

interface NuevaVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVentaCreada: () => void;
}

interface ProductoVenta {
  producto_id: number;
  codigo: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'credito', label: 'Crédito' },
];

export default function NuevaVentaModal({ isOpen, onClose, onVentaCreada }: NuevaVentaModalProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productosVenta, setProductosVenta] = useState<ProductoVenta[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [descuento, setDescuento] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const cargarDatos = async () => {
    try {
      const [productosData, clientesData] = await Promise.all([
        new ProductosService().obtenerProductos(),
        ClientesService.obtenerTodos()
      ]);
      setProductos(productosData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los datos', variant: 'destructive' });
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.activo && (
      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.codigo_interno?.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.codigo_barras?.toLowerCase().includes(busquedaProducto.toLowerCase())
    )
  );

  const agregarProducto = (producto: Producto) => {
    const existente = productosVenta.find(p => p.producto_id === producto.id);
    if (existente) {
      actualizarCantidad(producto.id!, existente.cantidad + 1);
    } else {
      const nuevoProducto: ProductoVenta = {
        producto_id: producto.id!,
        codigo: producto.codigo_interno || '',
        nombre: producto.nombre,
        precio_unitario: producto.precio_venta,
        cantidad: 1,
        subtotal: producto.precio_venta
      };
      setProductosVenta([...productosVenta, nuevoProducto]);
    }
    setBusquedaProducto('');
  };

  const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(productoId);
      return;
    }
    setProductosVenta(prev => prev.map(p => 
      p.producto_id === productoId 
        ? { ...p, cantidad: nuevaCantidad, subtotal: p.precio_unitario * nuevaCantidad }
        : p
    ));
  };

  const eliminarProducto = (productoId: number) => {
    setProductosVenta(prev => prev.filter(p => p.producto_id !== productoId));
  };

  const calcularTotales = () => {
    const subtotal = productosVenta.reduce((sum, p) => sum + p.subtotal, 0);
    const montoDescuento = subtotal * (descuento / 100);
    const total = subtotal - montoDescuento;
    return { subtotal, montoDescuento, total };
  };

  const crearVenta = async () => {
    if (productosVenta.length === 0) {
      toast({ title: 'Error', description: 'Debe agregar al menos un producto', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { subtotal, total } = calcularTotales();
      
      const nuevaVenta: NuevaVenta = {
        cliente_id: clienteSeleccionado || undefined,
        metodo_pago: metodoPago,
        subtotal,
        descuento,
        total,
        observaciones: observaciones || undefined,
        detalles: productosVenta.map(p => ({
          producto_id: p.producto_id,
          producto_nombre: p.nombre,
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario,
          subtotal: p.subtotal
        }))
      };

      await PuntoVentaService.crearVenta(nuevaVenta);
      
      toast({ title: 'Éxito', description: 'Venta creada correctamente' });
      onVentaCreada();
      limpiarFormulario();
      onClose();
    } catch (error: any) {
      console.error('Error creando venta:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo crear la venta', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setProductosVenta([]);
    setClienteSeleccionado(null);
    setMetodoPago('efectivo');
    setDescuento(0);
    setObservaciones('');
    setBusquedaProducto('');
  };

  const { subtotal, montoDescuento, total } = calcularTotales();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo - Selección de productos */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar Producto</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  placeholder="Buscar por nombre, código..."
                  className="w-full pl-10 pr-3 py-2 border rounded"
                />
              </div>
            </div>

            {busquedaProducto && (
              <div className="max-h-48 overflow-auto border rounded">
                {productosFiltrados.map(producto => (
                  <div
                    key={producto.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => agregarProducto(producto)}
                  >
                    <div className="font-medium">{producto.nombre}</div>
                    <div className="text-sm text-gray-500">
                      {producto.codigo_interno} - ${producto.precio_venta.toFixed(2)}
                    </div>
                  </div>
                ))}
                {productosFiltrados.length === 0 && (
                  <div className="p-3 text-center text-gray-500">No se encontraron productos</div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Cliente (Opcional)</label>
              <select
                value={clienteSeleccionado || ''}
                onChange={(e) => setClienteSeleccionado(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Consumidor Final</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} - {cliente.telefono}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Método de Pago</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  {METODOS_PAGO.map(metodo => (
                    <option key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descuento (%)</label>
                <input
                  type="number"
                  value={descuento}
                  onChange={(e) => setDescuento(Number(e.target.value))}
                  min={0}
                  max={100}
                  step={0.01}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2"
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>

          {/* Panel derecho - Carrito y resumen */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Productos Seleccionados</CardTitle>
              </CardHeader>
              <CardContent>
                {productosVenta.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No hay productos seleccionados
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-auto">
                    {productosVenta.map(producto => (
                      <div key={producto.producto_id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{producto.nombre}</div>
                          <div className="text-sm text-gray-500">${producto.precio_unitario.toFixed(2)} c/u</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => actualizarCantidad(producto.producto_id, producto.cantidad - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center">{producto.cantidad}</span>
                          <Button
                            variant="outline"
                            onClick={() => actualizarCantidad(producto.producto_id, producto.cantidad + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => eliminarProducto(producto.producto_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="w-20 text-right font-medium">
                          ${producto.subtotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {descuento > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Descuento ({descuento}%):</span>
                      <span>-${montoDescuento.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={crearVenta} 
            disabled={loading || productosVenta.length === 0}
          >
            {loading ? 'Creando...' : 'Crear Venta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}