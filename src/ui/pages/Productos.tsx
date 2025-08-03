import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

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

  const toast = (msg: string) => {
    alert(msg); // Reemplazar con toast real más adelante
  };

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
      toast("Error al cargar los datos");
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
      toast("Error al cargar productos");
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
      toast("Error en la búsqueda");
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
      toast("Nombre y código interno son obligatorios");
      return;
    }

    try {
      // Validar códigos únicos
      const codigoInternoValido = await productosService.validarCodigoInterno(
        formData.codigo_interno!, 
        editingProduct?.id
      );
      
      if (!codigoInternoValido) {
        toast("El código interno ya existe");
        return;
      }

      if (formData.codigo_barras) {
        const codigoBarrasValido = await productosService.validarCodigoBarras(
          formData.codigo_barras, 
          editingProduct?.id
        );
        
        if (!codigoBarrasValido) {
          toast("El código de barras ya existe");
          return;
        }
      }

      if (editingProduct) {
        // Actualizar producto existente
        await productosService.actualizarProducto(editingProduct.id!, formData);
        toast("Producto actualizado exitosamente");
      } else {
        // Crear nuevo producto
        await productosService.crearProducto(formData as Omit<Producto, 'id' | 'fecha_creacion' | 'fecha_modificacion'>);
        toast("Producto creado exitosamente");
      }

      setShowModal(false);
      await cargarProductos();
      await cargarEstadisticas();
    } catch (error) {
      console.error("Error guardando producto:", error);
      toast("Error al guardar el producto");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }

    try {
      await productosService.eliminarProducto(id);
      toast("Producto eliminado exitosamente");
      await cargarProductos();
      await cargarEstadisticas();
    } catch (error) {
      console.error("Error eliminando producto:", error);
      toast("Error al eliminar el producto");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-sm text-slate-500">Gestiona tu catálogo de productos</p>
        </div>
        <Button onClick={handleNewProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Stats Cards */}
      <ProductStats stats={stats} />

      {/* Search */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => {
          setSearchTerm("");
          cargarProductos();
        }}
        placeholder="Buscar productos..."
      />

      {/* Products Table */}
      <ProductTable
        products={productos}
        loading={loading}
        searchTerm={searchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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