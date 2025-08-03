import { Edit, Trash2, Loader2, Package } from "lucide-react";
import { Button } from "../ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import type { Producto } from "../../services/productos-service";

interface ProductTableProps {
  products: Producto[];
  loading: boolean;
  searchTerm: string;
  onEdit: (product: Producto) => void;
  onDelete: (id: number) => void;
}

const calcMargen = (costo: number, precio: number) =>
  costo === 0 ? "0" : (((precio - costo) / costo) * 100).toFixed(1);

export default function ProductTable({ products, loading, searchTerm, onEdit, onDelete }: ProductTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-6">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4 mx-auto" />
          <p className="text-gray-600 font-medium text-center">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-gray-100/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50">
          <div className="bg-white/80 rounded-2xl p-4 mb-6 w-fit mx-auto">
            <Package className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-gray-700 font-medium mb-2 text-center">
            {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
          </p>
          <p className="text-gray-500 text-sm text-center">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer producto'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200/50 bg-gray-50/50">
            <TableHead className="w-[15%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Código</TableHead>
            <TableHead className="w-[25%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Producto</TableHead>
            <TableHead className="w-[12%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Categoría</TableHead>
            <TableHead className="w-[10%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Costo</TableHead>
            <TableHead className="w-[10%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Precio</TableHead>
            <TableHead className="w-[8%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Margen</TableHead>
            <TableHead className="w-[10%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Stock</TableHead>
            <TableHead className="w-[8%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Estado</TableHead>
            <TableHead className="w-[12%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="border-gray-200/50 hover:bg-gray-50/50 transition-all duration-200">
              <TableCell className="py-4 px-6">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{product.codigo_interno}</div>
                  <div className="text-xs text-gray-500">{product.codigo_barras || 'Sin código'}</div>
                </div>
              </TableCell>
              <TableCell className="py-4 px-6">
                <div>
                  <div className="font-medium text-gray-900 text-sm truncate">{product.nombre}</div>
                  <div className="text-xs text-gray-500 truncate">{product.descripcion || 'Sin descripción'}</div>
                </div>
              </TableCell>
              <TableCell className="py-4 px-6 text-sm text-gray-700">
                {product.categoria_nombre || 'Sin categoría'}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm font-medium text-gray-900">
                ${product.costo.toFixed(2)}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm font-medium text-gray-900">
                ${product.precio_venta.toFixed(2)}
              </TableCell>
              <TableCell className="py-4 px-6">
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-gray-100/80 text-gray-700 border border-gray-200/50">
                  {calcMargen(product.costo, product.precio_venta)}%
                </span>
              </TableCell>
              <TableCell className="py-4 px-6">
                <div>
                  <div className={`text-sm font-medium ${
                    product.stock_actual <= product.stock_minimo 
                      ? "text-red-600" 
                      : "text-gray-900"
                  }`}>
                    {product.stock_actual}
                  </div>
                  <div className="text-xs text-gray-500">Min: {product.stock_minimo}</div>
                </div>
              </TableCell>
              <TableCell className="py-4 px-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium border ${
                  product.activo 
                    ? "bg-green-50/80 text-green-700 border-green-200/50" 
                    : "bg-red-50/80 text-red-700 border-red-200/50"
                }`}>
                  {product.activo ? "Activo" : "Inactivo"}
                </span>
              </TableCell>
              <TableCell className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => onEdit(product)}
                    className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100/80 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200/50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => product.id && onDelete(product.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200/50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
