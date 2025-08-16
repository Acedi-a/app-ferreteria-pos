import { Badge } from "../ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";

export interface MovementRow {
  id: number;
  producto: string;
  proveedor?: string | null;
  tipo_movimiento: "entrada" | "salida" | "ajuste";
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  fecha_movimiento: string;
  usuario?: string | null;
  tipo_unidad_abrev?: string | null;
  tipo_unidad_nombre?: string | null;
}

export function MovementsTable({ rows }: { rows: MovementRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Cantidad</TableHead>
          {/* Columnas de costo retiradas */}
          <TableHead>Stock Anterior</TableHead>
          <TableHead>Stock Nuevo</TableHead>
          <TableHead>Proveedor</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Usuario</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((mov) => {
          return (
            <TableRow key={mov.id}>
              <TableCell className="font-medium">{mov.producto}</TableCell>
              <TableCell>
                <Badge variant={mov.tipo_movimiento === "entrada" ? "success" : (mov.tipo_movimiento === "salida" ? "destructive" : "default")}>
                  {mov.tipo_movimiento}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className="font-medium">{mov.cantidad}</span>
                  <span className="text-xs text-slate-500 ml-1">
                    {mov.tipo_unidad_abrev || 'uds'}
                  </span>
                </div>
              </TableCell>
              {/* Celdas de costo retiradas */}
              <TableCell>{mov.stock_anterior}</TableCell>
              <TableCell className="font-medium">{mov.stock_nuevo}</TableCell>
              <TableCell>{mov.proveedor || '-'}</TableCell>
              <TableCell className="text-slate-500">{new Date(mov.fecha_movimiento).toLocaleString()}</TableCell>
              <TableCell className="text-slate-500">{mov.usuario}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
