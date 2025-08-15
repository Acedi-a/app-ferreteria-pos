import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/Table";

export interface MargenProductoRow {
  producto: string;
  unidad: string | null;
  vendidos: number;
  ingresos: number;
  costo_promedio: number;
  costo_estimado: number;
  margen: number;
  margen_pct: number;
}

interface Props { rows: MargenProductoRow[]; }

export const MargenPorProducto: React.FC<Props> = ({ rows }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Margen por producto</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Und.</TableHead>
              <TableHead className="text-right">Vendidos</TableHead>
              <TableHead className="text-right">Ingresos</TableHead>
              <TableHead className="text-right">Costo prom.</TableHead>
              <TableHead className="text-right">Costo est.</TableHead>
              <TableHead className="text-right">Margen</TableHead>
              <TableHead className="text-right">Margen %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={`${r.producto}-${idx}`}>
                <TableCell>{r.producto}</TableCell>
                <TableCell>{r.unidad ?? '-'}</TableCell>
                <TableCell className="text-right">{Number(r.vendidos).toFixed(3)}</TableCell>
                <TableCell className="text-right">{Number(r.ingresos).toFixed(2)}</TableCell>
                <TableCell className="text-right">{Number(r.costo_promedio).toFixed(4)}</TableCell>
                <TableCell className="text-right">{Number(r.costo_estimado).toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold">{Number(r.margen).toFixed(2)}</TableCell>
                <TableCell className="text-right">{Number(r.margen_pct).toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
