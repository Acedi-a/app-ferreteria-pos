    import { Edit, Trash2, Package } from "lucide-react";
    import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
    import { Button } from "../ui/Button";
    import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
    import { Badge } from "../ui/Badge";
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
    return (
        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Lista de Productos ({products.length})
            </CardTitle>
        </CardHeader>
        <CardContent>
            {loading ? (
            <div className="flex justify-center items-center py-8">
                <div className="text-slate-500">Cargando productos...</div>
            </div>
            ) : products.length === 0 ? (
            <div className="flex justify-center items-center py-8">
                <div className="text-slate-500">
                {searchTerm ? 'No se encontraron productos con ese criterio' : 'No hay productos registrados'}
                </div>
            </div>
            ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Margen</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {products.map((product) => (
                    <TableRow key={product.id}>
                    <TableCell>
                        <div>
                        <div className="font-medium">{product.codigo_interno}</div>
                        <div className="text-xs text-slate-500">{product.codigo_barras || 'Sin código'}</div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div>
                        <div className="font-medium">{product.nombre}</div>
                        <div className="text-xs text-slate-500">{product.descripcion || 'Sin descripción'}</div>
                        
                        </div>
                    </TableCell>
                    <TableCell>{product.categoria_nombre || 'Sin categoría'}</TableCell>
                    <TableCell>${product.costo.toFixed(2)}</TableCell>
                    <TableCell>${product.precio_venta.toFixed(2)}</TableCell>
                    <TableCell>
                        <Badge>
                        {calcMargen(product.costo, product.precio_venta)}%
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div>
                        <div className={product.stock_actual <= product.stock_minimo ? "text-red-600 font-medium" : ""}>
                            {product.stock_actual}
                        </div>
                        <div className="text-xs text-slate-500">Min: {product.stock_minimo}</div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={product.activo ? "success" : "destructive"}>
                        {product.activo ? "Activo" : "Inactivo"}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            onClick={() => onEdit(product)}
                            className="h-12 w-12 p-0"
                        >
                            <Edit className="h-10 w-10 text-stone-700" />
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => product.id && onDelete(product.id)}
                            className="h-12 w-12 p-0"
                        >
                            <Trash2 className="h-10 w-10 text-red-700" />
                        </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            )}
        </CardContent>
        </Card>
    );
}
