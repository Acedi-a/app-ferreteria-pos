// src/components/punto-venta/ProductGrid.tsx
import { Search, Filter, Package, ArrowUpDown, RotateCcw, Tag } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
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
  categoria?: string;
}

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

interface ProductGridProps {
  productos: Producto[];
  categorias?: Categoria[];
  onAgregarProducto: (producto: Producto) => void;
  busqueda: string;
  onCambioBusqueda: (busqueda: string) => void;
  filtroStock?: string;
  onCambioFiltroStock?: (filtro: string) => void;
  filtroCategoria?: string;
  onCambioFiltroCategoria?: (filtro: string) => void;
  ordenPrecio?: string;
  onCambioOrdenPrecio?: (orden: string) => void;
  filtroVenta?: string;
  onCambioFiltroVenta?: (filtro: string) => void;
}

export default function ProductGrid({ 
  productos, 
  categorias = [],
  onAgregarProducto, 
  busqueda, 
  onCambioBusqueda,
  filtroStock = "todos",
  onCambioFiltroStock = () => {},
  filtroCategoria = "todas",
  onCambioFiltroCategoria = () => {},
  ordenPrecio = "ninguno", 
  onCambioOrdenPrecio = () => {},
  filtroVenta = "todos",
  onCambioFiltroVenta = () => {}
}: ProductGridProps) {
  
  const aplicarFiltros = (productos: Producto[]) => {
    let filtrados = productos;

    // Filtro por búsqueda
    if (busqueda.trim()) {
      filtrados = filtrados.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.codigoBarras.includes(busqueda)
      );
    }

    // Filtro por stock
    if (filtroStock !== "todos") {
      switch (filtroStock) {
        case "disponible":
          filtrados = filtrados.filter(p => p.stock > 0);
          break;
        case "bajo":
          filtrados = filtrados.filter(p => p.stock > 0 && p.stock <= 10);
          break;
        case "agotado":
          filtrados = filtrados.filter(p => p.stock === 0);
          break;
      }
    }

    // Filtro por categoría
    if (filtroCategoria !== "todas") {
      filtrados = filtrados.filter(p => p.categoria === filtroCategoria);
    }

    // Filtro por tipo de venta
    if (filtroVenta !== "todos") {
      switch (filtroVenta) {
        case "unidad":
          filtrados = filtrados.filter(p => !p.ventaFraccionada);
          break;
        case "fraccionada":
          filtrados = filtrados.filter(p => p.ventaFraccionada);
          break;
      }
    }

    // Ordenamiento por precio
    if (ordenPrecio !== "ninguno") {
      switch (ordenPrecio) {
        case "menor_mayor":
          filtrados = filtrados.sort((a, b) => a.precio - b.precio);
          break;
        case "mayor_menor":
          filtrados = filtrados.sort((a, b) => b.precio - a.precio);
          break;
      }
    }

    return filtrados;
  };

  const productosFiltrados = aplicarFiltros(productos);

  const limpiarFiltros = () => {
    onCambioBusqueda("");
    onCambioFiltroStock("todos");
    onCambioFiltroCategoria("todas");
    onCambioOrdenPrecio("ninguno");
    onCambioFiltroVenta("todos");
  };

  const hayFiltrosActivos = busqueda.trim() || filtroStock !== "todos" || filtroCategoria !== "todas" || ordenPrecio !== "ninguno" || filtroVenta !== "todos";

  // Obtener categorías disponibles (usar las de props si están disponibles, sino extraer de productos)
  const categoriasDisponibles = categorias && categorias.length > 0 
    ? categorias.map(c => c.nombre)
    : Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)));

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
          
          {/* Filtros */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Stock:</span>
                <select
                  value={filtroStock}
                  onChange={(e) => onCambioFiltroStock(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="disponible">Disponible</option>
                  <option value="bajo">Stock bajo (≤10)</option>
                  <option value="agotado">Agotado</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Categoría:</span>
                <select
                  value={filtroCategoria}
                  onChange={(e) => onCambioFiltroCategoria(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todas">Todas</option>
                  {categoriasDisponibles.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Ordenar precio:</span>
                <select
                  value={ordenPrecio}
                  onChange={(e) => onCambioOrdenPrecio(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ninguno">Sin orden</option>
                  <option value="menor_mayor">Menor a mayor</option>
                  <option value="mayor_menor">Mayor a menor</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Venta:</span>
                <select
                  value={filtroVenta}
                  onChange={(e) => onCambioFiltroVenta(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="unidad">Por unidad</option>
                  <option value="fraccionada">Fraccionada</option>
                </select>
              </div>

              {hayFiltrosActivos && (
                <Button
                  variant="outline"
                  onClick={limpiarFiltros}
                  className="text-xs flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Limpiar filtros
                </Button>
              )}
            </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
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
