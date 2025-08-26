import { useState, useEffect } from "react";
import { Plus, Building2, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { nanoid } from "nanoid";
 import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/Button";
import { SearchBar } from "../components/ui/SearchBar";
import ProductStats from "../components/productos/ProductStats";
import ProductTable from "../components/productos/ProductTable";
import ProductModal from "../components/productos/ProductModal";
import { productosService } from "../services/productos-service";
import type { Producto, ProductoStats, Categoria, TipoUnidad, PaginatedResult } from "../services/productos-service";

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tiposUnidad, setTiposUnidad] = useState<TipoUnidad[]>([]);
  const [stats, setStats] = useState<ProductoStats>({
    totalProductos: 0,
    stockBajo: 0,
    valorInventario: 0,
    productosActivos: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Estados para paginación
  const [paginatedData, setPaginatedData] = useState<PaginatedResult<Producto> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<Partial<Producto>>({});

 

const { toast } = useToast();

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarProductos(),
        cargarCategorias(),
        cargarTiposUnidad(),
        cargarEstadisticas()
      ]);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({ title: "Error", description: "Error al cargar los datos" });
    } finally {
      setLoading(false);
    }
  };

  const cargarProductos = async () => {
    try {
      setIsLoading(true);
      const data = await productosService.obtenerProductosPaginados(
        currentPage,
        pageSize,
        searchTerm,
        selectedCategory
      );
      setPaginatedData(data);
      setProductos(data.data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      toast({ title: "Error", description: "Error al cargar productos" });
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para recargar cuando cambian los filtros o página
  useEffect(() => {
    cargarProductos();
  }, [currentPage, searchTerm, selectedCategory]);

  const cargarCategorias = async () => {
    try {
      const data = await productosService.obtenerCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const cargarTiposUnidad = async () => {
    try {
      const data = await productosService.obtenerTiposUnidad();
      setTiposUnidad(data);
    } catch (error) {
      console.error("Error cargando tipos de unidad:", error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await productosService.obtenerEstadisticas();
      setStats(data);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  // Funciones para manejar cambios en filtros
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Resetear a la primera página
  };

  const handleCategoryChange = (categoryId: number | undefined) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Resetear a la primera página
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(undefined);
    setCurrentPage(1);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      codigo_barras: "",
      codigo_interno: nanoid(12), // Generar código automáticamente con 12 caracteres
  marca: "",
      nombre: "",
      descripcion: "",
  costo_unitario: 0,
      precio_venta: 0,
      stock_minimo: 0,
      categoria_id: undefined,
      tipo_unidad_id: undefined,
      unidad_medida: "",
  venta_fraccionada: false,
  activo: true,
  imagen_url: undefined
    });
    setShowModal(true);
  };

  const handleEdit = (producto: Producto) => {
    setEditingProduct(producto);
    setFormData({
      codigo_barras: producto.codigo_barras || "",
      codigo_interno: producto.codigo_interno,
  marca: producto.marca || "",
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
  costo_unitario: (producto as any).costo_unitario ?? 0,
      precio_venta: producto.precio_venta,
      stock_minimo: producto.stock_minimo,
      categoria_id: producto.categoria_id,
      tipo_unidad_id: producto.tipo_unidad_id,
      unidad_medida: producto.unidad_medida || "",
  venta_fraccionada: (producto as any).venta_fraccionada ?? false,
  activo: producto.activo,
  imagen_url: producto.imagen_url
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.codigo_interno) {
      toast({ title: "Error", description: "Nombre y código interno son obligatorios", variant: "destructive" });
      return;
    }

    try {
      // TODO: Add validation for duplicate codes if needed
      // For now, we rely on database constraints

      if (editingProduct) {
        // Actualizar producto existente
        await productosService.actualizarProducto(editingProduct.id!, formData);
        toast({ title: "Éxito", description: "Producto actualizado exitosamente", variant: "success" });
      } else {
        // Crear nuevo producto
        await productosService.crearProducto(formData as Omit<Producto, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>);
        toast({ title: "Éxito", description: "Producto creado exitosamente", variant: "success" });
      }

      setShowModal(false);
      await cargarProductos();
      await cargarEstadisticas();
    } catch (error) {
      console.error("Error guardando producto:", error);
      toast({ title: "Error", description: "Error al guardar el producto", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }

    try {
      const prod = productos.find(p => p.id === id);
      await productosService.eliminarProducto(id);
      // Intentar borrar la imagen asociada si era gestionada por la app
      if (prod?.imagen_url && prod.imagen_url.startsWith('file://')) {
        try { await window.electronAPI.deleteImage(prod.imagen_url); } catch {}
      }
      toast({ title: "Éxito", description: "Producto eliminado exitosamente", variant: "success" });
      await cargarProductos();
      await cargarEstadisticas();
    } catch (error) {
      console.error("Error eliminando producto:", error);
      toast({ title: "Error", description: "Error al eliminar el producto", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screens">
      {/* Header Profesional con Branding */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Gestión de Productos</h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  Sistema empresarial de administración de productos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded border border-gray-200">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Sistema Seguro</span>
              </div>
              <Link
                to="/productos/masivos"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-100 text-slate-900"
              >
                Registros masivos en productos
              </Link>
              
              <Button 
                onClick={handleNewProduct}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Producto
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className=" mx-auto lg:px-8 py-8">
        <div className="space-y-8">
          {/* Panel de Estadísticas Mejorado */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Panel de Control</h2>
                  <p className="text-sm text-gray-600">Métricas y estadísticas en tiempo real</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded border border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">En línea</span>
              </div>
            </div>
            <ProductStats stats={stats} />
          </div>

          {/* Sección de Búsqueda Mejorada */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Catálogo de Productos</h3>
                <p className="text-sm text-gray-600">Busca y administra tu inventario de productos</p>
              </div>
              <div className="w-full sm:w-96">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  onClear={clearFilters}
                  placeholder="Buscar por nombre, código o categoría..."
                  barcodeSearch
                />
              </div>
            </div>
          </div>

          {/* Tabla de productos con diseño empresarial */}
           <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto" style={{scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch'}}>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Registro de Productos</h2>
                  <p className="text-sm text-gray-600">Administra y visualiza todos tus productos</p>
                </div>
                <div className="text-sm text-gray-500">
                  {paginatedData ? (
                    <>Total: <span className="font-medium text-gray-900">{paginatedData.totalItems}</span> productos</>
                  ) : (
                    <>Total: <span className="font-medium text-gray-900">{productos.length}</span> productos</>
                  )}
                </div>
              </div>
            </div>
            
            {/* Table Content */}
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-slate-500">Cargando productos...</div>
              </div>
            ) : (
              <>
                <ProductTable
                  products={productos}
                  loading={isLoading}
                  searchTerm={searchTerm}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onProductUpdate={cargarProductos}
                />
                
                {/* Pagination Controls */}
                {paginatedData && paginatedData.totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="text-sm text-slate-500">
                      Mostrando {((paginatedData.currentPage - 1) * paginatedData.pageSize) + 1} a{' '}
                      {Math.min(paginatedData.currentPage * paginatedData.pageSize, paginatedData.totalItems)} de{' '}
                      {paginatedData.totalItems} productos
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Botón Primera Página */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={paginatedData.currentPage === 1}
                        title="Primera página"
                      >
                        ««
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(paginatedData.currentPage - 1)}
                        disabled={paginatedData.currentPage === 1}
                      >
                        Anterior
                      </Button>
                      
                      {/* Page Numbers */}
                      {(() => {
                        const pages = [];
                        const totalPages = paginatedData.totalPages;
                        const currentPage = paginatedData.currentPage;

                        // Siempre mostrar primera página
                        if (currentPage > 3) {
                          pages.push(
                            <Button
                              key={1}
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(1)}
                            >
                              1
                            </Button>
                          );
                          if (currentPage > 4) {
                            pages.push(
                              <span key="ellipsis1" className="px-2">
                                ...
                              </span>
                            );
                          }
                        }

                        // Páginas alrededor de la página actual
                        for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={i === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(i)}
                            >
                              {i}
                            </Button>
                          );
                        }

                        // Siempre mostrar última página
                        if (currentPage < totalPages - 2) {
                          if (currentPage < totalPages - 3) {
                            pages.push(
                              <span key="ellipsis2" className="px-2">
                                ...
                              </span>
                            );
                          }
                          pages.push(
                            <Button
                              key={totalPages}
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(totalPages)}
                            >
                              {totalPages}
                            </Button>
                          );
                        }

                        return pages;
                      })()}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(paginatedData.currentPage + 1)}
                        disabled={paginatedData.currentPage === paginatedData.totalPages}
                      >
                        Siguiente
                      </Button>
                      
                      {/* Botón Última Página */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(paginatedData.totalPages)}
                        disabled={paginatedData.currentPage === paginatedData.totalPages}
                        title="Última página"
                      >
                        »»
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        categorias={categorias}
        tiposUnidad={tiposUnidad}
      />

      
    </div>
  );
}