import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export interface TopProductoRow {
  nombre: string;
  vendidos: number;
  ingresos: number;
}

export function TopProductos({ datos }: { datos: TopProductoRow[] }) {
  const totalIngresos = datos.reduce((sum, p) => sum + p.ingresos, 0) || 1;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad Vendida</TableHead>
              <TableHead>Ingresos</TableHead>
              <TableHead>Participación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datos.map((product, index) => {
              const participacion = ((product.ingresos / totalIngresos) * 100).toFixed(1);
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{product.nombre}</TableCell>
                  <TableCell>{product.vendidos}</TableCell>
                  <TableCell className="font-medium">Bs {product.ingresos.toFixed(2)}</TableCell>
                  <TableCell>{participacion}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
