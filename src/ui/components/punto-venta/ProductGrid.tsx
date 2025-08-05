// src/components/punto-venta/ProductGrid.tsx
import { Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import ProductCard from "./ProductCard";

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

interface ProductGridProps {
  productos: Producto[];
  onAgregarProducto: (producto: Producto) => void;
  busqueda: string;
  onCambioBusqueda: (busqueda: string) => void;
}

export default function ProductGrid({ 
  productos, 
  onAgregarProducto, 
  busqueda, 
  onCambioBusqueda 
}: ProductGridProps) {
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigoBarras.includes(busqueda)
  );

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o código de barras..."
              value={busqueda}
              onChange={(e) => onCambioBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid de productos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Productos Disponibles
          </h2>
          <span className="text-sm text-gray-500">
            {productosFiltrados.length} de {productos.length} productos
          </span>
        </div>

        {productosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-500">
                Intenta con términos de búsqueda diferentes
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
            {productosFiltrados.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onAgregar={onAgregarProducto}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
