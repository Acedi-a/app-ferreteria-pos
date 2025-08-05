// src/components/punto-venta/ProductCard.tsx
import React from "react";
import { Package, ShoppingCart } from "lucide-react";
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
  const [isHovered, setIsHovered] = React.useState(false);
  const stockBajo = producto.stock < 10;
  
  return (
    <Card 
      className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden h-full product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Imagen/Header del producto con gradiente */}
        <div className="relative h-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden">
          {/* Ícono del producto */}
          <div className="text-6xl font-bold text-gray-300/50 transform group-hover:scale-110 transition-transform duration-300">
            {producto.nombre.charAt(0).toUpperCase()}
          </div>
          
          {/* Badge de stock flotante */}
          <div className="absolute top-3 right-3">
            <div className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full shadow-md font-medium transition-all duration-300 ${
              stockBajo 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              <Package className="h-3 w-3" />
              <span>{producto.stock}</span>
            </div>
          </div>

          {/* Código del producto */}
          <div className="absolute bottom-3 left-3">
            <div className="text-xs font-mono bg-white/80 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-md shadow-sm">
              {producto.codigo}
            </div>
          </div>

          {/* Gradiente overlay en hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/10 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
          
          {/* Efecto de brillo */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </div>
        </div>
        
        {/* Contenido del producto */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Nombre del producto */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight mb-3 min-h-[2.5rem] group-hover:text-blue-600 transition-colors duration-200">
            {producto.nombre}
          </h3>
          
          {/* Precio y unidad */}
          <div className="flex items-center justify-between mb-4 flex-1">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                Bs {producto.precio.toFixed(2)}
              </span>
              {producto.ventaFraccionada && (
                <Badge variant="default" className="text-xs px-2 py-1 mt-1 bg-blue-100 text-blue-700 w-fit">
                  {producto.unidadMedida}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Botón de agregar mejorado */}
          <div className="space-y-2">
            <Button 
              onClick={() => onAgregar(producto)}
              disabled={producto.stock <= 0}
              className={`w-full text-sm py-3 font-medium transition-all duration-300 transform group-hover:scale-105 ${
                producto.stock <= 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:scale-100'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg active:scale-95'
              }`}
            >
              {producto.stock <= 0 ? (
                <span>Sin stock</span>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Agregar al carrito</span>
                </div>
              )}
            </Button>
            
            {stockBajo && producto.stock > 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg text-center border border-amber-200 animate-pulse">
                <span className="font-medium">⚠️ Stock bajo</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
