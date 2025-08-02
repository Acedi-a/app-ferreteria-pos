import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import { ProductoService, type Producto } from "../services/database-services";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";

export default function ProductosConServicio() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<Partial<Producto>>({});
  const [saving, setSaving] = useState(false);

  // Cargar productos iniciales
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await ProductoService.obtenerTodos();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = async () => {
    if (!searchTerm.trim()) {
      cargarProductos();
      return;
    }

    try {
      setLoading(true);
      const data = await ProductoService.buscar(searchTerm);
      setProductos(data);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      alert('Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      nombre: "",
      descripcion: "",
      costo: 0,
      precio_venta: 0,
      stock_actual: 0,
      stock_minimo: 0,
      unidad_medida: "unidad",
      categoria: "",
      activo: true
    });
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Producto) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (product: Producto) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${product.nombre}"?`)) {
      try {
        await ProductoService.eliminar(product.id!);
        cargarProductos();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.nombre?.trim()) {
      alert('El nombre del producto es requerido');
      return;
    }

    try {
      setSaving(true);
      
      if (editingProduct) {
        // Actualizar producto existente
        await ProductoService.actualizar(editingProduct.id!, formData);
      } else {
        // Crear nuevo producto
        await ProductoService.crear(formData as Omit<Producto, 'id'>);
      }
      
      setIsDialogOpen(false);
      cargarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  // Función para determinar si un producto tiene stock bajo
  const tieneStockBajo = (producto: Producto) => {
    return producto.stock_actual <= producto.stock_minimo;
  };

  if (loading && productos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
        </div>
        <Button onClick={handleAddProduct} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Agregar Producto</span>
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{productos.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-red-600">
                  {productos.filter(tieneStockBajo).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
                <p className="text-2xl font-bold text-green-600">
                  ${productos.reduce((total, p) => total + (p.precio_venta * p.stock_actual), 0).toFixed(2)}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código de barras o código interno..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarProductos()}
              />
            </div>
            <Button onClick={buscarProductos} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  cargarProductos();
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos ({productos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((product) => (
                <TableRow key={product.id} className={tieneStockBajo(product) ? 'bg-red-50' : ''}>
                  <TableCell className="font-mono text-sm">
                    {product.codigo_interno || product.codigo_barras || '-'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.nombre}</div>
                      <div className="text-sm text-gray-500">{product.descripcion}</div>
                    </div>
                  </TableCell>
                  <TableCell>{product.categoria || '-'}</TableCell>
                  <TableCell>${product.precio_venta?.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{product.stock_actual}</span>
                      {tieneStockBajo(product) && (
                        <Badge variant="destructive">Bajo</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.activo ? "success" : "default"}>
                      {product.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {productos.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron productos con ese criterio' : 'No hay productos registrados'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Producto" : "Agregar Producto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? "Modifica los datos del producto"
                : "Completa la información del nuevo producto"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Interno
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.codigo_interno || ""}
                  onChange={(e) => setFormData({ ...formData, codigo_interno: e.target.value })}
                  placeholder="P001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Barras
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.codigo_barras || ""}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                  placeholder="1234567890123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.nombre || ""}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre del producto"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.descripcion || ""}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del producto"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.costo || ""}
                  onChange={(e) => setFormData({ ...formData, costo: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Venta
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.precio_venta || ""}
                  onChange={(e) => setFormData({ ...formData, precio_venta: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Actual
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.stock_actual || ""}
                  onChange={(e) => setFormData({ ...formData, stock_actual: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.stock_minimo || ""}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.categoria || ""}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Categoría del producto"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={saving || !formData.nombre?.trim()}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
