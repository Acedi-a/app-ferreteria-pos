import React, { useState, useCallback, useEffect } from "react";
import { Dialog } from "../ui/Dialog";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

import { X, Search, Plus, Package } from "lucide-react";
import { productosService, type Producto } from "../../services/productos-service";
import { MovimientosService } from "../../services/movimientos-service";
import { ProveedoresService, type Proveedor } from "../../services/proveedores-service";
import { useToast } from "../ui/use-toast";
import MovementList from './MovementList';



export interface MovementItem {
  id: number;
  producto_id?: number;
  codigo_barras: string;
  nombre: string;
  precio_venta: number;
  stock_actual: number;
  cantidad: number;
  costo_unitario: number;
  costo_total: number;
  es_nuevo?: boolean;
}

export interface MovementModalProps {
  open: boolean;
  tipo: 'entrada' | 'salida';
  onClose: () => void;
  onSuccess: () => void;
}

function MovementModal({ open, tipo, onClose, onSuccess }: MovementModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Producto[]>([]);
  const [movementItems, setMovementItems] = useState<MovementItem[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [selectedProveedor, setSelectedProveedor] = useState<number | undefined>();
  const [observaciones, setObservaciones] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    codigo_interno: "",
    codigo_barras: "",
    nombre: "",
    precio_venta: 0,
    costo_unitario: 0,
    stock_minimo: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      cargarProveedores();
      setMovementItems([]);
      setSearchTerm("");
      setSearchResults([]);
      setObservaciones("");
      setSelectedProveedor(undefined);
      setShowNewProductForm(false);
    }
  }, [open]);

  const cargarProveedores = async () => {
    try {
      const data = await ProveedoresService.obtenerTodos();
      setProveedores(data);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const buscarProductos = useCallback(async (termino: string) => {
    if (!termino.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const productos = await productosService.buscarProductos(termino);
      setSearchResults(productos.slice(0, 10)); // Limitar a 10 resultados
    } catch (error) {
      console.error('Error buscando productos:', error);
      toast({ 
          title: 'Error al buscar productos',
          variant: 'destructive'
        });
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    // Detectar si es un código de barras (solo números y/o guiones)
    const isBarcode = /^[0-9\-]+$/.test(searchTerm.trim());
    
    // Si es código de barras, búsqueda inmediata; si no, usar debounce
    const delay = isBarcode ? 0 : 300;
    
    const timeoutId = setTimeout(() => {
      buscarProductos(searchTerm);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, buscarProductos]);

  const agregarProductoALista = (producto: Producto) => {
    const existe = movementItems.find(item => item.producto_id === producto.id);
    if (existe) {
      toast({ 
        title: 'El producto ya está en la lista',
        variant: 'destructive'
      });
      return;
    }

    const newItem: MovementItem = {
      id: producto.id || 0,
      producto_id: producto.id,
      codigo_barras: producto.codigo_barras || producto.codigo_interno,
      nombre: producto.nombre,
      precio_venta: producto.precio_venta,
      stock_actual: producto.stock_actual || 0,
      cantidad: 1,
      costo_unitario: producto.costo_unitario || 0,
      costo_total: producto.costo_unitario || 0,
      es_nuevo: false
    };

    setMovementItems(prev => [...prev, newItem]);
    setSearchTerm("");
    setSearchResults([]);
  };

  const crearYAgregarProducto = async () => {
    if (!newProduct.codigo_interno || !newProduct.nombre) {
      toast({ 
        title: 'Código interno y nombre son requeridos',
        variant: 'destructive'
      });
      return;
    }

    try {
      const productoId = await productosService.crearProducto({
        codigo_interno: newProduct.codigo_interno,
        codigo_barras: newProduct.codigo_barras || undefined,
        nombre: newProduct.nombre,
        precio_venta: newProduct.precio_venta,
        costo_unitario: newProduct.costo_unitario,
        stock_minimo: newProduct.stock_minimo,
        activo: true
      });

      const newItem: MovementItem = {
        id: productoId,
        producto_id: productoId,
        codigo_barras: newProduct.codigo_barras || newProduct.codigo_interno,
        nombre: newProduct.nombre,
        precio_venta: newProduct.precio_venta,
        stock_actual: 0,
        cantidad: 1,
        costo_unitario: newProduct.costo_unitario,
        costo_total: newProduct.costo_unitario,
        es_nuevo: true
      };

      setMovementItems(prev => [...prev, newItem]);
      setShowNewProductForm(false);
      setNewProduct({ codigo_interno: "", codigo_barras: "", nombre: "", precio_venta: 0, costo_unitario: 0, stock_minimo: 0 });
      toast({ 
          title: 'Producto creado y agregado a la lista',
          variant: 'success'
        });
    } catch (error) {
      console.error('Error creando producto:', error);
      toast({ 
          title: 'Error al crear el producto',
          variant: 'destructive'
        });
    }
  };



  const eliminarItem = (id: number) => {
    setMovementItems(prev => prev.filter(item => item.id !== id));
  };

  const updateMovementItem = useCallback((id: number, updates: Partial<MovementItem>) => {
    setMovementItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const procesarMovimientos = async () => {
    if (movementItems.length === 0) {
      toast({ 
        title: 'Debe agregar al menos un producto',
        variant: 'destructive'
      });
      return;
    }

    if (tipo === 'entrada' && !selectedProveedor) {
      toast({ 
        title: 'Debe seleccionar un proveedor para las entradas',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      for (const item of movementItems) {
        if (!item.producto_id) continue;

        if (tipo === 'entrada') {
          await MovimientosService.registrarEntrada({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            costo_unitario: item.costo_unitario,
            proveedor_id: selectedProveedor!,
            observaciones: observaciones || `Entrada masiva - ${item.nombre}`
          });
        } else {
          await MovimientosService.registrarSalida({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            observaciones: observaciones || `Salida masiva - ${item.nombre}`
          });
        }
      }

      toast({ 
        title: `${tipo === 'entrada' ? 'Entradas' : 'Salidas'} registradas exitosamente`,
        variant: 'success'
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error procesando movimientos:', error);
      toast({ 
        title: 'Error al procesar los movimientos',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalGeneral = movementItems.reduce((sum, item) => sum + item.costo_total, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Registrar {tipo === 'entrada' ? 'Entrada' : 'Salida'} de Stock
                </h2>
                <p className="text-sm text-slate-500">
                  Busque productos y registre movimientos de inventario
                </p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de búsqueda */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Buscar Productos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, código o código de barras..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {isSearching && (
                    <div className="text-center py-4 text-slate-500">Buscando...</div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      {searchResults.map((producto) => (
                        <div
                          key={producto.id}
                          className="p-3 border-b last:border-b-0 hover:bg-slate-50 cursor-pointer"
                          onClick={() => agregarProductoALista(producto)}
                        >
                          <div className="font-medium">{producto.nombre}</div>
                          <div className="text-sm text-slate-500">
                            {producto.codigo_interno} • {producto.categoria_nombre || 'Sin categoría'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchTerm && !isSearching && searchResults.length === 0 && (
                    <div className="text-center py-4">
                      <div className="text-slate-500 mb-2">No se encontraron productos</div>
                      <Button
                        onClick={() => {
                          setNewProduct(prev => ({ ...prev, codigo_interno: searchTerm }));
                          setShowNewProductForm(true);
                        }}
                        variant="outline"
                        className="px-2 py-1"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Producto Nuevo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Formulario de producto nuevo */}
              {showNewProductForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Crear Producto Nuevo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Código Interno *</label>
                      <input
                        type="text"
                        value={newProduct.codigo_interno}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, codigo_interno: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Código de Barras</label>
                      <input
                        type="text"
                        value={newProduct.codigo_barras}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, codigo_barras: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre *</label>
                      <input
                        type="text"
                        value={newProduct.nombre}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Precio Venta</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.precio_venta}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, precio_venta: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Costo Unitario</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.costo_unitario}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, costo_unitario: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                      <input
                        type="number"
                        value={newProduct.stock_minimo}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, stock_minimo: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={crearYAgregarProducto} className="px-2 py-1">
                        <Package className="mr-2 h-4 w-4" />
                        Crear y Agregar
                      </Button>
                      <Button
                        onClick={() => setShowNewProductForm(false)}
                        variant="outline"
                        className="px-2 py-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Panel de lista de movimientos */}
            <div className="space-y-4">
              <MovementList
                 items={movementItems}
                 onUpdateItem={updateMovementItem}
                 onRemoveItem={eliminarItem}
                 tipo={tipo}
               />

              {/* Configuración del movimiento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Configuración</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tipo === 'entrada' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Proveedor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedProveedor || ''}
                        onChange={(e) => setSelectedProveedor(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar proveedor...</option>
                        {proveedores.map(proveedor => (
                          <option key={proveedor.id} value={proveedor.id}>
                            {proveedor.id} - {proveedor.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Observaciones</label>
                    <textarea
                      rows={3}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Observaciones del movimiento..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {tipo === 'entrada' && totalGeneral > 0 && (
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-sm font-medium">Total General</div>
                      <div className="text-lg font-bold text-green-600">
                        Bs {totalGeneral.toFixed(2)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button
              onClick={procesarMovimientos}
              disabled={isProcessing || movementItems.length === 0}
              className={tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isProcessing ? 'Procesando...' : `Registrar ${tipo === 'entrada' ? 'Entradas' : 'Salidas'}`}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default React.memo(MovementModal);