import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/Table";

export interface CxCRow {
  id: number;
  fecha: string;
  cliente: string;
  monto: number;
  saldo: number;
  estado: string;
  fecha_vencimiento: string | null;
  pagado: number;
  dias_vencido: number | null;
  numero_venta: string | null;
}

interface Props {
  rows: CxCRow[];
}

export const CuentasPorCobrarDetalle: React.FC<Props> = ({ rows }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cuentas por cobrar</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Pagado</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Vence</TableHead>
              <TableHead className="text-right">Días venc.</TableHead>
              <TableHead>Venta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.fecha}</TableCell>
                <TableCell>{r.cliente}</TableCell>
                <TableCell className="text-right">{Number(r.monto).toFixed(2)}</TableCell>
                <TableCell className="text-right">{Number(r.pagado).toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold">{Number(r.saldo).toFixed(2)}</TableCell>
                <TableCell>{r.estado}</TableCell>
                <TableCell>{r.fecha_vencimiento ?? '-'}</TableCell>
                <TableCell className="text-right">{r.dias_vencido ?? '-'}</TableCell>
                <TableCell>{r.numero_venta ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
