import React from "react";
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

// Margen calculation removed - cost not available in master data

export default function ProductTable({ products, loading, searchTerm, onEdit, onDelete }: ProductTableProps) {
  const [previews, setPreviews] = React.useState<Record<number, string>>({});

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const entries = await Promise.all(
        products
          .filter(p => !!p.imagen_url && !!p.id)
          .map(async (p) => {
            const src = p.imagen_url as string;
            if (src.startsWith('file://')) {
              const data = await window.electronAPI.imageToDataUrl(src);
              return [p.id as number, data || ''] as const;
            }
            return [p.id as number, src] as const;
          })
      );
      if (!cancelled) {
        const rec: Record<number, string> = {};
        for (const [id, url] of entries) rec[id] = url;
        setPreviews(rec);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [products]);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-gray-50 rounded-lg p-6">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mb-3 mx-auto" />
          <p className="text-gray-600 text-center">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="bg-white rounded-lg p-3 mb-4 w-fit mx-auto">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium mb-1 text-center">
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
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200/50 bg-gray-50/50">
            <TableHead className="w-[15%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Código</TableHead>
            <TableHead className="w-[6%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Imagen</TableHead>
            <TableHead className="w-[22%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Producto</TableHead>
            <TableHead className="w-[10%] text-xs font-semibold text-gray-700 uppercase tracking-wider py-5 px-6">Marca</TableHead>
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
                {product.imagen_url ? (
                  <img src={(product.id && previews[product.id]) || ''} alt={product.nombre} className="w-10 h-10 object-cover rounded border" />
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-100 border" />
                )}
              </TableCell>
              <TableCell className="py-4 px-6">
                <div>
                  <div className="font-medium text-gray-900 text-sm truncate">{product.nombre}</div>
                  <div className="text-xs text-gray-500 truncate">{product.descripcion || 'Sin descripción'}</div>
                </div>
              </TableCell>
              <TableCell className="py-4 px-6 text-sm text-gray-700">
                {product.marca || '—'}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm text-gray-700">
                {product.categoria_nombre || 'Sin categoría'}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm font-medium text-gray-900">
                {typeof (product as any).costo_unitario === 'number' ? `Bs ${(product as any).costo_unitario.toFixed(2)}` : '-'}
              </TableCell>
              <TableCell className="py-4 px-6 text-sm font-medium text-gray-900">
                Bs {product.precio_venta.toFixed(2)}
              </TableCell>
              <TableCell className="py-4 px-6">
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-gray-100/80 text-gray-700 border border-gray-200/50">
                  {typeof (product as any).costo_unitario === 'number' && product.precio_venta > 0
                    ? `${(((product.precio_venta - (product as any).costo_unitario) / product.precio_venta) * 100).toFixed(1)}%`
                    : '-'}
                </span>
              </TableCell>
              <TableCell className="py-4 px-6">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {product.stock_actual ?? 0}
                  </div>
                  <div className="text-xs text-gray-500">Min: {product.stock_minimo}</div>
                </div>
              </TableCell>
              <TableCell className="py-4 px-6">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                  product.activo 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {product.activo ? "Activo" : "Inactivo"}
                </span>
              </TableCell>
              <TableCell className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => onEdit(product)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => product.id && onDelete(product.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
