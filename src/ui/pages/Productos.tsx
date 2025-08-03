import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
 import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/Button";
import { SearchBar } from "../components/ui/SearchBar";
import ProductStats from "../components/productos/ProductStats";
import ProductTable from "../components/productos/ProductTable";
import ProductModal from "../components/productos/ProductModal";
import { productosService } from "../services/productos-service";
import type { Producto, ProductoStats, Categoria, TipoUnidad } from "../services/productos-service";

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
      const data = await productosService.obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      toast({ title: "Error", description: "Error al cargar productos" });
    }
  };

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

  const buscarProductos = async (termino: string) => {
    if (!termino.trim()) {
      cargarProductos();
      return;
    }

    setLoading(true);
    try {
      const data = await productosService.buscarProductos(termino);
      setProductos(data);
    } catch (error) {
      console.error("Error buscando productos:", error);
      toast({ title: "Error", description: "Error en la búsqueda" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarProductos(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      codigo_barras: "",
      codigo_interno: "",
      nombre: "",
      descripcion: "",
      costo: 0,
      precio_venta: 0,
      stock_actual: 0,
      stock_minimo: 0,
      venta_fraccionada: false,
      categoria_id: undefined,
      tipo_unidad_id: undefined,
      activo: true,
      fotos: ""
    });
    setShowModal(true);
  };

  const handleEdit = (producto: Producto) => {
    setEditingProduct(producto);
    setFormData({
      codigo_barras: producto.codigo_barras || "",
      codigo_interno: producto.codigo_interno,
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      costo: producto.costo,
      precio_venta: producto.precio_venta,
      stock_actual: producto.stock_actual,
      stock_minimo: producto.stock_minimo,
      venta_fraccionada: producto.venta_fraccionada,
      categoria_id: producto.categoria_id,
      tipo_unidad_id: producto.tipo_unidad_id,
      activo: producto.activo,
      fotos: producto.fotos || ""
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
      // Solo validar códigos únicos si realmente se cambió el código interno o de barras
      const isEditing = editingProduct && editingProduct.id;

      // Validar código interno solo si es nuevo producto o si el usuario lo cambió y no está vacío
      if (!isEditing || (typeof formData.codigo_interno === 'string' && formData.codigo_interno.trim() !== '' && formData.codigo_interno !== editingProduct?.codigo_interno)) {
        const codigoInternoValido = await productosService.validarCodigoInterno(
          formData.codigo_interno!,
          editingProduct?.id
        );
        if (!codigoInternoValido) {
          toast({ title: "Error", description: "El código interno ya existe", variant: "destructive" });
          return;
        }
      }

      // Validar código de barras solo si existe, no está vacía y es nuevo producto o si el usuario la cambió
      if (typeof formData.codigo_barras === 'string' && formData.codigo_barras.trim() !== '' && (!isEditing || (formData.codigo_barras !== editingProduct?.codigo_barras))) {
        const codigoBarrasValido = await productosService.validarCodigoBarras(
          formData.codigo_barras,
          editingProduct?.id
        );
        if (!codigoBarrasValido) {
          toast({ title: "Error", description: "El código de barras ya existe", variant: "destructive" });
          return;
        }
      }

      if (editingProduct) {
        // Actualizar producto existente
        await productosService.actualizarProducto(editingProduct.id!, formData);
        toast({ title: "Éxito", description: "Producto actualizado exitosamente", variant: "success" });
      } else {
        // Crear nuevo producto
        await productosService.crearProducto(formData as Omit<Producto, 'id' | 'fecha_creacion' | 'fecha_modificacion'>);
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
      await productosService.eliminarProducto(id);
      toast({ title: "Éxito", description: "Producto eliminado exitosamente", variant: "success" });
      await cargarProductos();
      await cargarEstadisticas();
    } catch (error) {
      console.error("Error eliminando producto:", error);
      toast({ title: "Error", description: "Error al eliminar el producto", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header estilo macOS */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-4xl font-light text-gray-900 tracking-tight">Productos</h1>
              <p className="mt-2 text-base text-gray-600 font-light">Gestiona tu catálogo de productos</p>
            </div>
            <Button 
              onClick={handleNewProduct}
              className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Estadísticas */}
          <ProductStats stats={stats} />

          {/* Barra de búsqueda */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onClear={() => {
                  setSearchTerm("");
                  cargarProductos();
                }}
                placeholder="Buscar productos..."
              />
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50 bg-white/50">
              <h2 className="text-xl font-light text-gray-900 tracking-tight">Lista de Productos</h2>
              <p className="mt-2 text-sm text-gray-600 font-light">Administra y visualiza todos tus productos</p>
            </div>
            
            {/* Table Content */}
            <ProductTable
              products={productos}
              loading={loading}
              searchTerm={searchTerm}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
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