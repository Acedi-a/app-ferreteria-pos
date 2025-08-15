import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/Table";

export interface VentaCabecera {
  id: number;
  numero_venta: string;
  fecha: string;
  cliente: string;
  metodo_pago: string | null;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  items: number;
}

export interface VentaItem {
  fecha: string;
  numero_venta: string;
  producto: string;
  unidad: string | null;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  cliente: string;
}

interface Props {
  cabeceras: VentaCabecera[];
  items: VentaItem[];
}

export const VentasDetalladas: React.FC<Props> = ({ cabeceras, items }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas detalladas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Cabeceras</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>N° Venta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Desc.</TableHead>
                  <TableHead className="text-right">Impuestos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cabeceras.map((r) => (
                  <TableRow key={`${r.id}`}>
                    <TableCell>{r.fecha}</TableCell>
                    <TableCell className="font-medium">{r.numero_venta}</TableCell>
                    <TableCell>{r.cliente}</TableCell>
                    <TableCell>{r.metodo_pago ?? "-"}</TableCell>
                    <TableCell className="text-right">{r.subtotal.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{r.descuento.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{r.impuestos.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">{r.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{r.items}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>N° Venta</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Und.</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">P. Unit</TableHead>
                  <TableHead className="text-right">Desc.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead>Cliente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it, idx) => (
                  <TableRow key={`${it.numero_venta}-${idx}`}>
                    <TableCell>{it.fecha}</TableCell>
                    <TableCell className="font-medium">{it.numero_venta}</TableCell>
                    <TableCell>{it.producto}</TableCell>
                    <TableCell>{it.unidad ?? '-'}</TableCell>
                    <TableCell className="text-right">{Number(it.cantidad).toFixed(3)}</TableCell>
                    <TableCell className="text-right">{Number(it.precio_unitario).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{Number(it.descuento).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">{Number(it.subtotal).toFixed(2)}</TableCell>
                    <TableCell>{it.cliente}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
