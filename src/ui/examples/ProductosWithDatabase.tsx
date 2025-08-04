import { useState } from "react";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";
import { useDbQuery, useDbMutation } from "../hooks/useDatabase";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/Dialog";

interface Producto {
  id: number;
  codigo_barras?: string;
  codigo_interno?: string;
  nombre: string;
  descripcion?: string;
  costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida?: string;
  categoria?: string;
  activo: boolean;
}

export default function Productos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<Partial<Producto>>({});

  // Hook para obtener productos de la base de datos
  const { data: productos, loading, error, refetch } = useDbQuery<Producto>(
    `SELECT * FROM productos WHERE activo = 1 ${searchTerm ? 'AND (nombre LIKE ? OR codigo_barras LIKE ? OR codigo_interno LIKE ?)' : ''}`,
    searchTerm ? [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`] : []
  );

  // Hook para mutaciones (INSERT, UPDATE, DELETE)
  const { execute: executeMutation, loading: mutationLoading } = useDbMutation();

  const handleSearch = () => {
    refetch();
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
        await executeMutation(
          'UPDATE productos SET activo = 0 WHERE id = ?',
          [product.id]
        );
        refetch();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        // Actualizar producto existente
        await executeMutation(
          `UPDATE productos SET 
           nombre = ?, descripcion = ?, costo = ?, precio_venta = ?, 
           stock_actual = ?, stock_minimo = ?, unidad_medida = ?, categoria = ?
           WHERE id = ?`,
          [
            formData.nombre,
            formData.descripcion,
            formData.costo,
            formData.precio_venta,
            formData.stock_actual,
            formData.stock_minimo,
            formData.unidad_medida,
            formData.categoria,
            editingProduct.id
          ]
        );
      } else {
        // Crear nuevo producto
        await executeMutation(
          `INSERT INTO productos 
           (nombre, descripcion, costo, precio_venta, stock_actual, stock_minimo, unidad_medida, categoria, activo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            formData.nombre,
            formData.descripcion,
            formData.costo,
            formData.precio_venta,
            formData.stock_actual,
            formData.stock_minimo,
            formData.unidad_medida,
            formData.categoria
          ]
        );
      }
      
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto');
    }
  };

  const filteredProducts = productos || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando productos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
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
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos ({filteredProducts.length})</CardTitle>
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
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
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
                  <TableCell>Bs {product.precio_venta?.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{product.stock_actual}</span>
                      {product.stock_actual <= product.stock_minimo && (
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
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron productos
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
              disabled={mutationLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={mutationLoading || !formData.nombre}
            >
              {mutationLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
