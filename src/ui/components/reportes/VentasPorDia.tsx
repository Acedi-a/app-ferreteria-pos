import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

export interface VentasDiaRow {
  fecha: string;
  ventas: number;
  total: number;
  promedio: number;
}

export function VentasPorDia({ datos }: { datos: VentasDiaRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por Día</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Ventas</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Promedio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datos.map((day, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(day.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{day.ventas}</TableCell>
                <TableCell className="font-medium">Bs {day.total.toFixed(2)}</TableCell>
                <TableCell>Bs {day.promedio.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
