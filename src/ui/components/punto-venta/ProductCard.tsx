// src/components/punto-venta/ProductCard.tsx
import { Package, ShoppingCart, AlertTriangle, Barcode, Scale } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

interface Producto {
  id: number;
  codigo: string;
  codigoBarras: string;
  nombre: string;
  precio: number;
  stock: number;
  ventaFraccionada: boolean;
  unidadMedida: string;
}

interface ProductCardProps {
  producto: Producto;
  onAgregar: (producto: Producto) => void;
}

export default function ProductCard({ producto, onAgregar }: ProductCardProps) {
  const stockBajo = producto.stock < 10;
  const sinStock = producto.stock <= 0;
  
  // Determinar color del badge de stock
  const getStockBadgeClass = () => {
    if (sinStock) return "bg-red-100 text-red-800 border-red-200";
    if (stockBajo) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  };

  return (
    <Card className="group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full product-card">
      {/* Cinta de stock bajo */}
      {stockBajo && !sinStock && (
        <div className="absolute top-0 left-0 right-0 bg-amber-400 text-white text-xs font-bold py-1 px-3 text-center z-10">
          <div className="flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>STOCK BAJO</span>
          </div>
        </div>
      )}
      
      <CardContent className={`p-3 h-full flex flex-col ${stockBajo && !sinStock ? 'pt-8' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1">
            <Barcode className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border">
              {producto.codigo}
            </span>
          </div>

          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded border font-medium ${getStockBadgeClass()}`}>
            <Package className="h-3 w-3" />
            <span className="font-bold">{producto.stock}</span>
          </div>
        </div>
        
        {/* Nombre del producto */}
        <h3 className="font-semibold text-gray-900 leading-tight mb-2 text-sm min-h-[2.5rem]">
          {producto.nombre}
        </h3>
        
        {/* Detalles adicionales */}
        <div className="mb-3 space-y-1.5">
          {/* Código de barras */}
          {producto.codigoBarras && (
            <div className="flex items-center gap-1.5">
              <Barcode className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-600 font-mono truncate">
                {producto.codigoBarras}
              </span>
            </div>
          )}
          
          {/* Unidad de medida */}
          {producto.ventaFraccionada && (
            <div className="flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-gray-500" />
              <Badge variant="default" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-200">
                {producto.unidadMedida}
              </Badge>
            </div>
          )}
        </div>
        
        {/* Precio y acciones */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                Bs {producto.precio.toFixed(2)}
              </span>
              {producto.ventaFraccionada && (
                <span className="text-xs text-gray-500">
                  por {producto.unidadMedida}
                </span>
              )}
            </div>
          </div>
          
          {/* Botón de acción */}
          <Button 
            onClick={() => onAgregar(producto)}
            disabled={sinStock}
            className={`w-full text-xs py-2 font-medium transition-all duration-200 ${
              sinStock
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow'
            }`}
          >
            {sinStock ? (
              <span className="flex items-center justify-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Sin stock
              </span>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Agregar al carrito</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}