import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Trash2, Package } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { productosService } from '../../services/productos-service';

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
}

interface MovementListProps {
  items: MovementItem[];
  onUpdateItem: (id: number, updates: Partial<MovementItem>) => void;
  onRemoveItem: (id: number) => void;
  tipo: 'entrada' | 'salida';
}

export default function MovementList({ items, onUpdateItem, onRemoveItem, tipo }: MovementListProps) {
  const [editingField, setEditingField] = useState<{ id: number; field: string } | null>(null);

  const handleFieldEdit = useCallback(async (id: number, field: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    if (field === 'cantidad') {
      const newCostoTotal = numericValue * item.costo_unitario;
      onUpdateItem(id, { 
        cantidad: numericValue,
        costo_total: newCostoTotal
      });
    } else if (field === 'costo_unitario') {
      const newCostoTotal = item.cantidad * numericValue;
      onUpdateItem(id, { 
        costo_unitario: numericValue,
        costo_total: newCostoTotal
      });
      
      // Actualizar el producto en la base de datos si tiene producto_id
      if (item.producto_id) {
        try {
          await productosService.actualizarProducto(item.producto_id, {
            costo_unitario: numericValue
          });
        } catch (error) {
          console.error('Error actualizando costo unitario del producto:', error);
        }
      }
    } else if (field === 'precio_venta') {
      onUpdateItem(id, { 
        precio_venta: numericValue
      });
      
      // Actualizar el producto en la base de datos si tiene producto_id
      if (item.producto_id) {
        try {
          await productosService.actualizarProducto(item.producto_id, {
            precio_venta: numericValue
          });
        } catch (error) {
          console.error('Error actualizando precio de venta del producto:', error);
        }
      }
    }
    
    setEditingField(null);
  }, [items, onUpdateItem]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent, id: number, field: string) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      handleFieldEdit(id, field, target.value);
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  }, [handleFieldEdit]);

  const totalGeneral = items.reduce((sum, item) => sum + item.costo_total, 0);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No hay productos agregados</p>
            <p className="text-sm">Busca y agrega productos para registrar el movimiento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Lista de Productos ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-14 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
            <div className="col-span-3">Producto</div>
            <div className="col-span-1 text-center">Stock</div>
            <div className="col-span-2 text-center">Cantidad</div>
            <div className="col-span-2 text-center">Precio Venta</div>
            <div className="col-span-2 text-center">Costo Unit.</div>
            <div className="col-span-3 text-center">Costo Total</div>
            <div className="col-span-1 text-center">Acciones</div>
          </div>

          {/* Items */}
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-14 gap-2 items-center py-2 border-b border-gray-100">
              {/* Producto */}
              <div className="col-span-3">
                <div className="font-medium text-sm">{item.nombre}</div>
                <div className="text-xs text-gray-500">{item.codigo_barras}</div>
              </div>

              {/* Stock actual */}
              <div className="col-span-1 text-center text-sm">
                <span className={`px-2 py-1 rounded text-xs ${
                  item.stock_actual <= 0 ? 'bg-red-100 text-red-700' :
                  item.stock_actual <= 10 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {item.stock_actual}
                </span>
              </div>

              {/* Cantidad */}
              <div className="col-span-2">
                {editingField?.id === item.id && editingField?.field === 'cantidad' ? (
                  <Input
                    type="number"
                    defaultValue={item.cantidad.toString()}
                    onBlur={(e) => handleFieldEdit(item.id, 'cantidad', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFieldEdit(item.id, 'cantidad', e.currentTarget.value);
                      }
                    }}
                    className="h-8 text-center"
                    autoFocus
                  />
                ) : (
                  <div 
                    className="text-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                    onClick={() => setEditingField({ id: item.id, field: 'cantidad' })}
                  >
                    {item.cantidad}
                  </div>
                )}
              </div>

              {/* Precio Venta */}
              <div className="col-span-2">
                {editingField?.id === item.id && editingField?.field === 'precio_venta' ? (
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={item.precio_venta?.toString() || '0'}
                    onBlur={(e) => handleFieldEdit(item.id, 'precio_venta', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFieldEdit(item.id, 'precio_venta', e.currentTarget.value);
                      }
                    }}
                    className="h-8 text-center"
                    autoFocus
                  />
                ) : (
                  <div 
                    className="text-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                    onClick={() => setEditingField({ id: item.id, field: 'precio_venta' })}
                  >
                    {formatCurrency(item.precio_venta || 0)}
                  </div>
                )}
              </div>

              {/* Costo unitario */}
               <div className="col-span-2">
                 {editingField?.id === item.id && editingField?.field === 'costo_unitario' ? (
                   <Input
                     type="number"
                     step="0.01"
                     defaultValue={item.costo_unitario.toString()}
                     onBlur={(e) => handleFieldEdit(item.id, 'costo_unitario', e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         handleFieldEdit(item.id, 'costo_unitario', e.currentTarget.value);
                       }
                     }}
                     className="h-8 text-center"
                     autoFocus
                   />
                 ) : (
                   <div 
                     className="text-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                     onClick={() => setEditingField({ id: item.id, field: 'costo_unitario' })}
                   >
                     {formatCurrency(item.costo_unitario)}
                   </div>
                 )}
               </div>

              {/* Costo Total - No editable */}
              <div className="col-span-3">
                <div className="text-center p-1 rounded bg-gray-50 text-gray-600">
                  {formatCurrency(item.costo_total)}
                </div>
              </div>

              {/* Acciones */}
              <div className="col-span-1 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total General:</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(totalGeneral)}
            </span>
          </div>
          {tipo === 'salida' && (
            <div className="text-sm text-gray-600 mt-1">
              * Los costos en salidas son referenciales
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}