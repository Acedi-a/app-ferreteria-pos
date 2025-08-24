import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { VentasService, type Venta, type VentaDetalle } from '../../services/ventas-service';
import { productosService, type Producto } from '../../services/productos-service';
import { toast } from '../ui/use-toast';
import { Plus, Trash2, Edit3 } from 'lucide-react';

interface EditarVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ventaId: number | null;
  onVentaActualizada: () => void;
}

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'mixto', label: 'Mixto' },
];

const ESTADOS_VENTA = [
  { value: 'completada', label: 'Completada' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'cancelada', label: 'Cancelada' },
];

export const EditarVentaModal: React.FC<EditarVentaModalProps> = ({
  isOpen,
  onClose,
  ventaId,
  onVentaActualizada,
}) => {
  const [venta, setVenta] = useState<Venta | null>(null);
  const [detalles, setDetalles] = useState<VentaDetalle[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editandoDetalle, setEditandoDetalle] = useState<number | null>(null);

  // Estados para edición
  const [metodoPago, setMetodoPago] = useState('');
  const [estado, setEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [descuento, setDescuento] = useState<number | null>(0);

  // Estados para agregar productos
  const [productoSeleccionado, setProductoSeleccionado] = useState<number | null>(null);
  const [cantidadNueva, setCantidadNueva] = useState<number | null>(1);
  const [precioNuevo, setPrecioNuevo] = useState<number | null>(0);

  useEffect(() => {
    if (isOpen && ventaId) {
      cargarVenta();
      cargarProductos();
    }
  }, [isOpen, ventaId]);

  const cargarVenta = async () => {
    if (!ventaId) return;
    
    setLoading(true);
    try {
      const [ventaData, detallesData] = await Promise.all([
        VentasService.obtenerVentaPorId(ventaId),
        VentasService.obtenerDetallesVenta(ventaId)
      ]);

      if (ventaData) {
        setVenta(ventaData);
        setMetodoPago(ventaData.metodo_pago);
        setEstado(ventaData.estado);
        setObservaciones(ventaData.observaciones || '');
        setDescuento(ventaData.descuento || 0);
      }
      
      setDetalles(detallesData || []);
    } catch (error) {
      console.error('Error al cargar venta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información de la venta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const productosData = await productosService.obtenerProductos();
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const calcularSubtotal = () => {
    return detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    return subtotal - (descuento || 0);
  };

  // Funciones para manejar productos
  const actualizarDetalle = (index: number, campo: 'cantidad' | 'precio_unitario', valor: number | null) => {
    const nuevosDetalles = [...detalles];
    
    // Permitir valores null temporalmente para edición
    if (valor === null || valor === undefined) {
      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        [campo]: valor,
        subtotal: 0 // Subtotal temporal mientras se edita
      };
      setDetalles(nuevosDetalles);
      return;
    }

    // Validaciones solo para valores no nulos
    if (campo === 'cantidad' && (!Number.isInteger(valor) || valor <= 0)) {
      return; // No mostrar error, solo no actualizar
    }

    if (campo === 'precio_unitario' && valor <= 0) {
      return; // No mostrar error, solo no actualizar
    }

    // Calcular subtotal con valores válidos
    const cantidad = campo === 'cantidad' ? valor : (nuevosDetalles[index].cantidad || 0);
    const precio = campo === 'precio_unitario' ? valor : (nuevosDetalles[index].precio_unitario || 0);
    
    nuevosDetalles[index] = {
      ...nuevosDetalles[index],
      [campo]: valor,
      subtotal: cantidad * precio
    };
    setDetalles(nuevosDetalles);
  };

  const eliminarDetalle = (index: number) => {
    const nuevosDetalles = detalles.filter((_, i) => i !== index);
    setDetalles(nuevosDetalles);
  };

  const agregarProducto = () => {
    // Validaciones mejoradas
    if (!productoSeleccionado) {
      toast({
        title: 'Error de validación',
        description: 'Debe seleccionar un producto',
        variant: 'destructive',
      });
      return;
    }

    if (cantidadNueva === null || cantidadNueva === undefined || isNaN(cantidadNueva) || !Number.isInteger(cantidadNueva) || cantidadNueva <= 0) {
      toast({
        title: 'Error de validación',
        description: 'La cantidad debe ser un número entero mayor a 0',
        variant: 'destructive',
      });
      return;
    }

    if (precioNuevo === null || precioNuevo === undefined || isNaN(precioNuevo) || precioNuevo <= 0) {
      toast({
        title: 'Error de validación',
        description: 'El precio debe ser mayor a 0',
        variant: 'destructive',
      });
      return;
    }

    const producto = productos.find(p => p.id === productoSeleccionado);
    if (!producto) {
      toast({
        title: 'Error',
        description: 'Producto no encontrado',
        variant: 'destructive',
      });
      return;
    }

    // Verificar si el producto ya existe en la venta
    const productoExistente = detalles.find(d => d.producto_id === producto.id);
    if (productoExistente) {
      toast({
        title: 'Producto duplicado',
        description: 'Este producto ya está en la venta. Puede editarlo en la lista.',
        variant: 'destructive',
      });
      return;
    }

    const nuevoDetalle: VentaDetalle = {
      id: Date.now(), // ID temporal
      venta_id: ventaId!,
      producto_id: producto.id!,
      producto_nombre: producto.nombre,
      cantidad: cantidadNueva,
      precio_unitario: precioNuevo,
      descuento: 0,
      subtotal: cantidadNueva * precioNuevo
    };

    setDetalles([...detalles, nuevoDetalle]);
    setProductoSeleccionado(null);
    setCantidadNueva(1);
    setPrecioNuevo(0);
    
    toast({
      title: 'Producto agregado',
      description: `${producto.nombre} agregado a la venta`,
    });
  };

  const seleccionarProducto = (productoId: number) => {
    const producto = productos.find(p => p.id === productoId);
    if (producto) {
      setProductoSeleccionado(productoId);
      setPrecioNuevo(producto.precio_venta);
    }
  };

  const guardarCambios = async () => {
    if (!venta) return;

    // Validaciones antes de guardar
    if (detalles.length === 0) {
      toast({
        title: 'Error de validación',
        description: 'La venta debe tener al menos un producto',
        variant: 'destructive',
      });
      return;
    }

    // Validar que todos los detalles tengan valores válidos
    for (let i = 0; i < detalles.length; i++) {
      const detalle = detalles[i];
      if (!detalle.cantidad || detalle.cantidad <= 0 || !Number.isInteger(detalle.cantidad)) {
        toast({
          title: 'Error de validación',
          description: `La cantidad del producto "${detalle.producto_nombre}" debe ser un número entero mayor a 0`,
          variant: 'destructive',
        });
        return;
      }
      if (!detalle.precio_unitario || detalle.precio_unitario <= 0) {
        toast({
          title: 'Error de validación',
          description: `El precio del producto "${detalle.producto_nombre}" debe ser mayor a 0`,
          variant: 'destructive',
        });
        return;
      }
    }

    if (!metodoPago) {
      toast({
        title: 'Error de validación',
        description: 'Debe seleccionar un método de pago',
        variant: 'destructive',
      });
      return;
    }

    if (!estado) {
      toast({
        title: 'Error de validación',
        description: 'Debe seleccionar un estado para la venta',
        variant: 'destructive',
      });
      return;
    }

    if (descuento !== null && descuento < 0) {
      toast({
        title: 'Error de validación',
        description: 'El descuento no puede ser negativo',
        variant: 'destructive',
      });
      return;
    }

    const subtotal = calcularSubtotal();
    if (descuento !== null && descuento > subtotal) {
      toast({
        title: 'Error de validación',
        description: 'El descuento no puede ser mayor al subtotal',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const total = calcularTotal();
      
      // Actualizar la venta principal
      await VentasService.actualizarVenta(venta.id, {
        metodo_pago: metodoPago,
        estado: estado,
        observaciones: observaciones,
        descuento: descuento || undefined,
        subtotal: subtotal,
        total: total,
      });

      // Actualizar los detalles de la venta
      await actualizarDetallesVenta();

      toast({
        title: 'Éxito',
        description: 'Venta actualizada correctamente',
      });

      onVentaActualizada();
      onClose();
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: 'Error al actualizar',
        description: `No se pudo actualizar la venta: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const actualizarDetallesVenta = async () => {
    if (!ventaId) return;

    try {
      // Obtener los detalles originales para calcular diferencias de stock
      const detallesOriginales = await window.electronAPI.db.query(
        'SELECT producto_id, cantidad FROM venta_detalles WHERE venta_id = ?',
        [ventaId]
      );

      // Calcular diferencias de stock para cada producto
      const diferenciasStock = new Map<number, number>();
      
      // Procesar detalles originales (restaurar stock)
      for (const original of detallesOriginales) {
        diferenciasStock.set(original.producto_id, (diferenciasStock.get(original.producto_id) || 0) + original.cantidad);
      }
      
      // Procesar nuevos detalles (reducir stock)
      for (const nuevo of detalles) {
        diferenciasStock.set(nuevo.producto_id, (diferenciasStock.get(nuevo.producto_id) || 0) - nuevo.cantidad);
      }

      // Aplicar cambios de stock mediante movimientos
      for (const [productoId, diferencia] of diferenciasStock) {
        if (diferencia !== 0) {
          // Obtener stock actual
          const stockItem = await window.electronAPI.db.get(
            'SELECT stock_actual FROM inventario_actual WHERE id = ?',
            [productoId]
          );
          
          const stockAnterior = stockItem?.stock_actual || 0;
          const stockNuevo = stockAnterior + diferencia;
          
          // Crear movimiento de inventario
          const tipoMovimiento = diferencia > 0 ? 'entrada' : 'salida';
          const cantidadMovimiento = Math.abs(diferencia);
          
          await window.electronAPI.db.run(
            `INSERT INTO movimientos (
              producto_id, almacen_id, tipo_movimiento, cantidad,
              stock_anterior, stock_nuevo, observaciones, usuario
            ) VALUES (?, 1, ?, ?, ?, ?, ?, 'sistema')`,
            [
              productoId,
              tipoMovimiento,
              cantidadMovimiento,
              stockAnterior,
              stockNuevo,
              `Ajuste por edición de venta #${ventaId}`
            ]
          );
        }
      }

      // Eliminar todos los detalles existentes
      await window.electronAPI.db.run(
        'DELETE FROM venta_detalles WHERE venta_id = ?',
        [ventaId]
      );

      // Insertar los nuevos detalles
      for (const detalle of detalles) {
        await window.electronAPI.db.run(
          `INSERT INTO venta_detalles (
            venta_id, producto_id, cantidad, precio_unitario, descuento, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            ventaId,
            detalle.producto_id,
            detalle.cantidad,
            detalle.precio_unitario,
            detalle.descuento || 0,
            detalle.subtotal
          ]
        );
      }
    } catch (error) {
      console.error('Error al actualizar detalles:', error);
      throw error;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-600" />
            Editar Venta {venta?.numero_venta}
            {venta && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                venta.estado === 'completada' ? 'bg-green-100 text-green-800' :
                venta.estado === 'credito' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {venta.estado.toUpperCase()}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg">Cargando...</div>
          </div>
        ) : venta ? (
          <div className="space-y-6">
            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cliente</label>
                    <div className="text-sm font-medium">
                      {venta.cliente_nombre || 'Consumidor Final'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de Venta</label>
                    <div className="text-sm">
                      {new Date(venta.fecha_venta).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Productos */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <span>Productos de la Venta</span>
                    <span className="text-sm text-gray-500">({detalles.length} productos)</span>
                  </div>
                  <Button
                    type="button"
                    variant={editandoDetalle === -1 ? "default" : "outline"}
                    onClick={() => setEditandoDetalle(editandoDetalle === -1 ? null : -1)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {editandoDetalle === -1 ? 'Cancelar' : 'Agregar Producto'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Formulario para agregar producto */}
                  {editandoDetalle === -1 && (
                    <div className="p-6 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                      <h4 className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Agregar Nuevo Producto
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Producto *</label>
                          <select
                            value={productoSeleccionado || ''}
                            onChange={(e) => seleccionarProducto(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Seleccionar producto...</option>
                            {productos.map((producto) => (
                              <option key={producto.id} value={producto.id}>
                                {producto.nombre} - {formatCurrency(producto.precio_venta)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad *</label>
                          <input
                              type="number"
                              min="1"
                              step="1"
                              value={cantidadNueva || ''}
                              onChange={(e) => {
                                const valor = e.target.value;
                                if (valor === '') {
                                  setCantidadNueva(null);
                                } else {
                                  const num = Number(valor);
                                  setCantidadNueva(isNaN(num) ? null : num);
                                }
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="1"
                            />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unitario *</label>
                          <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={precioNuevo || ''}
                              onChange={(e) => {
                                const valor = e.target.value;
                                if (valor === '') {
                                  setPrecioNuevo(null);
                                } else {
                                  const num = Number(valor);
                                  setPrecioNuevo(isNaN(num) ? null : num);
                                }
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.00"
                            />
                        </div>
                        <div className="flex flex-col justify-end gap-2">
                          <div className="text-sm text-gray-600 mb-1">
                            Subtotal: {formatCurrency((cantidadNueva || 0) * (precioNuevo || 0))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={agregarProducto}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              disabled={!productoSeleccionado || !cantidadNueva || cantidadNueva <= 0 || !precioNuevo || precioNuevo <= 0}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Agregar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditandoDetalle(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lista de productos */}
                  {detalles.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="h-16 w-16 mx-auto mb-4 opacity-30 bg-gray-200 rounded-full flex items-center justify-center">
                        <Plus className="h-8 w-8" />
                      </div>
                      <p className="text-lg font-medium mb-2">No hay productos en esta venta</p>
                      <p className="text-sm">Agrega productos usando el formulario de arriba</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      <div className="hidden md:grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b font-medium text-sm text-gray-700">
                        <div className="col-span-4">Producto</div>
                        <div className="col-span-2 text-center">Cantidad</div>
                        <div className="col-span-2 text-center">Precio Unit.</div>
                        <div className="col-span-2 text-center">Subtotal</div>
                        <div className="col-span-2 text-center">Acciones</div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {detalles.map((detalle, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors">
                            <div className="col-span-1 md:col-span-4">
                              <div className="font-medium text-gray-900">{detalle.producto_nombre}</div>
                              <div className="text-sm text-gray-500">ID: {detalle.producto_id}</div>
                            </div>
                            
                            {editandoDetalle === index ? (
                              <>
                                <div className="col-span-1 md:col-span-2 flex items-center">
                                  <div className="w-full">
                                    <label className="block text-xs font-medium text-gray-700 mb-1 md:hidden">Cantidad</label>
                                    <input
                                      type="number"
                                      min="1"
                                      step="1"
                                      value={detalle.cantidad || ''}
                                      onChange={(e) => {
                                        const valor = e.target.value;
                                        if (valor === '') {
                                          actualizarDetalle(index, 'cantidad', null);
                                        } else {
                                          const num = Number(valor);
                                          actualizarDetalle(index, 'cantidad', isNaN(num) ? null : num);
                                        }
                                      }}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 flex items-center">
                                  <div className="w-full">
                                    <label className="block text-xs font-medium text-gray-700 mb-1 md:hidden">Precio</label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={detalle.precio_unitario || ''}
                                      onChange={(e) => {
                                        const valor = e.target.value;
                                        if (valor === '') {
                                          actualizarDetalle(index, 'precio_unitario', null);
                                        } else {
                                          const num = Number(valor);
                                          actualizarDetalle(index, 'precio_unitario', isNaN(num) ? null : num);
                                        }
                                      }}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-xs text-gray-500 mb-1 md:hidden">Subtotal</div>
                                    <span className="font-bold text-lg text-green-600">
                                      {formatCurrency(detalle.subtotal)}
                                    </span>
                                  </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 flex items-center justify-center gap-2">
                                  <Button
                                    type="button"
                                    onClick={() => setEditandoDetalle(null)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Edit3 className="h-4 w-4 mr-1" />
                                    Guardar
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditandoDetalle(null)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="col-span-1 md:col-span-2 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-xs text-gray-500 mb-1 md:hidden">Cantidad</div>
                                    <span className="font-semibold text-lg">{detalle.cantidad}</span>
                                  </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-xs text-gray-500 mb-1 md:hidden">Precio Unit.</div>
                                    <span className="font-semibold">{formatCurrency(detalle.precio_unitario)}</span>
                                  </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-xs text-gray-500 mb-1 md:hidden">Subtotal</div>
                                    <span className="font-bold text-lg text-green-600">
                                      {formatCurrency(detalle.subtotal)}
                                    </span>
                                  </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 flex items-center justify-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditandoDetalle(index)}
                                    className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                  >
                                    <Edit3 className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => eliminarDetalle(index)}
                                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detalles de Venta Editables */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                  <span>Detalles de Venta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
                    <select 
                      value={metodoPago} 
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {METODOS_PAGO.map((metodo) => (
                        <option key={metodo.value} value={metodo.value}>
                          {metodo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                    <select 
                      value={estado} 
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {ESTADOS_VENTA.map((est) => (
                        <option key={est.value} value={est.value}>
                          {est.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descuento</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">Bs.</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={descuento || ''}
                        onChange={(e) => {
                          const valor = e.target.value;
                          if (valor === '') {
                            setDescuento(null);
                          } else {
                            const num = parseFloat(valor);
                            setDescuento(isNaN(num) ? null : num);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Máximo: {formatCurrency(calcularSubtotal())}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>
                </div>

                {/* Resumen de Totales */}
                <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Resumen de Totales
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-lg">{formatCurrency(calcularSubtotal())}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Descuento:</span>
                      <span className="font-semibold text-lg text-red-600">-{formatCurrency(descuento || 0)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-green-600">{formatCurrency(calcularTotal())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-lg text-gray-500">No se pudo cargar la venta</div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={guardarCambios} disabled={saving || !venta}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditarVentaModal;