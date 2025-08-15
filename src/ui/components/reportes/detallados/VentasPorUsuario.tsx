import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/Table";

export interface VentasUsuarioRow {
  usuario: string;
  ventas: number;
  total: number;
  promedio: number;
}

interface Props { rows: VentasUsuarioRow[]; }

export const VentasPorUsuario: React.FC<Props> = ({ rows }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Ventas</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Promedio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={`${r.usuario}-${idx}`}>
                <TableCell>{r.usuario}</TableCell>
                <TableCell className="text-right">{r.ventas}</TableCell>
                <TableCell className="text-right">{Number(r.total).toFixed(2)}</TableCell>
                <TableCell className="text-right">{Number(r.promedio).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
