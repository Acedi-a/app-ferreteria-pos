import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/Table";

export interface CompraItem {
  fecha: string;
  numero_compra: string;
  producto: string;
  unidad: string | null;
  cantidad: number;
  costo_unitario: number;
  descuento: number;
  subtotal: number;
  proveedor: string;
}

interface Props {
  items: CompraItem[];
}

export const ComprasDetalladas: React.FC<Props> = ({ items }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compras detalladas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>N° Compra</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Und.</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">C. Unit</TableHead>
              <TableHead className="text-right">Desc.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead>Proveedor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it, idx) => (
              <TableRow key={`${it.numero_compra}-${idx}`}>
                <TableCell>{it.fecha}</TableCell>
                <TableCell className="font-medium">{it.numero_compra}</TableCell>
                <TableCell>{it.producto}</TableCell>
                <TableCell>{it.unidad ?? '-'}</TableCell>
                <TableCell className="text-right">{Number(it.cantidad).toFixed(3)}</TableCell>
                <TableCell className="text-right">{Number(it.costo_unitario).toFixed(2)}</TableCell>
                <TableCell className="text-right">{Number(it.descuento).toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold">{Number(it.subtotal).toFixed(2)}</TableCell>
                <TableCell>{it.proveedor}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
