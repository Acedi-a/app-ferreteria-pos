import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export interface InventarioCategoriaRow {
  categoria: string;
  productos: number;
  valor: number;
  stock_bajo: number;
}

export function InventarioPorCategoria({ datos }: { datos: InventarioCategoriaRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventario por Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Stock Bajo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datos.map((c, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{c.categoria}</TableCell>
                <TableCell>{c.productos}</TableCell>
                <TableCell className="font-medium">Bs {c.valor.toFixed(2)}</TableCell>
                <TableCell>{c.stock_bajo}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      c.stock_bajo === 0 ? 'success' : c.stock_bajo <= 2 ? 'default' : 'destructive'
                    }
                  >
                    {c.stock_bajo === 0 ? 'Óptimo' : c.stock_bajo <= 2 ? 'Atención' : 'Crítico'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
