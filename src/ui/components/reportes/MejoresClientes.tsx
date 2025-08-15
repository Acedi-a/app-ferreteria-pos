import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export interface ClienteRow {
  nombre: string;
  compras: number;
  total: number;
  ultima: string;
}

export function MejoresClientes({ datos }: { datos: ClienteRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mejores Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Compras</TableHead>
              <TableHead>Total Gastado</TableHead>
              <TableHead>Promedio</TableHead>
              <TableHead>Última Compra</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datos.map((client, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{client.nombre}</TableCell>
                <TableCell>{client.compras}</TableCell>
                <TableCell className="font-medium">Bs {client.total.toFixed(2)}</TableCell>
                <TableCell>Bs {(client.total / Math.max(client.compras, 1)).toFixed(2)}</TableCell>
                <TableCell className="text-slate-500">{new Date(client.ultima).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
